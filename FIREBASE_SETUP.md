# Firebase Setup Guide for OffTheHook

## Step 1: Enable Firestore Database

1. Go to your Firebase Console: https://console.firebase.google.com/
2. Select your **OffTheHook** project
3. In the left sidebar, click on **"Firestore Database"**
4. Click **"Create database"**
5. Choose **"Start in production mode"** (we'll set security rules later)
6. Select a location (choose one close to your users, e.g., `us-central1`)
7. Click **"Enable"**

## Step 2: Get Service Account Key (for Backend)

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Go to the **"Service accounts"** tab
4. Click **"Generate new private key"**
5. A JSON file will download - this is your `firebase-admin-key.json`
6. **IMPORTANT:** Save this file in your project root directory (same folder as `server.js`)
7. **DO NOT commit this file to git!** (It's already in `.gitignore`)

## Step 3: Set Up Firestore Security Rules

1. In Firebase Console, go to **Firestore Database**
2. Click on the **"Rules"** tab
3. Replace the rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only server can access
    match /users/{userId} {
      allow read: if false;
      allow write: if false;
    }
    
    // User data - only server can access
    match /userData/{userId} {
      allow read: if false;
      allow write: if false;
    }
    
    // Leaderboard - read only for clients (optional, server handles writes)
    match /leaderboard/{entryId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

4. Click **"Publish"**

## Step 4: Test Locally

1. Make sure `firebase-admin-key.json` is in your project root
2. Set the environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="./firebase-admin-key.json"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open http://localhost:8080 in your browser
6. Try registering a new user - it should work!

## Step 5: Deploy to Cloud Run

### Option A: Using Secret Manager (Recommended)

1. **Create the secret:**
   ```bash
   gcloud secrets create firebase-admin-key --data-file=firebase-admin-key.json
   ```

2. **Grant Cloud Run access:**
   ```bash
   PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
   
   gcloud secrets add-iam-policy-binding firebase-admin-key \
     --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. **Deploy:**
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

### Option B: Using Default Service Account (Simpler)

If you want to use Cloud Run's default service account with Firestore permissions:

1. **Grant Firestore permissions to Cloud Run service account:**
   ```bash
   PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
   
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
     --role="roles/datastore.user"
   ```

2. **Update cloudbuild.yaml** to remove the secret mount (or leave it - the code handles both)

3. **Deploy:**
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

## Your Firebase Project Details

From the image you shared:
- **Project ID:** `offthehook-70d8a`
- **Project Name:** OffTheHook

## Troubleshooting

### "Permission denied" errors:
- Make sure Firestore is enabled
- Check that service account has proper permissions
- Verify `firebase-admin-key.json` is in the correct location

### "Collection not found" errors:
- This is normal - Firestore creates collections automatically when you write to them
- Collections will appear after first data write

### Local testing issues:
- Make sure `GOOGLE_APPLICATION_CREDENTIALS` environment variable is set
- Verify `firebase-admin-key.json` file exists and is valid JSON
- Check that Firestore is enabled in Firebase Console

## What Gets Stored in Firestore

Once running, you'll see these collections:
- **users** - User accounts (username, passwordHash)
- **userData** - Game data (gold, fishCount, inventory)
- **leaderboard** - Top 100 fish entries

All data persists across sessions and is shared across all users!

