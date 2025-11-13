const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const crypto = require('crypto');
const fs = require('fs');

// Initialize Firebase Admin with better error handling
let db;
try {
    if (admin.apps.length === 0) {
        // Check if credentials are provided via Secret Manager (mounted as file)
        const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (credsPath && fs.existsSync(credsPath)) {
            console.log('Loading Firebase credentials from:', credsPath);
            const serviceAccount = require(credsPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase initialized with service account file');
        } else {
            // Use default credentials (works on Cloud Run with service account)
            console.log('Initializing Firebase with default credentials (Cloud Run service account)');
            admin.initializeApp();
        }
    }
    db = admin.firestore();
    console.log('Firestore database initialized successfully');
} catch (error) {
    console.error('FATAL: Failed to initialize Firebase Admin:', error);
    console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
    });
    // Don't exit - let the server start so we can return proper error messages
}

const expressApp = express();
const PORT = process.env.PORT || 8080;

// Middleware
expressApp.use(cors());
expressApp.use(express.json());

// Helper function to hash passwords
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper function to check if Firestore is initialized
function checkFirestore() {
    if (!db) {
        throw new Error('FIRESTORE_NOT_INITIALIZED');
    }
}

// Helper function to format errors with codes
function formatError(error, defaultCode = 'UNKNOWN_ERROR') {
    const errorCode = error.code || error.message || defaultCode;
    const errorMessage = error.message || 'An unexpected error occurred';
    
    // Map common Firebase errors to user-friendly messages
    const errorMap = {
        'FIRESTORE_NOT_INITIALIZED': {
            code: 'FIRESTORE_NOT_INITIALIZED',
            message: 'Database connection failed. Please check server configuration.',
            status: 503
        },
        'permission-denied': {
            code: 'PERMISSION_DENIED',
            message: 'Database permission denied. Please check Firestore security rules.',
            status: 403
        },
        'unauthenticated': {
            code: 'UNAUTHENTICATED',
            message: 'Authentication failed. Please check Firebase credentials.',
            status: 401
        },
        'not-found': {
            code: 'NOT_FOUND',
            message: 'Resource not found.',
            status: 404
        },
        'already-exists': {
            code: 'ALREADY_EXISTS',
            message: 'Resource already exists.',
            status: 409
        }
    };
    
    const mappedError = errorMap[errorCode] || {
        code: errorCode,
        message: errorMessage,
        status: 500
    };
    
    return {
        success: false,
        error: mappedError.message,
        errorCode: mappedError.code,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
}

// API Routes

// Register new user
expressApp.post('/api/register', async (req, res) => {
    try {
        checkFirestore();
        
        const { username, password, passwordConfirm } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username and password are required',
                errorCode: 'MISSING_FIELDS'
            });
        }

        if (password !== passwordConfirm) {
            return res.status(400).json({ 
                success: false, 
                error: 'Passwords do not match',
                errorCode: 'PASSWORD_MISMATCH'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                error: 'Password must be at least 6 characters',
                errorCode: 'PASSWORD_TOO_SHORT'
            });
        }

        // Check if user exists
        console.log(`Checking if user exists: ${username}`);
        const userRef = db.collection('users').doc(username);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username already exists',
                errorCode: 'USERNAME_EXISTS'
            });
        }

        // Create user
        console.log(`Creating user: ${username}`);
        const passwordHash = hashPassword(password);
        await userRef.set({
            username: username,
            passwordHash: passwordHash,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`User created: ${username}`);

        // Initialize user game data
        console.log(`Initializing game data for: ${username}`);
        await db.collection('userData').doc(username).set({
            username: username,
            gold: 0,
            fishCount: 0,
            inventory: [],
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Game data initialized for: ${username}`);

        res.json({ success: true });
    } catch (error) {
        console.error('Register error:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        const formattedError = formatError(error);
        res.status(formattedError.status || 500).json(formattedError);
    }
});

// Login
expressApp.post('/api/login', async (req, res) => {
    try {
        checkFirestore();
        
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username and password are required',
                errorCode: 'MISSING_FIELDS'
            });
        }

        console.log(`Login attempt for user: ${username}`);
        const userRef = db.collection('users').doc(username);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.log(`User not found: ${username}`);
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid username or password',
                errorCode: 'INVALID_CREDENTIALS'
            });
        }

        const userData = userDoc.data();
        const passwordHash = hashPassword(password);

        if (userData.passwordHash !== passwordHash) {
            console.log(`Invalid password for user: ${username}`);
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid username or password',
                errorCode: 'INVALID_CREDENTIALS'
            });
        }

        console.log(`Login successful for user: ${username}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Login error:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        const formattedError = formatError(error);
        res.status(formattedError.status || 500).json(formattedError);
    }
});

// Get user game data
expressApp.get('/api/user-data/:username', async (req, res) => {
    try {
        checkFirestore();
        
        const { username } = req.params;

        const userDataRef = db.collection('userData').doc(username);
        const userDataDoc = await userDataRef.get();

        if (!userDataDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                error: 'User data not found',
                errorCode: 'USER_DATA_NOT_FOUND'
            });
        }

        const userData = userDataDoc.data();
        // Remove sensitive fields if any
        delete userData.updatedAt;

        res.json({ success: true, data: userData });
    } catch (error) {
        console.error('Get user data error:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        const formattedError = formatError(error);
        res.status(formattedError.status || 500).json(formattedError);
    }
});

// Save user game data
expressApp.post('/api/user-data/:username', async (req, res) => {
    try {
        checkFirestore();
        
        const { username } = req.params;
        const { gold, fishCount, inventory } = req.body;

        // Validate user exists
        const userRef = db.collection('users').doc(username);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found',
                errorCode: 'USER_NOT_FOUND'
            });
        }

        // Update user data
        await db.collection('userData').doc(username).set({
            username: username,
            gold: gold || 0,
            fishCount: fishCount || 0,
            inventory: inventory || [],
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        res.json({ success: true });
    } catch (error) {
        console.error('Save user data error:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        const formattedError = formatError(error);
        res.status(formattedError.status || 500).json(formattedError);
    }
});

// Get leaderboard
expressApp.get('/api/leaderboard', async (req, res) => {
    try {
        checkFirestore();
        
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
        console.error('Get leaderboard error:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        const formattedError = formatError(error);
        res.status(formattedError.status || 500).json(formattedError);
    }
});

// Update leaderboard
expressApp.post('/api/leaderboard', async (req, res) => {
    try {
        checkFirestore();
        
        const { username, fish } = req.body;

        if (!username || !fish) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username and fish data required',
                errorCode: 'MISSING_FIELDS'
            });
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
        console.error('Update leaderboard error:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        const formattedError = formatError(error);
        res.status(formattedError.status || 500).json(formattedError);
    }
});

// Health check with Firestore connectivity test
expressApp.get('/health', async (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        firestore: 'unknown'
    };
    
    if (!db) {
        health.status = 'degraded';
        health.firestore = 'not_initialized';
        return res.status(503).json(health);
    }
    
    try {
        // Test Firestore connectivity with a simple read
        // Use a collection that might exist (users) or create a test doc
        const testRef = db.collection('users').limit(1);
        await testRef.get();
        health.firestore = 'connected';
        res.json(health);
    } catch (error) {
        health.status = 'degraded';
        health.firestore = 'error';
        health.firestoreError = error.message;
        health.firestoreErrorCode = error.code;
        
        // Provide helpful error messages
        if (error.code === 5 || error.message.includes('NOT_FOUND')) {
            health.help = 'Firestore database not created. Create it in Firebase Console: https://console.firebase.google.com/';
        } else if (error.code === 7 || error.message.includes('PERMISSION_DENIED')) {
            health.help = 'Firestore API not enabled or permissions missing. Enable API and check service account permissions.';
        }
        
        res.status(503).json(health);
    }
});

// Explicitly serve index.html at root
expressApp.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

// Serve static files (CSS, JS, images, etc.)
expressApp.use(express.static('public'));

// Serve index.html for all non-API routes (SPA routing)
expressApp.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
        return next();
    }
    // Serve index.html for all other routes
    res.sendFile('index.html', { root: 'public' }, (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).send('Error loading page');
        }
    });
});

expressApp.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

