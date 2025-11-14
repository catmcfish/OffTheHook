// Firebase initialization utilities
const admin = require('firebase-admin');
const fs = require('fs');

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'offthehook-70d8a';

let db;

function initializeFirebase() {
    try {
        if (admin.apps.length === 0) {
            // Check if credentials are provided via Secret Manager (mounted as file)
            const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
            if (credsPath && fs.existsSync(credsPath)) {
                console.log('Loading Firebase credentials from:', credsPath);
                const serviceAccount = require(credsPath);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    projectId: FIREBASE_PROJECT_ID
                });
                console.log(`Firebase initialized with service account file for project: ${FIREBASE_PROJECT_ID}`);
            } else {
                // Use default credentials (works on Cloud Run with service account)
                console.log(`Initializing Firebase with default credentials for project: ${FIREBASE_PROJECT_ID}`);
                admin.initializeApp({
                    projectId: FIREBASE_PROJECT_ID
                });
            }
        }
        db = admin.firestore();
        console.log(`Firestore database initialized successfully for project: ${FIREBASE_PROJECT_ID}`);
        return db;
    } catch (error) {
        console.error('FATAL: Failed to initialize Firebase Admin:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack,
            projectId: FIREBASE_PROJECT_ID
        });
        // Don't exit - let the server start so we can return proper error messages
        return null;
    }
}

function getDb() {
    return db;
}

function checkFirestore() {
    if (!db) {
        throw new Error('FIRESTORE_NOT_INITIALIZED');
    }
}

module.exports = {
    initializeFirebase,
    getDb,
    checkFirestore,
    admin
};

