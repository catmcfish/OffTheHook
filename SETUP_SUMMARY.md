# Setup Summary

## What Was Changed

Your fishing game has been updated to use **persistent storage** with Google Cloud Run and Firestore.

### Backend (New)
- **server.js** - Express.js API server with endpoints for:
  - User registration/login
  - User data storage/retrieval
  - Leaderboard management
- **package.json** - Node.js dependencies
- **Dockerfile** - Container configuration for Cloud Run
- **cloudbuild.yaml** - Automated deployment configuration

### Frontend (Updated)
- **game.js** - Updated to use API calls instead of localStorage
- **config.js** - API configuration (uses same origin by default)
- All frontend files copied to `public/` directory

### Storage
- **Firestore Collections:**
  - `users` - User accounts (username, passwordHash)
  - `userData` - Game data (gold, fishCount, inventory)
  - `leaderboard` - Top 100 fish entries

## Next Steps

1. **Set up Firebase:**
   - Create Firebase project
   - Enable Firestore
   - Download service account key as `firebase-admin-key.json`

2. **Test locally:**
   ```bash
   npm install
   export GOOGLE_APPLICATION_CREDENTIALS="./firebase-admin-key.json"
   npm start
   ```

3. **Deploy to Cloud Run:**
   - Follow instructions in `DEPLOYMENT.md`
   - Or use: `gcloud builds submit --config cloudbuild.yaml`

## Important Notes

- **Passwords are hashed** using SHA-256 (consider upgrading to bcrypt)
- **Data persists** across sessions and devices
- **Leaderboard updates** are shared across all users
- **CORS is enabled** for all origins (restrict in production)

## File Structure

```
.
├── server.js              # Backend API server
├── package.json           # Node.js dependencies
├── Dockerfile             # Container config
├── cloudbuild.yaml        # Deployment config
├── public/                # Frontend files
│   ├── index.html
│   ├── game.js
│   ├── style.css
│   └── config.js          # API URL config
├── DEPLOYMENT.md          # Deployment guide
└── README.md              # Setup instructions
```

