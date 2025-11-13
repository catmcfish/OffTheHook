# Deployment Guide for Google Cloud Run

## Quick Start

### 1. Prerequisites
- Google Cloud account with billing enabled
- Firebase project created
- Google Cloud SDK installed (`gcloud`)

### 2. Firebase Setup

1. **Create Firebase Project**
   ```bash
   # Go to https://console.firebase.google.com/
   # Create a new project
   ```

2. **Enable Firestore**
   - In Firebase Console, go to Firestore Database
   - Click "Create database"
   - Start in **production mode**
   - Choose a location (e.g., `us-central1`)

3. **Create Service Account**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `firebase-admin-key.json` in the project root
   - **DO NOT commit this file to git!**

### 3. Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variable:**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="./firebase-admin-key.json"
   ```

3. **Run server:**
   ```bash
   npm start
   # Server runs on http://localhost:8080
   ```

### 4. Deploy to Cloud Run

#### Option A: Using Cloud Build (Recommended)

1. **Enable required APIs:**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

2. **Create Secret Manager secret:**
   ```bash
   gcloud secrets create firebase-admin-key --data-file=firebase-admin-key.json
   ```

3. **Grant Cloud Run access:**
   ```bash
   # Get your project number
   PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
   
   # Grant access
   gcloud secrets add-iam-policy-binding firebase-admin-key \
     --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

4. **Update cloudbuild.yaml** to mount the secret:
   ```yaml
   # In the deploy step, add:
   - '--set-secrets=GOOGLE_APPLICATION_CREDENTIALS=firebase-admin-key:latest'
   ```

5. **Deploy:**
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

#### Option B: Manual Docker Deployment

1. **Build Docker image:**
   ```bash
   docker build -t gcr.io/YOUR_PROJECT_ID/fishing-game .
   ```

2. **Push to Container Registry:**
   ```bash
   docker push gcr.io/YOUR_PROJECT_ID/fishing-game
   ```

3. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy fishing-game \
     --image gcr.io/YOUR_PROJECT_ID/fishing-game \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-secrets=GOOGLE_APPLICATION_CREDENTIALS=firebase-admin-key:latest \
     --memory 512Mi \
     --cpu 1
   ```

### 5. Update API URL (if needed)

If your Cloud Run URL is different from the origin, update `public/config.js`:

```javascript
const API_BASE_URL = 'https://your-service-url.run.app';
```

Then rebuild and redeploy.

## Firestore Security Rules

Add these rules to Firestore for security:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only server can write
    match /users/{userId} {
      allow read: if false; // No client reads
      allow write: if false; // Only server writes
    }
    
    // User data - only server can write
    match /userData/{userId} {
      allow read: if false;
      allow write: if false;
    }
    
    // Leaderboard - read only for clients
    match /leaderboard/{entryId} {
      allow read: if true;
      allow write: if false; // Only server writes
    }
  }
}
```

## Environment Variables

- `PORT` - Server port (default: 8080, Cloud Run sets this automatically)
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Firebase credentials (set via Secret Manager in Cloud Run)
- `NODE_ENV` - Set to "production" in Cloud Run

## Monitoring

- View logs: `gcloud run services logs read fishing-game --region us-central1`
- View in console: https://console.cloud.google.com/run

## Troubleshooting

1. **Firebase Admin not initialized:**
   - Ensure `firebase-admin-key.json` is in Secret Manager
   - Check Cloud Run service account has access to the secret

2. **CORS errors:**
   - Ensure CORS middleware is enabled in `server.js`
   - Check Cloud Run allows unauthenticated requests

3. **Data not persisting:**
   - Verify Firestore is enabled and rules are set
   - Check Cloud Run logs for errors

