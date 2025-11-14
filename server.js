const express = require('express');
const cors = require('cors');
const fs = require('fs');

// Initialize Firebase
const { initializeFirebase, getDb, checkFirestore } = require('./server/utils/firebase');
const { sendErrorResponse } = require('./server/utils/errors');

// Initialize Firebase
initializeFirebase();

const expressApp = express();
const PORT = process.env.PORT || 8080;

// Middleware
expressApp.use(cors());
expressApp.use(express.json());

// API Routes
const authRoutes = require('./server/routes/auth');
const userDataRoutes = require('./server/routes/userData');
const leaderboardRoutes = require('./server/routes/leaderboard');

expressApp.use('/api/register', authRoutes);
expressApp.use('/api/login', authRoutes);
expressApp.use('/api/user-data', userDataRoutes);
expressApp.use('/api/leaderboard', leaderboardRoutes);

// API Routes are now handled by modular route files

// Health check with Firestore connectivity test
expressApp.get('/health', async (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        firestore: 'unknown'
    };
    
    const db = getDb();
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

// Determine if we're in Docker (public exists) or local dev (root files)
const publicDir = fs.existsSync('public') ? 'public' : '.';

// Explicitly serve index.html at root
expressApp.get('/', (req, res) => {
    res.sendFile('index.html', { root: publicDir });
});

// Serve static files (CSS, JS, images, etc.)
expressApp.use(express.static(publicDir));

// Serve index.html for all non-API routes (SPA routing)
expressApp.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
        return next();
    }
    // Serve index.html for all other routes
    res.sendFile('index.html', { root: publicDir }, (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).send('Error loading page');
        }
    });
});

expressApp.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

