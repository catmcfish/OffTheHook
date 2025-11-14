// User data routes
const express = require('express');
const router = express.Router();
const { getDb, checkFirestore } = require('../utils/firebase');
const { sendErrorResponse } = require('../utils/errors');
const admin = require('../utils/firebase').admin;

// Get user game data
router.get('/:username', async (req, res) => {
    try {
        checkFirestore();
        const db = getDb();
        
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
        sendErrorResponse(res, error);
    }
});

// Save user game data
router.post('/:username', async (req, res) => {
    try {
        checkFirestore();
        const db = getDb();
        
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
        const userDataUpdate = {
            username: username,
            gold: gold || 0,
            fishCount: fishCount || 0,
            inventory: inventory || [],
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Include settings if provided
        if (req.body.settings) {
            userDataUpdate.settings = req.body.settings;
        }
        
        await db.collection('userData').doc(username).set(userDataUpdate, { merge: true });

        res.json({ success: true });
    } catch (error) {
        console.error('Save user data error:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        sendErrorResponse(res, error);
    }
});

module.exports = router;

