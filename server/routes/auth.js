// Authentication routes
const express = require('express');
const router = express.Router();
const { getDb, checkFirestore } = require('../utils/firebase');
const { hashPassword } = require('../utils/auth');
const { sendErrorResponse } = require('../utils/errors');
const admin = require('../utils/firebase').admin;

// Register new user
router.post('/register', async (req, res) => {
    try {
        checkFirestore();
        const db = getDb();
        
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

        // Initialize user game data with default settings
        console.log(`Initializing game data for: ${username}`);
        await db.collection('userData').doc(username).set({
            username: username,
            gold: 0,
            fishCount: 0,
            inventory: [],
            settings: {
                rainEnabled: true,
                grassEnabled: true
            },
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
        sendErrorResponse(res, error);
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        checkFirestore();
        const db = getDb();
        
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
        sendErrorResponse(res, error);
    }
});

module.exports = router;

