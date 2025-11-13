const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const crypto = require('crypto');
const fs = require('fs');

// Initialize Firebase Admin
// In Cloud Run, credentials are automatically loaded from the environment
// For local development, set GOOGLE_APPLICATION_CREDENTIALS environment variable
if (admin.apps.length === 0) {
    // Check if credentials are provided via Secret Manager (mounted as file)
    const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (credsPath && require('fs').existsSync(credsPath)) {
        const serviceAccount = require(credsPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        // Use default credentials (works on Cloud Run with service account)
        admin.initializeApp();
    }
}
const db = admin.firestore();

const expressApp = express();
const PORT = process.env.PORT || 8080;

// Middleware
expressApp.use(cors());
expressApp.use(express.json());

// Helper function to hash passwords
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// API Routes

// Register new user
expressApp.post('/api/register', async (req, res) => {
    try {
        const { username, password, passwordConfirm } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password are required' });
        }

        if (password !== passwordConfirm) {
            return res.status(400).json({ success: false, error: 'Passwords do not match' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const userRef = db.collection('users').doc(username);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            return res.status(400).json({ success: false, error: 'Username already exists' });
        }

        // Create user
        const passwordHash = hashPassword(password);
        await userRef.set({
            username: username,
            passwordHash: passwordHash,
            createdAt: new Date()
        });

        // Initialize user game data
        await db.collection('userData').doc(username).set({
            username: username,
            gold: 0,
            fishCount: 0,
            inventory: [],
            updatedAt: new Date()
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Login
expressApp.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password are required' });
        }

        const userRef = db.collection('users').doc(username);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(401).json({ success: false, error: 'Invalid username or password' });
        }

        const userData = userDoc.data();
        const passwordHash = hashPassword(password);

        if (userData.passwordHash !== passwordHash) {
            return res.status(401).json({ success: false, error: 'Invalid username or password' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get user game data
expressApp.get('/api/user-data/:username', async (req, res) => {
    try {
        const { username } = req.params;

        const userDataRef = db.collection('userData').doc(username);
        const userDataDoc = await userDataRef.get();

        if (!userDataDoc.exists) {
            return res.status(404).json({ success: false, error: 'User data not found' });
        }

        const userData = userDataDoc.data();
        // Remove sensitive fields if any
        delete userData.updatedAt;

        res.json({ success: true, data: userData });
    } catch (error) {
        console.error('Get user data error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Save user game data
expressApp.post('/api/user-data/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { gold, fishCount, inventory } = req.body;

        // Validate user exists
        const userRef = db.collection('users').doc(username);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Update user data
        await db.collection('userData').doc(username).set({
            username: username,
            gold: gold || 0,
            fishCount: fishCount || 0,
            inventory: inventory || [],
            updatedAt: new Date()
        }, { merge: true });

        res.json({ success: true });
    } catch (error) {
        console.error('Save user data error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get leaderboard
expressApp.get('/api/leaderboard', async (req, res) => {
    try {
        const leaderboardRef = db.collection('leaderboard');
        const snapshot = await leaderboardRef
            .orderBy('fishValue', 'desc')
            .limit(100)
            .get();

        const leaderboard = [];
        snapshot.forEach(doc => {
            leaderboard.push(doc.data());
        });

        res.json({ success: true, leaderboard });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Update leaderboard
expressApp.post('/api/leaderboard', async (req, res) => {
    try {
        const { username, fish } = req.body;

        if (!username || !fish) {
            return res.status(400).json({ success: false, error: 'Username and fish data required' });
        }

        // Get current leaderboard
        const leaderboardRef = db.collection('leaderboard');
        const userEntryQuery = await leaderboardRef
            .where('username', '==', username)
            .limit(1)
            .get();

        // Check if user already has an entry
        let userEntry = null;
        userEntryQuery.forEach(doc => {
            userEntry = { id: doc.id, ...doc.data() };
        });

        // Get current top 100 to check if this fish qualifies
        const top100Query = await leaderboardRef
            .orderBy('fishValue', 'desc')
            .limit(100)
            .get();

        const top100 = [];
        top100Query.forEach(doc => {
            top100.push(doc.data());
        });

        // Determine if we should update
        const shouldUpdate = !userEntry ||
            fish.value > userEntry.fishValue ||
            top100.length < 100 ||
            (top100.length >= 100 && fish.value > top100[top100.length - 1].fishValue);

        if (shouldUpdate) {
            // Remove old entry if exists
            if (userEntry) {
                await leaderboardRef.doc(userEntry.id).delete();
            }

            // Add new entry
            await leaderboardRef.add({
                username: username,
                fishName: fish.type,
                fishRarity: fish.rarity,
                fishSize: fish.size,
                fishValue: fish.value,
                fishRarityColor: fish.rarityColor,
                timestamp: new Date()
            });

            // Clean up entries beyond top 100 (optional, can be done via scheduled function)
            const allEntriesQuery = await leaderboardRef
                .orderBy('fishValue', 'desc')
                .get();

            const allEntries = [];
            allEntriesQuery.forEach(doc => {
                allEntries.push({ id: doc.id, ...doc.data() });
            });

            // Delete entries beyond top 100
            if (allEntries.length > 100) {
                const toDelete = allEntries.slice(100);
                const batch = db.batch();
                toDelete.forEach(entry => {
                    batch.delete(leaderboardRef.doc(entry.id));
                });
                await batch.commit();
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Update leaderboard error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Health check
expressApp.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Serve static files (for production)
if (process.env.NODE_ENV === 'production') {
    expressApp.use(express.static('public'));
}

expressApp.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

