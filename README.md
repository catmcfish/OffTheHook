# 8-Bit Fishing Adventure

A retro-style fishing game built with HTML5 Canvas, featuring QTE (Quick Time Event) challenges, persistent user accounts, and a global leaderboard system.

## 🎮 Features

### Gameplay
- **Fishing Mechanics**: Cast your line, wait for a bite, then complete QTE challenges to catch fish
- **7 Rarity Tiers**: Common, Uncommon, Rare, Epic, Legendary, Mythical, and Universal
- **Dynamic QTE System**: Each rarity has different QTE requirements:
  - Common: 3 QTEs, 1.5s each
  - Uncommon: 4 QTEs, 1.25s each
  - Rare: 5 QTEs, 1s each
  - Epic: 6 QTEs, 0.9s each
  - Legendary: 10 QTEs, 0.9s each
  - Mythical: 20 QTEs, 0.9s each
  - Universal: 50 QTEs, 0.9s each
- **18 Unique Fish Types**: From Glowfin to Omnipotent Oarfish
- **Size Variations**: Tiny, Small, Medium, Large, and Huge fish affect value
- **Most Valuable Fish Display**: Track your best catch in the backpack

### User Features
- **User Accounts**: Register and login with encrypted passwords
- **Persistent Data**: Gold, fish count, and inventory saved to database
- **Settings System**: 
  - Toggle rain effects
  - Toggle grass/vegetation
  - Settings sync across devices
- **Global Leaderboard**: Top 100 most valuable fish across all users
- **Backpack**: View all caught fish with details

### Visual Features
- **8-Bit Pixel Art Style**: Retro aesthetic with pixelated graphics
- **Dynamic Weather**: Rain particles (toggleable)
- **Water Effects**: Animated ripples in water (when rain enabled)
- **Beach Scene**: Curved beach transitioning to ocean

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Set up Firebase credentials:**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="./firebase-admin-key.json"
```

3. **Start the server:**
```bash
npm start
```

4. **Open in browser:**
```
http://localhost:8080
```

### Prerequisites

- Node.js 18+ 
- Firebase project with Firestore enabled
- Google Cloud account (for deployment)

## 📦 Deployment

### Deploy to Google Cloud Run

1. **Enable required APIs:**
```bash
gcloud services enable firestore.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
```

2. **Create Firestore database** in Firebase Console

3. **Deploy:**
```bash
gcloud builds submit --config cloudbuild.yaml
```

See `DEPLOYMENT.md` for detailed instructions.

## 🏗️ Project Structure

```
.
├── server.js              # Express.js backend API
├── package.json           # Node.js dependencies
├── Dockerfile             # Container configuration
├── cloudbuild.yaml        # Cloud Build deployment config
├── public/                # Frontend files
│   ├── index.html         # Main HTML
│   ├── game.js            # Game logic and API calls
│   ├── style.css          # Styling
│   └── config.js          # API configuration
├── index.html             # (copied to public/)
├── game.js                # (copied to public/)
└── style.css              # (copied to public/)
```

## 🗄️ Database Schema

### Firestore Collections

- **`users`**: User accounts
  - `username` (string)
  - `passwordHash` (string, SHA-256)
  - `createdAt` (timestamp)

- **`userData`**: Game progress
  - `username` (string)
  - `gold` (number)
  - `fishCount` (number)
  - `inventory` (array of fish objects)
  - `settings` (object: `{rainEnabled, grassEnabled}`)
  - `updatedAt` (timestamp)

- **`leaderboard`**: Top 100 fish
  - `username` (string)
  - `fishName` (string)
  - `fishRarity` (string)
  - `fishSize` (string)
  - `fishValue` (number)
  - `fishRarityColor` (string)
  - `timestamp` (timestamp)

## 🎣 Game Mechanics

### Rarity System
Rarities are configurable via `RARITY_CONFIG` in `game.js`:
- Easy to adjust QTE counts and timings for testing
- Each rarity has multiplier, color, spawn chance, QTE time, and QTE count

### Fish Generation
- Random fish type from 18 available types
- Rarity determined by weighted chance
- Size determined by weighted chance
- Value = baseValue × rarityMultiplier × sizeMultiplier

### QTE System
- Desktop: Press displayed keys (A, S, D, W, E, Q, R, F)
- Mobile: Tap displayed locations
- Timer countdown with visual feedback
- Must complete all QTEs within time limit

## 🔧 Configuration

### API Base URL
Set in `public/config.js`:
```javascript
const API_BASE_URL = window.location.origin; // Uses same origin
```

### Firebase Project ID
Set in `server.js` or via environment variable:
```javascript
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'offthehook-70d8a';
```

## 🛠️ API Endpoints

- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/user-data/:username` - Get user game data
- `POST /api/user-data/:username` - Save user game data
- `GET /api/leaderboard` - Get top 100 leaderboard
- `POST /api/leaderboard` - Update leaderboard
- `GET /health` - Health check with Firestore status

## 🔒 Security

- Passwords hashed with SHA-256 (server-side)
- User data stored securely in Firestore
- CORS enabled (restrict in production)
- API endpoints unauthenticated (add auth middleware for production)

## 📝 Environment Variables

- `PORT` - Server port (default: 8080)
- `FIREBASE_PROJECT_ID` - Firebase project ID (default: offthehook-70d8a)
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Firebase Admin credentials
- `NODE_ENV` - Environment mode

## 🐛 Troubleshooting

### Common Issues

**"PERMISSION_DENIED" errors:**
- Enable Firestore API in Google Cloud Console
- Grant Cloud Run service account `roles/datastore.user` permission
- See `VERIFY_PERMISSIONS.md` for details

**"NOT_FOUND" errors:**
- Create Firestore database in Firebase Console
- See `CREATE_FIRESTORE_DB.md` for instructions

**Settings not saving:**
- Check user is logged in
- Verify Firestore permissions
- Check browser console for errors

## 📄 License

See `LICENSE` file for details.

## 🎨 Credits

- 8-bit pixel art style
- Retro fishing game mechanics
- Built with vanilla JavaScript and HTML5 Canvas
