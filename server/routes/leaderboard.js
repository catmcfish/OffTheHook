// Leaderboard routes
const express = require('express');
const router = express.Router();
const { getDb, checkFirestore } = require('../utils/firebase');
const { sendErrorResponse } = require('../utils/errors');
const admin = require('../utils/firebase').admin;

// Get leaderboard - top 10 most valuable fish server-wide
router.get('/', async (req, res) => {
    try {
        checkFirestore();
        const db = getDb();
        
        const leaderboardRef = db.collection('leaderboard');
        const snapshot = await leaderboardRef
            .orderBy('fishValue', 'desc')
            .limit(10)
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
        sendErrorResponse(res, error);
    }
});

// Update leaderboard
router.post('/', async (req, res) => {
    try {
        checkFirestore();
        const db = getDb();
        
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

        // Get current top 10 to check if this fish qualifies for leaderboard
        const top10Query = await leaderboardRef
            .orderBy('fishValue', 'desc')
            .limit(10)
            .get();

        const top10 = [];
        top10Query.forEach(doc => {
            top10.push(doc.data());
        });

        // Get all entries to check threshold (we maintain top 100 in DB for buffer)
        const allEntriesQuery = await leaderboardRef
            .orderBy('fishValue', 'desc')
            .limit(100)
            .get();

        const allEntries = [];
        allEntriesQuery.forEach(doc => {
            allEntries.push(doc.data());
        });

        // Determine if we should update:
        // 1. User has no entry yet AND (there are fewer than 10 entries OR fish qualifies for top 10)
        // 2. User has an entry AND the new fish is better than their current entry
        const minTop10Value = top10.length >= 10 ? top10[top10.length - 1].fishValue : 0;
        const qualifiesForTop10 = top10.length < 10 || fish.value > minTop10Value;
        
        let shouldUpdate = false;
        if (!userEntry) {
            // User has no entry - only add if it qualifies for top 10 or there's room
            shouldUpdate = qualifiesForTop10;
        } else {
            // User has an entry - only update if new fish is better
            shouldUpdate = fish.value > userEntry.fishValue;
        }

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
        sendErrorResponse(res, error);
    }
});

// Refresh leaderboard - rebuild from all user data (admin only)
router.post('/refresh', async (req, res) => {
    try {
        checkFirestore();
        const db = getDb();
        
        // Get all user data
        const userDataRef = db.collection('userData');
        const userDataSnapshot = await userDataRef.get();
        
        // Collect each user's most valuable fish
        const userBestFish = [];
        
        userDataSnapshot.forEach(doc => {
            const userData = doc.data();
            const username = userData.username || doc.id;
            const inventory = userData.inventory || [];
            
            // Find most valuable fish for this user
            if (inventory.length > 0) {
                const bestFish = inventory.reduce((max, fish) => {
                    return (fish.value > max.value) ? fish : max;
                }, inventory[0]);
                
                userBestFish.push({
                    username: username,
                    fish: bestFish
                });
            }
        });
        
        // Sort by fish value descending
        userBestFish.sort((a, b) => b.fish.value - a.fish.value);
        
        // Take top 10
        const top10 = userBestFish.slice(0, 10);
        
        // Clear existing leaderboard
        const leaderboardRef = db.collection('leaderboard');
        const existingSnapshot = await leaderboardRef.get();
        const batch = db.batch();
        
        existingSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        // Add top 10 entries
        const addBatch = db.batch();
        top10.forEach(entry => {
            const newRef = leaderboardRef.doc();
            addBatch.set(newRef, {
                username: entry.username,
                fishName: entry.fish.type,
                fishRarity: entry.fish.rarity,
                fishSize: entry.fish.size,
                fishValue: entry.fish.value,
                fishRarityColor: entry.fish.rarityColor,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        await addBatch.commit();
        
        console.log(`Leaderboard refreshed: ${top10.length} entries added`);
        
        res.json({ 
            success: true, 
            message: `Leaderboard refreshed with ${top10.length} entries`,
            entriesAdded: top10.length
        });
    } catch (error) {
        console.error('Refresh leaderboard error:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        sendErrorResponse(res, error);
    }
});

module.exports = router;

