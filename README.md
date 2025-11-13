# 8-Bit Fishing Adventure - Cloud Run Deployment

This fishing game is configured to run on Google Cloud Run with Firestore for persistent storage.

## Setup Instructions

### 1. Prerequisites
- Google Cloud account with billing enabled
- Node.js 18+ installed locally
- Google Cloud SDK (gcloud) installed
- Firebase project created

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create database"
   - Start in production mode
   - Choose a location
4. Create a service account:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `firebase-admin-key.json` (DO NOT commit this!)

### 3. Local Development Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase Admin credentials:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="./firebase-admin-key.json"
```

3. Run the server locally:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

4. The frontend should be served from `public/` directory. Update your `game.js` to use the API endpoints.

### 4. Deploy to Cloud Run

#### Option A: Using Cloud Build (Recommended)

1. Enable required APIs:
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

2. Create a Secret Manager secret for Firebase credentials:
```bash
gcloud secrets create firebase-admin-key --data-file=firebase-admin-key.json
```

3. Grant Cloud Run access to the secret:
```bash
gcloud secrets add-iam-policy-binding firebase-admin-key \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

4. Build and deploy:
```bash
gcloud builds submit --config cloudbuild.yaml
```

#### Option B: Manual Deployment

1. Build the Docker image:
```bash
docker build -t gcr.io/YOUR_PROJECT_ID/fishing-game .
```

2. Push to Container Registry:
```bash
docker push gcr.io/YOUR_PROJECT_ID/fishing-game
```

3. Deploy to Cloud Run:
```bash
gcloud run deploy fishing-game \
  --image gcr.io/YOUR_PROJECT_ID/fishing-game \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets=GOOGLE_APPLICATION_CREDENTIALS=firebase-admin-key:latest
```

### 5. Update Frontend API Configuration

Update `game.js` to use your Cloud Run URL. The API base URL should be set to your Cloud Run service URL.

## Firestore Collections

The application uses the following Firestore collections:

- `users` - User accounts (username, passwordHash)
- `userData` - User game data (gold, fishCount, inventory)
- `leaderboard` - Top 100 most valuable fish

## Environment Variables

- `PORT` - Server port (default: 8080)
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Firebase Admin SDK credentials
- `NODE_ENV` - Set to "production" for production builds

## Security Notes

- Passwords are hashed using SHA-256 (consider upgrading to bcrypt for production)
- CORS is enabled for all origins (restrict in production)
- API endpoints are unauthenticated (add authentication middleware for production)

