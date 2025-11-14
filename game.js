// ============================================================================
// IMPORTANT: UNIFIED TIME-BASED ANIMATION SYSTEM
// ============================================================================
// This project uses a unified time-based animation system instead of setInterval
// with draw() calls. This prevents frame drops and redundant rendering.
//
// PATTERN TO FOLLOW:
// 1. Store animation start time in gameState (e.g., gameState.castStartTime)
// 2. Update animation state in the draw() function based on elapsed time
// 3. NEVER call draw() from setInterval or setTimeout
// 4. The main game loop (requestAnimationFrame) handles all rendering
//
// EXAMPLE:
//   // Start animation:
//   gameState.animationStartTime = Date.now();
//   gameState.isAnimating = true;
//
//   // In draw() function:
//   if (gameState.isAnimating && gameState.animationStartTime) {
//       const elapsed = Date.now() - gameState.animationStartTime;
//       const progress = Math.min(elapsed / duration, 1);
//       // Update gameState based on progress
//       if (progress >= 1) {
//           // Animation complete
//           gameState.isAnimating = false;
//       }
//   }
//
// WHAT TO AVOID:
// - setInterval(() => { draw(); }, 16)  // BAD - causes redundant rendering
// - setTimeout(() => { draw(); }, 100)    // BAD - causes redundant rendering
// - Multiple timers calling draw()      // BAD - causes frame drops
//
// EXISTING ANIMATIONS USING THIS SYSTEM:
// - Casting animation (castStartTime, castPhase)
// - Reeling animation (reelStartTime, reelInitialDepth)
// - All animations update in draw() function based on elapsed time
// ============================================================================

// Game state
const gameState = {
    gold: 0,
    fishCount: 0,
    inventory: [],
    isCasting: false,
    isReeling: false,
    currentFish: null,
    qteActive: false,
    qteTimer: 0,
    qteMaxTime: 3,
    qteSuccesses: 0,
    qteRequired: 3,
    qteCurrentKey: null,
    qteCurrentTapLocation: null,
    qteInterval: null,
    qteKeyHandler: null,
    qteTapHandler: null,
    lineDepth: 0,
    maxDepth: 200,
    struggleAnimation: 0,
    bobberX: 0,
    bobberY: 0,
    bobberThrown: false,
    bobberThrowProgress: 0,
    castStartTime: 0,
    castPhase: null, // 'throwing', 'sinking', 'complete'
    reelStartTime: 0,
    reelInitialDepth: null, // Initial depth when reeling starts
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    currentUser: null,
    settings: {
        rainEnabled: true,
        grassEnabled: true
    },
    character: {
        // Character customization - modular parts
        skinColor: '#ffdbac',      // Skin tone
        hairColor: '#8b4513',      // Hair color
        hairStyle: 'default',      // Hair style: 'default', 'short', 'long', 'bald'
        shirtColor: '#4a5568',      // Shirt/torso color
        pantsColor: '#2c3e50',     // Pants color
        hatColor: '#d4af37',       // Hat color
        hatStyle: 'cap',           // Hat style: 'cap', 'none', 'beanie', 'crown'
        accessoryColor: '#dc2626',  // Scarf/cape color
        accessoryType: 'scarf'     // Accessory: 'scarf', 'cape', 'none'
    },
    timeOfDay: 'day', // 'morning', 'noon', 'afternoon', 'night'
    currentEvent: null, // Current synchronous event
    isAdmin: false, // Set from database userData.isAdmin
    adminPanelInterval: null, // Interval for updating admin panel
    backpackSort: 'recent', // Current backpack sort: 'recent', 'value', 'rarity'
    spacebarPressed: false // Track if spacebar is currently being processed to prevent repeat casts
};

// Canvas setup - will be initialized when DOM is ready
let canvas;
let ctx;

// Cache for sky gradients to avoid recreating every frame
let skyGradientCache = {
    timeOfDay: null,
    canvasHeight: null,
    gradient: null
};

function resizeCanvas() {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initRainParticles();
        // Clear ripples on resize
        waterRipples = [];
        lastRippleSpawn = 0;
        // Clear gradient cache on resize
        skyGradientCache.gradient = null;
        skyGradientCache.canvasHeight = null;
    }
}

// Fantasy fish types - 25 per rarity (175 total)
const fishTypes = {
    Common: [
        { name: 'Glowfin', baseValue: 10, color: '#ffff00', designStyle: 'glow' },
        { name: 'Sunny Bass', baseValue: 12, color: '#ffd700', designStyle: 'default' },
        { name: 'Blue Minnow', baseValue: 8, color: '#4169e1', designStyle: 'default' },
        { name: 'Green Guppy', baseValue: 9, color: '#32cd32', designStyle: 'default' },
        { name: 'Red Snapper', baseValue: 11, color: '#ff6347', designStyle: 'default' },
        { name: 'Silver Scale', baseValue: 10, color: '#c0c0c0', designStyle: 'default' },
        { name: 'Orange Fin', baseValue: 9, color: '#ffa500', designStyle: 'default' },
        { name: 'Purple Perch', baseValue: 10, color: '#9370db', designStyle: 'default' },
        { name: 'Pink Puffer', baseValue: 8, color: '#ff69b4', designStyle: 'glow' },
        { name: 'Yellow Tail', baseValue: 9, color: '#ffeb3b', designStyle: 'default' },
        { name: 'Teal Trout', baseValue: 10, color: '#008080', designStyle: 'default' },
        { name: 'Coral Cod', baseValue: 11, color: '#ff7f50', designStyle: 'default' },
        { name: 'Lime Loach', baseValue: 8, color: '#00ff00', designStyle: 'default' },
        { name: 'Aqua Angler', baseValue: 10, color: '#00ffff', designStyle: 'default' },
        { name: 'Mint Mackerel', baseValue: 9, color: '#98fb98', designStyle: 'default' },
        { name: 'Peach Perch', baseValue: 10, color: '#ffdab9', designStyle: 'default' },
        { name: 'Lavender Loach', baseValue: 9, color: '#e6e6fa', designStyle: 'default' },
        { name: 'Cyan Carp', baseValue: 10, color: '#00bfff', designStyle: 'default' },
        { name: 'Amber Anchovy', baseValue: 8, color: '#ffbf00', designStyle: 'default' },
        { name: 'Rose Ray', baseValue: 11, color: '#ff007f', designStyle: 'default' },
        { name: 'Turquoise Tuna', baseValue: 10, color: '#40e0d0', designStyle: 'default' },
        { name: 'Violet Vimba', baseValue: 9, color: '#8a2be2', designStyle: 'default' },
        { name: 'Sage Salmon', baseValue: 10, color: '#87ae73', designStyle: 'default' },
        { name: 'Ivory Ide', baseValue: 9, color: '#fffff0', designStyle: 'default' },
        { name: 'Honey Herring', baseValue: 10, color: '#f0fff0', designStyle: 'default' }
    ],
    Uncommon: [
        { name: 'Crystal Scale', baseValue: 15, color: '#00ffff', designStyle: 'ice' },
        { name: 'Shimmer Shad', baseValue: 18, color: '#87ceeb', designStyle: 'glow' },
        { name: 'Sparkle Sprat', baseValue: 16, color: '#ffd700', designStyle: 'glow' },
        { name: 'Glimmer Goby', baseValue: 17, color: '#e0e0e0', designStyle: 'glow' },
        { name: 'Twinkle Trout', baseValue: 16, color: '#fffacd', designStyle: 'glow' },
        { name: 'Flash Flounder', baseValue: 18, color: '#ffff99', designStyle: 'electric' },
        { name: 'Gleam Gar', baseValue: 17, color: '#b0e0e6', designStyle: 'ice' },
        { name: 'Radiance Ray', baseValue: 19, color: '#ffefd5', designStyle: 'glow' },
        { name: 'Luster Loach', baseValue: 16, color: '#f0e68c', designStyle: 'glow' },
        { name: 'Brilliance Bass', baseValue: 18, color: '#e6e6fa', designStyle: 'ice' },
        { name: 'Glint Gudgeon', baseValue: 17, color: '#fff8dc', designStyle: 'glow' },
        { name: 'Sheen Shiner', baseValue: 16, color: '#f5deb3', designStyle: 'glow' },
        { name: 'Polish Perch', baseValue: 18, color: '#dda0dd', designStyle: 'ice' },
        { name: 'Gloss Grouper', baseValue: 17, color: '#98d8c8', designStyle: 'glow' },
        { name: 'Shine Snapper', baseValue: 19, color: '#fafad2', designStyle: 'glow' },
        { name: 'Luster Ling', baseValue: 16, color: '#e0ffff', designStyle: 'ice' },
        { name: 'Glimmer Gurnard', baseValue: 18, color: '#ffe4b5', designStyle: 'glow' },
        { name: 'Sparkle Sturgeon', baseValue: 17, color: '#d3d3d3', designStyle: 'glow' },
        { name: 'Twinkle Turbot', baseValue: 16, color: '#f0f8ff', designStyle: 'ice' },
        { name: 'Flash Fluke', baseValue: 18, color: '#fffaf0', designStyle: 'glow' },
        { name: 'Gleam Gudgeon', baseValue: 17, color: '#f5f5dc', designStyle: 'glow' },
        { name: 'Radiance Roach', baseValue: 19, color: '#ffe4e1', designStyle: 'glow' },
        { name: 'Brilliance Bream', baseValue: 16, color: '#e6e6fa', designStyle: 'ice' },
        { name: 'Glint Goby', baseValue: 18, color: '#fff8dc', designStyle: 'glow' },
        { name: 'Sheen Smelt', baseValue: 17, color: '#f0e68c', designStyle: 'glow' }
    ],
    Rare: [
        { name: 'Fire Gills', baseValue: 25, color: '#ff4500', designStyle: 'fire' },
        { name: 'Ice Fin', baseValue: 22, color: '#87ceeb', designStyle: 'ice' },
        { name: 'Thunder Trout', baseValue: 24, color: '#9370db', designStyle: 'electric' },
        { name: 'Storm Striper', baseValue: 23, color: '#4b0082', designStyle: 'electric' },
        { name: 'Frost Flounder', baseValue: 22, color: '#b0e0e6', designStyle: 'ice' },
        { name: 'Blaze Bass', baseValue: 26, color: '#ff6347', designStyle: 'fire' },
        { name: 'Glacier Gar', baseValue: 21, color: '#e0f6ff', designStyle: 'ice' },
        { name: 'Volt Vimba', baseValue: 25, color: '#9370db', designStyle: 'electric' },
        { name: 'Ember Eel', baseValue: 24, color: '#ff8c00', designStyle: 'fire' },
        { name: 'Crystal Cod', baseValue: 23, color: '#00ffff', designStyle: 'ice' },
        { name: 'Lightning Ling', baseValue: 26, color: '#ffff00', designStyle: 'electric' },
        { name: 'Magma Mackerel', baseValue: 25, color: '#ff4500', designStyle: 'fire' },
        { name: 'Frozen Fluke', baseValue: 22, color: '#87ceeb', designStyle: 'ice' },
        { name: 'Spark Snapper', baseValue: 24, color: '#da70d6', designStyle: 'electric' },
        { name: 'Inferno Ide', baseValue: 26, color: '#ff4500', designStyle: 'fire' },
        { name: 'Blizzard Bream', baseValue: 21, color: '#b0e0e6', designStyle: 'ice' },
        { name: 'Bolt Burbot', baseValue: 25, color: '#9370db', designStyle: 'electric' },
        { name: 'Flame Flounder', baseValue: 24, color: '#ff6347', designStyle: 'fire' },
        { name: 'Iceberg Ide', baseValue: 23, color: '#e0f6ff', designStyle: 'ice' },
        { name: 'Thunderbolt Tuna', baseValue: 26, color: '#ffff00', designStyle: 'electric' },
        { name: 'Scorch Shad', baseValue: 25, color: '#ff8c00', designStyle: 'fire' },
        { name: 'Frostbite Fluke', baseValue: 22, color: '#87ceeb', designStyle: 'ice' },
        { name: 'Zap Zander', baseValue: 24, color: '#9370db', designStyle: 'electric' },
        { name: 'Cinder Carp', baseValue: 26, color: '#ff4500', designStyle: 'fire' },
        { name: 'Hail Herring', baseValue: 21, color: '#b0e0e6', designStyle: 'ice' }
    ],
    Epic: [
        { name: 'Shadow Serpent', baseValue: 35, color: '#800080', designStyle: 'shadow' },
        { name: 'Phantom Pike', baseValue: 32, color: '#2f4f4f', designStyle: 'shadow' },
        { name: 'Mystic Ray', baseValue: 38, color: '#ff1493', designStyle: 'glow' },
        { name: 'Cosmic Carp', baseValue: 40, color: '#4b0082', designStyle: 'electric' },
        { name: 'Ethereal Eel', baseValue: 36, color: '#da70d6', designStyle: 'shadow' },
        { name: 'Spectral Snapper', baseValue: 37, color: '#9370db', designStyle: 'shadow' },
        { name: 'Astral Angler', baseValue: 39, color: '#8a2be2', designStyle: 'electric' },
        { name: 'Wraith Wrasse', baseValue: 34, color: '#2f4f4f', designStyle: 'shadow' },
        { name: 'Spirit Sturgeon', baseValue: 38, color: '#800080', designStyle: 'shadow' },
        { name: 'Nebula Nase', baseValue: 40, color: '#4b0082', designStyle: 'electric' },
        { name: 'Ghost Gar', baseValue: 35, color: '#696969', designStyle: 'shadow' },
        { name: 'Void Vimba', baseValue: 37, color: '#191970', designStyle: 'shadow' },
        { name: 'Stellar Snapper', baseValue: 39, color: '#9370db', designStyle: 'electric' },
        { name: 'Phantom Perch', baseValue: 36, color: '#2f4f4f', designStyle: 'shadow' },
        { name: 'Celestial Cod', baseValue: 38, color: '#8a2be2', designStyle: 'electric' },
        { name: 'Echo Eel', baseValue: 34, color: '#800080', designStyle: 'shadow' },
        { name: 'Aurora Angelfish', baseValue: 40, color: '#ff1493', designStyle: 'glow' },
        { name: 'Shade Shad', baseValue: 37, color: '#2f4f4f', designStyle: 'shadow' },
        { name: 'Galaxy Grouper', baseValue: 39, color: '#4b0082', designStyle: 'electric' },
        { name: 'Wisp Wrasse', baseValue: 35, color: '#696969', designStyle: 'shadow' },
        { name: 'Nova Nase', baseValue: 38, color: '#9370db', designStyle: 'electric' },
        { name: 'Specter Snapper', baseValue: 36, color: '#800080', designStyle: 'shadow' },
        { name: 'Comet Carp', baseValue: 40, color: '#8a2be2', designStyle: 'electric' },
        { name: 'Shade Shiner', baseValue: 37, color: '#2f4f4f', designStyle: 'shadow' },
        { name: 'Stardust Sturgeon', baseValue: 39, color: '#ff1493', designStyle: 'glow' }
    ],
    Legendary: [
        { name: 'Dragon Fin', baseValue: 50, color: '#ff6347', designStyle: 'fire' },
        { name: 'Celestial Bass', baseValue: 55, color: '#00ced1', designStyle: 'electric' },
        { name: 'Starfish', baseValue: 52, color: '#ffd700', designStyle: 'glow' },
        { name: 'Titan Tuna', baseValue: 60, color: '#ff8c00', designStyle: 'fire' },
        { name: 'Prismatic Perch', baseValue: 58, color: '#ff1493', designStyle: 'glow' },
        { name: 'Leviathan Ling', baseValue: 56, color: '#191970', designStyle: 'shadow' },
        { name: 'Phoenix Pike', baseValue: 54, color: '#ff4500', designStyle: 'fire' },
        { name: 'Aurora Angler', baseValue: 57, color: '#00ffff', designStyle: 'electric' },
        { name: 'Kraken Koi', baseValue: 59, color: '#4b0082', designStyle: 'shadow' },
        { name: 'Solar Snapper', baseValue: 53, color: '#ffd700', designStyle: 'fire' },
        { name: 'Lunar Loach', baseValue: 55, color: '#c0c0c0', designStyle: 'ice' },
        { name: 'Titanic Trout', baseValue: 60, color: '#ff8c00', designStyle: 'fire' },
        { name: 'Nebula Nase', baseValue: 58, color: '#9370db', designStyle: 'electric' },
        { name: 'Behemoth Bass', baseValue: 56, color: '#2f4f4f', designStyle: 'shadow' },
        { name: 'Solaris Snapper', baseValue: 54, color: '#ff6347', designStyle: 'fire' },
        { name: 'Lunaria Ling', baseValue: 57, color: '#e0e0e0', designStyle: 'ice' },
        { name: 'Colossus Cod', baseValue: 59, color: '#ff8c00', designStyle: 'fire' },
        { name: 'Stellar Sturgeon', baseValue: 53, color: '#9370db', designStyle: 'electric' },
        { name: 'Mythic Mackerel', baseValue: 55, color: '#ff1493', designStyle: 'glow' },
        { name: 'Giant Grouper', baseValue: 60, color: '#ff6347', designStyle: 'fire' },
        { name: 'Cosmic Cod', baseValue: 58, color: '#4b0082', designStyle: 'electric' },
        { name: 'Divine Dace', baseValue: 56, color: '#ffd700', designStyle: 'glow' },
        { name: 'Eternal Eel', baseValue: 54, color: '#191970', designStyle: 'shadow' },
        { name: 'Immortal Ide', baseValue: 57, color: '#ff8c00', designStyle: 'fire' },
        { name: 'Transcendent Trout', baseValue: 59, color: '#9370db', designStyle: 'electric' }
    ],
    Mythical: [
        { name: 'Void Eel', baseValue: 80, color: '#191970', designStyle: 'shadow' },
        { name: 'Ethereal Angelfish', baseValue: 85, color: '#da70d6', designStyle: 'glow' },
        { name: 'Chronos Carp', baseValue: 88, color: '#4b0082', designStyle: 'electric' },
        { name: 'Chaos Cod', baseValue: 82, color: '#800080', designStyle: 'shadow' },
        { name: 'Elysian Eel', baseValue: 87, color: '#ff1493', designStyle: 'glow' },
        { name: 'Abyssal Angler', baseValue: 90, color: '#000033', designStyle: 'shadow' },
        { name: 'Paradise Pike', baseValue: 84, color: '#ffd700', designStyle: 'fire' },
        { name: 'Nirvana Nase', baseValue: 89, color: '#9370db', designStyle: 'electric' },
        { name: 'Valhalla Vimba', baseValue: 83, color: '#ff6347', designStyle: 'fire' },
        { name: 'Olympus Oarfish', baseValue: 91, color: '#ff8c00', designStyle: 'fire' },
        { name: 'Asgard Angelfish', baseValue: 86, color: '#00ced1', designStyle: 'electric' },
        { name: 'Tartarus Trout', baseValue: 88, color: '#191970', designStyle: 'shadow' },
        { name: 'Eden Eel', baseValue: 85, color: '#32cd32', designStyle: 'glow' },
        { name: 'Purgatory Pike', baseValue: 87, color: '#ff4500', designStyle: 'fire' },
        { name: 'Nirvana Nase II', baseValue: 90, color: '#9370db', designStyle: 'electric' },
        { name: 'Heavenly Herring', baseValue: 84, color: '#ffd700', designStyle: 'glow' },
        { name: 'Infernal Ide', baseValue: 89, color: '#ff6347', designStyle: 'fire' },
        { name: 'Celestial Cod', baseValue: 86, color: '#00ffff', designStyle: 'electric' },
        { name: 'Divine Dace', baseValue: 88, color: '#ff1493', designStyle: 'glow' },
        { name: 'Sacred Snapper', baseValue: 91, color: '#ffd700', designStyle: 'fire' },
        { name: 'Profane Pike', baseValue: 83, color: '#800080', designStyle: 'shadow' },
        { name: 'Blessed Bass', baseValue: 87, color: '#00ced1', designStyle: 'electric' },
        { name: 'Cursed Cod', baseValue: 85, color: '#191970', designStyle: 'shadow' },
        { name: 'Hallowed Herring', baseValue: 89, color: '#ffd700', designStyle: 'glow' },
        { name: 'Damned Dace', baseValue: 90, color: '#ff4500', designStyle: 'fire' }
    ],
    Universal: [
        { name: 'Godfish', baseValue: 150, color: '#ff00ff', designStyle: 'glow' },
        { name: 'Omnipotent Oarfish', baseValue: 180, color: '#ff1493', designStyle: 'electric' },
        { name: 'Alpha Angler', baseValue: 160, color: '#ff00ff', designStyle: 'fire' },
        { name: 'Omega Oarfish', baseValue: 175, color: '#9370db', designStyle: 'electric' },
        { name: 'Infinity Ide', baseValue: 170, color: '#ff00ff', designStyle: 'glow' },
        { name: 'Absolute Angelfish', baseValue: 185, color: '#ff1493', designStyle: 'electric' },
        { name: 'Ultimate Unicornfish', baseValue: 165, color: '#ff00ff', designStyle: 'fire' },
        { name: 'Perfect Pike', baseValue: 180, color: '#9370db', designStyle: 'electric' },
        { name: 'Supreme Snapper', baseValue: 175, color: '#ff00ff', designStyle: 'glow' },
        { name: 'Master Mackerel', baseValue: 190, color: '#ff1493', designStyle: 'electric' },
        { name: 'Prime Perch', baseValue: 170, color: '#ff00ff', designStyle: 'fire' },
        { name: 'Dominion Dace', baseValue: 185, color: '#9370db', designStyle: 'electric' },
        { name: 'Sovereign Snapper', baseValue: 180, color: '#ff00ff', designStyle: 'glow' },
        { name: 'Emperor Eel', baseValue: 175, color: '#ff1493', designStyle: 'electric' },
        { name: 'Monarch Mackerel', baseValue: 190, color: '#ff00ff', designStyle: 'fire' },
        { name: 'Ruler Ray', baseValue: 185, color: '#9370db', designStyle: 'electric' },
        { name: 'Regent Roach', baseValue: 180, color: '#ff00ff', designStyle: 'glow' },
        { name: 'Crown Cod', baseValue: 195, color: '#ff1493', designStyle: 'electric' },
        { name: 'Throne Trout', baseValue: 190, color: '#ff00ff', designStyle: 'fire' },
        { name: 'Scepter Snapper', baseValue: 185, color: '#9370db', designStyle: 'electric' },
        { name: 'Diadem Dace', baseValue: 200, color: '#ff00ff', designStyle: 'glow' },
        { name: 'Tiarra Tuna', baseValue: 195, color: '#ff1493', designStyle: 'electric' },
        { name: 'Coronet Cod', baseValue: 190, color: '#ff00ff', designStyle: 'fire' },
        { name: 'Crown Carp', baseValue: 200, color: '#9370db', designStyle: 'electric' },
        { name: 'Apotheosis Angelfish', baseValue: 200, color: '#ff00ff', designStyle: 'glow' }
    ]
};

// Flatten fish types for easy access
const allFishTypes = Object.values(fishTypes).flat();

// Rarity configuration - easily adjustable for testing
const RARITY_CONFIG = {
    Common: { multiplier: 1.0, color: '#95a5a6', chance: 0.5, qteTime: 1.5, qteRequired: 3 },
    Uncommon: { multiplier: 1.5, color: '#2ecc71', chance: 0.3, qteTime: 1.25, qteRequired: 4 },
    Rare: { multiplier: 2.5, color: '#3498db', chance: 0.15, qteTime: 1.0, qteRequired: 5 },
    Epic: { multiplier: 4.0, color: '#9b59b6', chance: 0.04, qteTime: 0.9, qteRequired: 6 },
    Legendary: { multiplier: 7.0, color: '#f39c12', chance: 0.01, qteTime: 0.9, qteRequired: 10 },
    Mythical: { multiplier: 12.0, color: '#e74c3c', chance: 0.005, qteTime: 0.9, qteRequired: 20 },
    Universal: { multiplier: 20.0, color: '#ff00ff', chance: 0.001, qteTime: 0.9, qteRequired: 50 }
};

// Rarity system with QTE difficulty - built from config
const rarities = Object.keys(RARITY_CONFIG).map(name => ({
    name,
    ...RARITY_CONFIG[name]
}));

// Keys for desktop QTE
const qteKeys = ['A', 'S', 'D', 'W', 'E', 'Q', 'R', 'F'];

// Size system
const sizes = [
    { name: 'Tiny', multiplier: 0.5, chance: 0.3 },
    { name: 'Small', multiplier: 0.75, chance: 0.25 },
    { name: 'Medium', multiplier: 1.0, chance: 0.25 },
    { name: 'Large', multiplier: 1.5, chance: 0.15 },
    { name: 'Huge', multiplier: 2.5, chance: 0.05 }
];

// Generate random fish
function generateFish() {
    const currentEvent = getCurrentEvent();
    
    // Select rarity based on chance
    let rarityRoll = Math.random();
    let rarity = rarities[0];
    let cumulative = 0;
    for (const r of rarities) {
        cumulative += r.chance;
        if (rarityRoll <= cumulative) {
            rarity = r;
            break;
        }
    }
    
    // Get fish types for this rarity
    const rarityFishTypes = fishTypes[rarity.name] || fishTypes.Common;
    
    // Check if we should spawn a special event fish
    let type;
    if (currentEvent && Math.random() < 0.3) { // 30% chance during events
        const specialFishNames = currentEvent.specialFish;
        const specialFishType = rarityFishTypes.find(f => specialFishNames.includes(f.name));
        if (specialFishType) {
            type = specialFishType;
        } else {
            // Fallback: try to find in all fish types
            const allSpecialFish = allFishTypes.find(f => specialFishNames.includes(f.name));
            if (allSpecialFish) {
                type = allSpecialFish;
            } else {
                type = rarityFishTypes[Math.floor(Math.random() * rarityFishTypes.length)];
            }
        }
    } else {
        type = rarityFishTypes[Math.floor(Math.random() * rarityFishTypes.length)];
    }
    
    // Select size based on chance
    let sizeRoll = Math.random();
    let size = sizes[0];
    let sizeCumulative = 0;
    for (const s of sizes) {
        sizeCumulative += s.chance;
        if (sizeRoll <= sizeCumulative) {
            size = s;
            break;
        }
    }
    
    // Calculate value with event multiplier
    let valueMultiplier = 1.0;
    if (currentEvent) {
        valueMultiplier = currentEvent.multiplier;
    }
    const value = Math.floor(type.baseValue * rarity.multiplier * size.multiplier * valueMultiplier);
    
    return {
        type: type.name,
        rarity: rarity.name,
        size: size.name,
        value: value,
        color: type.color,
        rarityColor: rarity.color,
        rarityData: rarity,
        designStyle: type.designStyle || 'default',
        isEventFish: currentEvent && currentEvent.specialFish.includes(type.name)
    };
}

// Rain particles
let rainParticles = [];
let lastFrameTime = Date.now();

function initRainParticles() {
    rainParticles = [];
    for (let i = 0; i < 100; i++) {
        rainParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 30 + Math.random() * 3
        });
    }
    lastFrameTime = Date.now();
}

// Water ripples system
let waterRipples = [];
let lastRippleSpawn = 0;
const RIPPLE_SPAWN_INTERVAL = 150; // Spawn a ripple every 1.5 seconds on average
const RIPPLE_LIFETIME = 2000; // Ripples last 2 seconds

function spawnRipple() {
    if (!canvas) return;
    
    const waterLevel = canvas.height * 0.6;
    const landEndX = canvas.width * 0.4;
    
    // Spawn ripple randomly in water area
    const x = landEndX + Math.random() * (canvas.width - landEndX);
    const y = waterLevel + Math.random() * (canvas.height - waterLevel);
    
    waterRipples.push({
        x: x,
        y: y,
        radius: 2,
        maxRadius: 15 + Math.random() * 10,
        opacity: 0.6,
        spawnTime: Date.now(),
        lifetime: RIPPLE_LIFETIME
    });
}

// Rain particles will be initialized when canvas is ready

// Time of day system
function getTimeOfDay() {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 5 && hour < 9) {
        return 'morning';
    } else if (hour >= 9 && hour < 13) {
        return 'noon';
    } else if (hour >= 13 && hour < 18) {
        return 'afternoon';
    } else {
        return 'night';
    }
}

function getTimeOfDayInfo() {
    const now = new Date();
    const timeOfDay = getTimeOfDay();
    return {
        phase: timeOfDay,
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
        timeString: now.toLocaleTimeString(),
        dateString: now.toLocaleDateString()
    };
}

// Synchronous events system
const SYNCHRONOUS_EVENTS = {
    morning: {
        name: 'Dawn Fishing',
        description: 'Special fish appear during morning hours!',
        specialFish: ['Glowfin', 'Crystal Scale'],
        multiplier: 1.2
    },
    noon: {
        name: 'Midday Bounty',
        description: 'Increased chance of rare fish!',
        specialFish: ['Fire Gills', 'Thunder Trout'],
        multiplier: 1.5
    },
    afternoon: {
        name: 'Afternoon Delight',
        description: 'Epic fish are more common!',
        specialFish: ['Dragon Fin', 'Celestial Bass'],
        multiplier: 1.3
    },
    night: {
        name: 'Midnight Mystery',
        description: 'Legendary fish emerge from the depths!',
        specialFish: ['Shadow Serpent', 'Void Eel', 'Phantom Pike'],
        multiplier: 2.0
    }
};

// Performance profiling (only enabled in development)
const PERFORMANCE_PROFILING = false; // Set to true to enable profiling
let performanceStats = {
    frameCount: 0,
    totalTime: 0,
    skyTime: 0,
    rainTime: 0,
    waterTime: 0,
    beachTime: 0,
    grassTime: 0,
    characterTime: 0,
    fishingLineTime: 0,
    ripplesTime: 0,
    otherTime: 0
};

function getCurrentEvent() {
    const timeOfDay = getTimeOfDay();
    return SYNCHRONOUS_EVENTS[timeOfDay] || null;
}

// Draw game
function draw() {
    if (!canvas || !ctx || canvas.width === 0 || canvas.height === 0) {
        return;
    }
    
    const frameStart = PERFORMANCE_PROFILING ? performance.now() : 0;
    let sectionStart = frameStart;
    
    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update time of day
    gameState.timeOfDay = getTimeOfDay();
    gameState.currentEvent = getCurrentEvent();
    
    // Draw sky based on time of day (use cached gradient if available)
    const skyHeight = canvas.height * 0.6;
    
    // Check if we need to recreate the gradient (time of day or canvas size changed)
    if (!skyGradientCache.gradient || 
        skyGradientCache.timeOfDay !== gameState.timeOfDay || 
        skyGradientCache.canvasHeight !== canvas.height) {
        
        skyGradientCache.gradient = ctx.createLinearGradient(0, 0, 0, skyHeight);
        
        // Sky colors for different times of day
        let topColor, bottomColor;
        switch (gameState.timeOfDay) {
            case 'morning':
                topColor = '#ff9a56'; // Orange-pink sunrise
                bottomColor = '#ffd89b'; // Light orange
                break;
            case 'noon':
                topColor = '#87ceeb'; // Sky blue
                bottomColor = '#e0f6ff'; // Light blue
                break;
            case 'afternoon':
                topColor = '#ffa500'; // Orange
                bottomColor = '#ffd700'; // Gold
                break;
            case 'night':
                topColor = '#191970'; // Midnight blue
                bottomColor = '#000033'; // Very dark blue
                break;
            default:
                topColor = '#4a5568';
                bottomColor = '#2d3748';
        }
        
        skyGradientCache.gradient.addColorStop(0, topColor);
        skyGradientCache.gradient.addColorStop(1, bottomColor);
        skyGradientCache.timeOfDay = gameState.timeOfDay;
        skyGradientCache.canvasHeight = canvas.height;
    }
    
    ctx.fillStyle = skyGradientCache.gradient;
    ctx.fillRect(0, 0, canvas.width, skyHeight);
    
    if (PERFORMANCE_PROFILING) {
        performanceStats.skyTime += performance.now() - sectionStart;
        sectionStart = performance.now();
    }
    
    // Always update frame time for consistent timing
    const now = Date.now();
    let deltaTime = (now - lastFrameTime) / 16.67; // Normalize to 60fps
    
    // Handle large time gaps (e.g., tab was in background)
    // If deltaTime is too large, reset particles instead of trying to catch up
    if (deltaTime > 100) {
        // Tab was paused for a while - reset rain particles to prevent weird behavior
        initRainParticles();
        deltaTime = 1; // Use normal delta for this frame
    } else if (deltaTime < 0) {
        // Time went backwards (system clock change) - reset
        deltaTime = 1;
    } else if (deltaTime === 0 || isNaN(deltaTime)) {
        // Prevent division by zero or NaN
        deltaTime = 1;
    }
    
    lastFrameTime = now;
    
    // Draw rain (if enabled) - 8-bit pixelated style
    if (gameState.settings.rainEnabled) {
        const rainPixelSize = 2; // Size of each rain pixel
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        rainParticles.forEach((particle, i) => {
            // Draw rain as pixel blocks (vertical line of pixels)
            const rainLength = 8; // Length of rain drop in pixels
            const pixelX = Math.floor(particle.x / rainPixelSize) * rainPixelSize;
            const pixelY = Math.floor(particle.y / rainPixelSize) * rainPixelSize;
            
            // Draw vertical line of pixels for 8-bit rain
            for (let j = 0; j < rainLength; j++) {
                const yPos = pixelY + (j * rainPixelSize);
                if (yPos >= 0 && yPos < canvas.height) {
                    ctx.fillRect(pixelX, yPos, rainPixelSize, rainPixelSize);
                }
            }
            
            // Update based on actual time elapsed, not frame count
            particle.y += particle.speed * deltaTime;
            if (particle.y > canvas.height + (rainLength * rainPixelSize)) {
                particle.y = -(rainLength * rainPixelSize);
                particle.x = Math.random() * canvas.width;
            }
        });
        
        if (PERFORMANCE_PROFILING) {
            performanceStats.rainTime += performance.now() - sectionStart;
            sectionStart = performance.now();
        }
    }
    
    // Draw water (dark blue) - fills right side and below beach curve
    // Draw water FIRST so beach can be drawn on top
    const waterLevel = canvas.height * 0.6;
    const landStartX = 0;
    const landEndX = canvas.width * 0.4; // Land extends about 40% of screen width
    
    // Beach starting height - independent of water level
    const beachStartY = canvas.height * 0.5; // Beach starts higher up
    
    // Define curve control points once - used for beach curve
    const curveControlX = landEndX * 0.4;
    const curveControlY = waterLevel - 110;
    const curveEndY = canvas.height; // End point of curve (where beach meets water)
    
    // Draw pixelated ocean (8-bit style)
    // Use solid colors in pixel blocks instead of gradients
    const pixelSize = 8; // Size of each pixel block
    ctx.fillStyle = '#1e3c72'; // Base ocean color
    
    // Draw ocean in pixel blocks for 8-bit look
    for (let y = Math.floor(waterLevel / pixelSize) * pixelSize; y < canvas.height; y += pixelSize) {
        for (let x = 0; x < canvas.width; x += pixelSize) {
            // Create depth effect with different shades
            const depth = (y - waterLevel) / (canvas.height - waterLevel);
            if (depth < 0.3) {
                ctx.fillStyle = '#2a4a7a'; // Lighter blue near surface
            } else if (depth < 0.6) {
                ctx.fillStyle = '#1e3c72'; // Medium blue
            } else {
                ctx.fillStyle = '#0f1f3d'; // Dark blue at bottom
            }
            
            // Add some pixelated wave pattern (checkerboard effect)
            const wavePattern = Math.floor((x + y * 0.5) / (pixelSize * 2)) % 2;
            if (wavePattern === 0 && depth < 0.4) {
                ctx.fillStyle = '#3a5a8a'; // Slightly lighter for wave effect
            }
            
            ctx.fillRect(x, y, pixelSize, pixelSize);
        }
    }
    
    if (PERFORMANCE_PROFILING) {
        performanceStats.waterTime += performance.now() - sectionStart;
        sectionStart = performance.now();
    }
    
    // Draw pixelated beach (8-bit style)
    // Draw beach AFTER water so it appears on top
    const beachPixelSize = 8;
    ctx.fillStyle = '#8b6f47'; // Beach brown color
    
    // Draw beach in pixel blocks, following the curve
    for (let y = Math.floor(beachStartY / beachPixelSize) * beachPixelSize; y < canvas.height; y += beachPixelSize) {
        for (let x = 0; x < landEndX; x += beachPixelSize) {
            // Calculate if this pixel is on the beach side of the curve
            const t = x / landEndX;
            const curveY = (1 - t) * (1 - t) * beachStartY + 2 * (1 - t) * t * curveControlY + t * t * curveEndY;
            
            // Check if pixel is on beach (left of curve or below curve)
            if (x < landStartX || y >= curveY) {
                // Add some texture variation
                const texture = Math.floor((x + y * 0.7) / (beachPixelSize * 3)) % 3;
                if (texture === 0) {
                    ctx.fillStyle = '#9b7f57'; // Slightly lighter
                } else if (texture === 1) {
                    ctx.fillStyle = '#7b5f37'; // Slightly darker
                } else {
                    ctx.fillStyle = '#8b6f47'; // Base color
                }
                
                ctx.fillRect(x, y, beachPixelSize, beachPixelSize);
            }
        }
    }
    
    if (PERFORMANCE_PROFILING) {
        performanceStats.beachTime += performance.now() - sectionStart;
        sectionStart = performance.now();
    }
    
    // Draw beach edge pixels more precisely for smoother curve appearance
    for (let x = 0; x < landEndX; x += beachPixelSize) {
        const t = x / landEndX;
        const curveY = (1 - t) * (1 - t) * beachStartY + 2 * (1 - t) * t * curveControlY + t * t * curveEndY;
        const pixelY = Math.floor(curveY / beachPixelSize) * beachPixelSize;
        
        // Draw edge pixels
        ctx.fillStyle = '#8b6f47';
        ctx.fillRect(x, pixelY, beachPixelSize, beachPixelSize);
        
        // Add highlight pixels on curve edge
        if (pixelY < canvas.height - beachPixelSize) {
            ctx.fillStyle = '#9b7f57';
            ctx.fillRect(x, pixelY - beachPixelSize, beachPixelSize, beachPixelSize);
        }
    }
    
    // Draw pixelated grass/vegetation on top of land (along the curve) - if enabled
    if (gameState.settings.grassEnabled) {
        const grassPixelSize = 8;
        ctx.fillStyle = '#5a7c3a'; // Grass green
        
        // Draw grass in pixel blocks along the curve
        for (let x = 0; x < landEndX; x += grassPixelSize) {
            const t = x / landEndX;
            const curveY = (1 - t) * (1 - t) * beachStartY + 2 * (1 - t) * t * curveControlY + t * t * curveEndY;
            const grassTopY = Math.floor(curveY / grassPixelSize) * grassPixelSize;
            const grassHeight = Math.max(grassPixelSize, Math.floor(8 / grassPixelSize) * grassPixelSize);
            
            // Draw grass pixels with some variation
            for (let y = grassTopY; y < grassTopY + grassHeight; y += grassPixelSize) {
                const texture = Math.floor((x + y * 0.5) / (grassPixelSize * 2)) % 2;
                if (texture === 0) {
                    ctx.fillStyle = '#6a8c4a'; // Slightly lighter green
                } else {
                    ctx.fillStyle = '#5a7c3a'; // Base green
                }
                
                // Only draw if on beach side
                if (x < landStartX || y >= curveY) {
                    ctx.fillRect(x, y, grassPixelSize, grassPixelSize);
                }
            }
        }
    }
    
    if (PERFORMANCE_PROFILING && gameState.settings.grassEnabled) {
        performanceStats.grassTime += performance.now() - sectionStart;
        sectionStart = performance.now();
    }
    
    // Calculate character position on beach (standing on the curve)
    const charX = landEndX * 0.25;
    // Calculate Y position on the quadratic curve using the formula
    const t = charX / landEndX; // Parameter t from 0 to 1
    const beachCurveY = (1 - t) * (1 - t) * beachStartY + 2 * (1 - t) * t * curveControlY + t * t * curveEndY;
    const charY = beachCurveY;
    
    // Draw character on beach (facing right toward ocean)
    drawCharacter(charX, charY, true); // true = facing right
    
    if (PERFORMANCE_PROFILING) {
        performanceStats.characterTime += performance.now() - sectionStart;
        sectionStart = performance.now();
    }
    
    // ========================================================================
    // ANIMATION UPDATES: Use time-based state updates, NOT setInterval
    // See documentation at top of file for the unified animation system pattern
    // ========================================================================
    
    // Update casting/reeling animations based on time (time-based, not interval-based)
    if (gameState.isCasting && gameState.castStartTime) {
        const now = Date.now();
        const elapsed = now - gameState.castStartTime;
        const throwDuration = 800; // milliseconds
        
        if (gameState.castPhase === 'throwing') {
            gameState.bobberThrowProgress = Math.min(elapsed / throwDuration, 1);
            gameState.bobberThrown = true;
            
            if (gameState.bobberThrowProgress >= 1) {
                // Bobber has landed, start sinking phase
                gameState.castPhase = 'sinking';
                gameState.castStartTime = now; // Reset timer for sinking phase
                gameState.lineDepth = 0;
            }
        } else if (gameState.castPhase === 'sinking') {
            const sinkElapsed = now - gameState.castStartTime;
            const sinkSpeed = 2; // pixels per frame equivalent (at 60fps)
            gameState.lineDepth = Math.min(sinkElapsed * sinkSpeed / 16.67, gameState.maxDepth);
            
            if (gameState.lineDepth >= gameState.maxDepth) {
                // Sinking complete, wait for QTE before starting reeling
                gameState.isCasting = false;
                gameState.isReeling = true; // Set flag but don't start timer yet
                gameState.reelStartTime = 0; // Will be set after QTE completes
                gameState.castPhase = 'complete';
                
                // Fish bites after a short delay
                setTimeout(() => {
                    gameState.currentFish = generateFish();
                    startQTE();
                }, 500);
            }
        }
    }
    
    // Update reeling animation based on time (pause during QTE)
    if (gameState.isReeling && gameState.reelStartTime && !gameState.qteActive) {
        const now = Date.now();
        const reelElapsed = now - gameState.reelStartTime;
        const reelSpeed = 3; // pixels per frame equivalent (at 60fps)
        // Store initial depth when reeling starts if not already set
        if (!gameState.reelInitialDepth) {
            gameState.reelInitialDepth = gameState.lineDepth || gameState.maxDepth;
        }
        gameState.lineDepth = Math.max(0, gameState.reelInitialDepth - (reelElapsed * reelSpeed / 16.67));
        
        if (gameState.lineDepth <= 0) {
            gameState.reelInitialDepth = null; // Reset
            catchFish();
        }
    }
    
    // Draw fishing line - casting forward/right from beach into water (side view)
    if (gameState.isCasting || gameState.isReeling) {
        const lineStartX = charX + 8;
        const lineStartY = charY - 15;
        
        let lineEndX, lineEndY;
        
        // If bobber is being thrown, animate it through the air
        if (gameState.bobberThrown && gameState.bobberThrowProgress < 1) {
            // Calculate destination
            const maxCastDistance = canvas.width * 0.4;
            const destX = lineStartX + maxCastDistance;
            const destY = waterLevel + 10;
            
            // Animate bobber along arc trajectory
            const progress = gameState.bobberThrowProgress;
            lineEndX = lineStartX + (destX - lineStartX) * progress;
            // Arc trajectory: higher at the start, lower at the end
            const arcHeight = 60 * Math.sin(progress * Math.PI); // Creates an arc
            lineEndY = lineStartY + (destY - lineStartY) * progress - arcHeight;
            
            // Update bobber position
            gameState.bobberX = lineEndX;
            gameState.bobberY = lineEndY;
        } else if (gameState.isReeling) {
            // When reeling, bobber moves back towards character position
            const maxCastDistance = canvas.width * 0.4;
            const reelProgress = 1 - (gameState.lineDepth / gameState.maxDepth); // 0 = far, 1 = close
            const farX = lineStartX + maxCastDistance;
            const farY = waterLevel + 10;
            
            // Interpolate between far position and character position
            lineEndX = farX + (lineStartX - farX) * reelProgress;
            lineEndY = farY + (lineStartY - farY) * reelProgress;
        } else if (gameState.isCasting && gameState.bobberThrown && gameState.bobberThrowProgress >= 1) {
            // Bobber has landed, now line is going deeper
            const maxCastDistance = canvas.width * 0.4;
            const baseX = lineStartX + maxCastDistance;
            const baseY = waterLevel + 10;
            lineEndX = baseX;
            lineEndY = baseY + (gameState.lineDepth / gameState.maxDepth) * 50;
            
            // Update bobber position to follow line depth
            gameState.bobberX = lineEndX;
            gameState.bobberY = lineEndY;
        } else if (gameState.isCasting && !gameState.bobberThrown) {
            // During casting (before throw starts), initialize bobber at character
            if (gameState.bobberX === 0 && gameState.bobberY === 0) {
                gameState.bobberX = lineStartX;
                gameState.bobberY = lineStartY;
            }
            lineEndX = gameState.bobberX;
            lineEndY = gameState.bobberY;
        } else {
            // Fallback
            lineEndX = lineStartX;
            lineEndY = lineStartY;
        }
        
        // Draw pixelated fishing line (8-bit style)
        drawFishingLine(lineStartX, lineStartY, lineEndX, lineEndY);
        
        if (PERFORMANCE_PROFILING) {
            performanceStats.fishingLineTime += performance.now() - sectionStart;
            sectionStart = performance.now();
        }
        
        // Draw pixelated bobber (8-bit style)
        if (gameState.bobberThrown || gameState.isReeling || (gameState.isCasting && gameState.bobberThrowProgress >= 1)) {
            drawBobber(lineEndX, lineEndY);
        }
        
        // Draw fish if caught (with struggling animation, following the bobber)
        if (gameState.currentFish && gameState.isReeling) {
            // Fish follows the bobber position (lineEndX, lineEndY)
            // Add struggle animation offset from bobber position
            const fishX = lineEndX + Math.sin(gameState.struggleAnimation) * 12;
            const fishY = lineEndY + Math.cos(gameState.struggleAnimation * 0.7) * 8;
            drawFish(fishX, fishY, gameState.currentFish);
            
            // Update struggle animation
            gameState.struggleAnimation += 0.3;
        }
    }
    
    // Draw water ripples (if rain is enabled)
    if (gameState.settings.rainEnabled) {
        drawRipples();
        
        if (PERFORMANCE_PROFILING) {
            performanceStats.ripplesTime += performance.now() - sectionStart;
            sectionStart = performance.now();
        }
    }
    
    if (PERFORMANCE_PROFILING) {
        const frameTime = performance.now() - frameStart;
        performanceStats.totalTime += frameTime;
        performanceStats.frameCount++;
        
        // Log performance stats every 60 frames (~1 second at 60fps)
        if (performanceStats.frameCount % 60 === 0) {
            const avgFrameTime = performanceStats.totalTime / performanceStats.frameCount;
            const avgFPS = 1000 / avgFrameTime;
            console.log('=== Performance Report ===');
            console.log(`Average FPS: ${avgFPS.toFixed(2)}`);
            console.log(`Average frame time: ${avgFrameTime.toFixed(2)}ms`);
            console.log('Time per section (avg ms per frame):');
            console.log(`  Sky: ${(performanceStats.skyTime / performanceStats.frameCount).toFixed(2)}ms`);
            console.log(`  Rain: ${(performanceStats.rainTime / performanceStats.frameCount).toFixed(2)}ms`);
            console.log(`  Water: ${(performanceStats.waterTime / performanceStats.frameCount).toFixed(2)}ms`);
            console.log(`  Beach: ${(performanceStats.beachTime / performanceStats.frameCount).toFixed(2)}ms`);
            console.log(`  Grass: ${(performanceStats.grassTime / performanceStats.frameCount).toFixed(2)}ms`);
            console.log(`  Character: ${(performanceStats.characterTime / performanceStats.frameCount).toFixed(2)}ms`);
            console.log(`  Fishing Line: ${(performanceStats.fishingLineTime / performanceStats.frameCount).toFixed(2)}ms`);
            console.log(`  Ripples: ${(performanceStats.ripplesTime / performanceStats.frameCount).toFixed(2)}ms`);
            console.log(`  Other: ${(performanceStats.otherTime / performanceStats.frameCount).toFixed(2)}ms`);
            
            // Reset stats
            performanceStats = {
                frameCount: 0,
                totalTime: 0,
                skyTime: 0,
                rainTime: 0,
                waterTime: 0,
                beachTime: 0,
                grassTime: 0,
                characterTime: 0,
                fishingLineTime: 0,
                ripplesTime: 0,
                otherTime: 0
            };
        }
    }
}

// Character customization system - modular 8-bit pixelated character
const PIXEL_SIZE = 4; // Size of each pixel for 8-bit look

// Draw character head (8-bit pixelated)
function drawCharacterHead(x, y, facingRight, skinColor) {
    const direction = facingRight ? 1 : -1;
    const px = PIXEL_SIZE;
    
    // Head shape (side view, pixelated)
    ctx.fillStyle = skinColor;
    // Head pixels - creating a rounded head shape
    const headPixels = [
        [0, 0, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1],
        [0, 0, 1, 1, 1, 0]
    ];
    
    for (let row = 0; row < headPixels.length; row++) {
        for (let col = 0; col < headPixels[row].length; col++) {
            if (headPixels[row][col] === 1) {
                ctx.fillRect(x + (col - 3) * px * direction, y - 24 + row * px, px, px);
            }
        }
    }
    
    // Eye (side view, facing direction)
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + (direction * 2 * px), y - 20, px, px);
}

// Draw character hair (8-bit pixelated)
function drawCharacterHair(x, y, facingRight, hairColor, hairStyle) {
    const direction = facingRight ? 1 : -1;
    const px = PIXEL_SIZE;
    
    if (hairStyle === 'bald') return;
    
    ctx.fillStyle = hairColor;
    
    if (hairStyle === 'default' || hairStyle === 'short') {
        // Short hair pixels
        const hairPixels = [
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [0, 1, 1, 1, 0]
        ];
        for (let row = 0; row < hairPixels.length; row++) {
            for (let col = 0; col < hairPixels[row].length; col++) {
                if (hairPixels[row][col] === 1) {
                    ctx.fillRect(x + (col - 2) * px * direction, y - 26 + row * px, px, px);
                }
            }
        }
    } else if (hairStyle === 'long') {
        // Long hair pixels
        const hairPixels = [
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1],
            [0, 0, 1, 1, 0]
        ];
        for (let row = 0; row < hairPixels.length; row++) {
            for (let col = 0; col < hairPixels[row].length; col++) {
                if (hairPixels[row][col] === 1) {
                    ctx.fillRect(x + (col - 2) * px * direction, y - 28 + row * px, px, px);
                }
            }
        }
    }
}

// Draw character hat (8-bit pixelated)
function drawCharacterHat(x, y, facingRight, hatColor, hatStyle) {
    const direction = facingRight ? 1 : -1;
    const px = PIXEL_SIZE;
    
    if (hatStyle === 'none') return;
    
    ctx.fillStyle = hatColor;
    
    if (hatStyle === 'cap') {
        // Cap pixels
        const capPixels = [
            [0, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1],
            [0, 0, 1, 1, 1, 0, 0]
        ];
        for (let row = 0; row < capPixels.length; row++) {
            for (let col = 0; col < capPixels[row].length; col++) {
                if (capPixels[row][col] === 1) {
                    ctx.fillRect(x + (col - 3) * px * direction, y - 30 + row * px, px, px);
                }
            }
        }
    } else if (hatStyle === 'beanie') {
        // Beanie pixels
        const beaniePixels = [
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [0, 1, 1, 1, 0]
        ];
        for (let row = 0; row < beaniePixels.length; row++) {
            for (let col = 0; col < beaniePixels[row].length; col++) {
                if (beaniePixels[row][col] === 1) {
                    ctx.fillRect(x + (col - 2) * px * direction, y - 30 + row * px, px, px);
                }
            }
        }
    } else if (hatStyle === 'crown') {
        // Crown pixels
        const crownPixels = [
            [1, 0, 1, 0, 1],
            [1, 1, 1, 1, 1],
            [0, 1, 1, 1, 0]
        ];
        for (let row = 0; row < crownPixels.length; row++) {
            for (let col = 0; col < crownPixels[row].length; col++) {
                if (crownPixels[row][col] === 1) {
                    ctx.fillRect(x + (col - 2) * px * direction, y - 30 + row * px, px, px);
                }
            }
        }
    }
}

// Draw character body/torso (8-bit pixelated)
function drawCharacterBody(x, y, facingRight, shirtColor) {
    const direction = facingRight ? 1 : -1;
    const px = PIXEL_SIZE;
    
    ctx.fillStyle = shirtColor;
    // Body pixels (torso)
    const bodyPixels = [
        [0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0]
    ];
    
    for (let row = 0; row < bodyPixels.length; row++) {
        for (let col = 0; col < bodyPixels[row].length; col++) {
            if (bodyPixels[row][col] === 1) {
                ctx.fillRect(x + (col - 2) * px * direction, y - 18 + row * px, px, px);
            }
        }
    }
}

// Draw character pants (8-bit pixelated)
function drawCharacterPants(x, y, facingRight, pantsColor) {
    const direction = facingRight ? 1 : -1;
    const px = PIXEL_SIZE;
    
    ctx.fillStyle = pantsColor;
    // Pants pixels (legs)
    const pantsPixels = [
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1]
    ];
    
    for (let row = 0; row < pantsPixels.length; row++) {
        for (let col = 0; col < pantsPixels[row].length; col++) {
            if (pantsPixels[row][col] === 1) {
                ctx.fillRect(x + (col - 1.5) * px * direction, y - 4 + row * px, px, px);
            }
        }
    }
}

// Draw character arms (8-bit pixelated)
function drawCharacterArms(x, y, facingRight, skinColor) {
    const direction = facingRight ? 1 : -1;
    const px = PIXEL_SIZE;
    
    ctx.fillStyle = skinColor;
    // Arms pixels (side view)
    // Back arm
    ctx.fillRect(x - 2 * px * direction, y - 14, px, 2 * px);
    // Front arm
    ctx.fillRect(x + 2 * px * direction, y - 14, px, 2 * px);
}

// Draw character accessory (scarf/cape) (8-bit pixelated)
function drawCharacterAccessory(x, y, facingRight, accessoryColor, accessoryType) {
    const direction = facingRight ? 1 : -1;
    const px = PIXEL_SIZE;
    
    if (accessoryType === 'none') return;
    
    ctx.fillStyle = accessoryColor;
    
    if (accessoryType === 'scarf') {
        // Scarf pixels (hanging down on back side)
        const scarfPixels = [
            [1],
            [1],
            [1],
            [1],
            [1]
        ];
        for (let row = 0; row < scarfPixels.length; row++) {
            ctx.fillRect(x - 2 * px * direction, y - 16 + row * px, px, px);
        }
    } else if (accessoryType === 'cape') {
        // Cape pixels (larger, flowing)
        const capePixels = [
            [1, 1],
            [1, 1],
            [1, 1],
            [1, 1],
            [1, 1],
            [1, 0]
        ];
        for (let row = 0; row < capePixels.length; row++) {
            for (let col = 0; col < capePixels[row].length; col++) {
                if (capePixels[row][col] === 1) {
                    ctx.fillRect(x + (col - 2) * px * direction, y - 18 + row * px, px, px);
                }
            }
        }
    }
}

// Main character drawing function - modular and customizable
function drawCharacter(x, y, facingRight = false) {
    const char = gameState.character;
    
    // Draw character parts in order (back to front)
    // 1. Accessory (scarf/cape) - drawn first so it's behind
    drawCharacterAccessory(x, y, facingRight, char.accessoryColor, char.accessoryType);
    
    // 2. Body/torso
    drawCharacterBody(x, y, facingRight, char.shirtColor);
    
    // 3. Pants
    drawCharacterPants(x, y, facingRight, char.pantsColor);
    
    // 4. Arms
    drawCharacterArms(x, y, facingRight, char.skinColor);
    
    // 5. Head
    drawCharacterHead(x, y, facingRight, char.skinColor);
    
    // 6. Hair (drawn after head but before hat)
    drawCharacterHair(x, y, facingRight, char.hairColor, char.hairStyle);
    
    // 7. Hat (drawn last so it's on top)
    drawCharacterHat(x, y, facingRight, char.hatColor, char.hatStyle);
    
    // 8. Fishing rod (when fishing) - 8-bit pixelated rod, pointing forward
    if (gameState.isCasting || gameState.isReeling) {
        drawFishingRod(x, y, facingRight);
    }
}

// Draw 8-bit pixelated fishing rod
function drawFishingRod(x, y, facingRight) {
    const direction = facingRight ? 1 : -1;
    const px = PIXEL_SIZE;
    const rodColor = '#d4af37'; // Golden color
    
    ctx.fillStyle = rodColor;
    
    // Rod pixels - diagonal line from character's hand
    const rodStartX = x + (direction * 2 * px);
    const rodStartY = y - 14;
    const rodEndX = x + (direction * 6 * px);
    const rodEndY = y - 20;
    
    // Draw rod as pixelated line
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const rodX = Math.floor((rodStartX + (rodEndX - rodStartX) * t) / px) * px;
        const rodY = Math.floor((rodStartY + (rodEndY - rodStartY) * t) / px) * px;
        ctx.fillRect(rodX, rodY, px, px);
    }
}

// Draw 8-bit pixelated fishing line
function drawFishingLine(startX, startY, endX, endY) {
    const px = PIXEL_SIZE;
    ctx.fillStyle = '#ffffff';
    
    // Calculate line distance
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < px) return; // Don't draw if too short
    
    // Draw dashed line in 8-bit style
    const dashLength = px * 3; // Longer dashes for visibility
    const gapLength = px * 2;
    const segmentLength = dashLength + gapLength;
    
    // Draw line segments
    let currentDistance = 0;
    while (currentDistance < distance) {
        const tStart = currentDistance / distance;
        const tEnd = Math.min((currentDistance + dashLength) / distance, 1);
        
        // Draw dash segment
        const dashSteps = Math.max(1, Math.floor((tEnd - tStart) * distance / px));
        for (let j = 0; j < dashSteps; j++) {
            const t = tStart + (j / dashSteps) * (tEnd - tStart);
            const lineX = Math.floor((startX + dx * t) / px) * px;
            const lineY = Math.floor((startY + dy * t) / px) * px;
            ctx.fillRect(lineX, lineY, px, px);
        }
        
        currentDistance += segmentLength;
    }
    
    // Also draw a continuous thin line for better visibility
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    const continuousSteps = Math.floor(distance / px);
    for (let i = 0; i <= continuousSteps; i++) {
        const t = i / continuousSteps;
        const lineX = Math.floor((startX + dx * t) / px) * px;
        const lineY = Math.floor((startY + dy * t) / px) * px;
        ctx.fillRect(lineX, lineY, px, px);
    }
}

// Draw 8-bit pixelated bobber
function drawBobber(x, y) {
    const px = PIXEL_SIZE;
    
    // Bobber pixels - circular shape approximated with pixels
    const bobberRadius = 6;
    const bobberColor = '#8b4513'; // Brown
    const bobberOutline = '#654321'; // Darker brown
    
    ctx.fillStyle = bobberColor;
    
    // Draw bobber as pixelated circle
    const startX = Math.floor((x - bobberRadius) / px) * px;
    const endX = Math.ceil((x + bobberRadius) / px) * px;
    const startY = Math.floor((y - bobberRadius) / px) * px;
    const endY = Math.ceil((y + bobberRadius) / px) * px;
    
    for (let pxX = startX; pxX <= endX; pxX += px) {
        for (let pxY = startY; pxY <= endY; pxY += px) {
            const dx = pxX - x;
            const dy = pxY - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < bobberRadius - 1) {
                // Inner fill
                ctx.fillStyle = bobberColor;
                ctx.fillRect(pxX, pxY, px, px);
            } else if (dist < bobberRadius + 1) {
                // Outline
                ctx.fillStyle = bobberOutline;
                ctx.fillRect(pxX, pxY, px, px);
            }
        }
    }
    
    // Add highlight pixel for 8-bit look
    ctx.fillStyle = '#a0522d'; // Lighter brown
    ctx.fillRect(Math.floor((x - 2) / px) * px, Math.floor((y - 2) / px) * px, px, px);
}

// Draw 8-bit pixelated fish with unique designs per type
function drawFish(x, y, fish) {
    const px = PIXEL_SIZE;
    const baseSize = 16; // Base size in pixels
    const sizeMultiplier = fish.size === 'Tiny' ? 0.7 : fish.size === 'Small' ? 0.85 : fish.size === 'Large' ? 1.3 : fish.size === 'Huge' ? 1.8 : 1.0;
    const size = Math.floor(baseSize * sizeMultiplier / px) * px; // Snap to pixel grid
    
    // Apply struggle animation rotation
    const rotation = Math.sin(gameState.struggleAnimation) * 0.2;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    // Draw special effects for event/legendary/mythical/universal fish (before translation)
    const isSpecial = fish.isEventFish || fish.rarity === 'Legendary' || fish.rarity === 'Mythical' || fish.rarity === 'Universal';
    if (isSpecial) {
        drawFishSpecialEffects(0, 0, fish, size, px);
    }
    
    // Draw fish based on type
    drawFishByType(0, 0, fish, size, px);
    
    ctx.restore();
}

// Draw special effects around special fish
function drawFishSpecialEffects(x, y, fish, size, px) {
    const time = Date.now() * 0.005;
    const effectRadius = size * 1.5;
    
    // Glow effect
    if (fish.isEventFish) {
        // Event fish - golden sparkles
        ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(time) * 0.3})`;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time;
            const sparkleX = Math.cos(angle) * effectRadius;
            const sparkleY = Math.sin(angle) * effectRadius;
            ctx.fillRect(Math.floor((x + sparkleX) / px) * px, Math.floor((y + sparkleY) / px) * px, px, px);
        }
    } else if (fish.rarity === 'Legendary') {
        // Legendary - pulsing ring
        const pulse = 0.5 + Math.sin(time * 2) * 0.3;
        ctx.fillStyle = `rgba(255, 165, 0, ${pulse})`;
        const ringRadius = effectRadius * pulse;
        // Draw ring as pixelated circle
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
            const ringX = Math.floor((Math.cos(angle) * ringRadius) / px) * px;
            const ringY = Math.floor((Math.sin(angle) * ringRadius) / px) * px;
            ctx.fillRect(x + ringX, y + ringY, px, px);
        }
    } else if (fish.rarity === 'Mythical') {
        // Mythical - rainbow particles
        const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + time;
            const particleX = Math.cos(angle) * effectRadius;
            const particleY = Math.sin(angle) * effectRadius;
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(Math.floor((x + particleX) / px) * px, Math.floor((y + particleY) / px) * px, px, px);
        }
    } else if (fish.rarity === 'Universal') {
        // Universal - intense multi-layered effects
        // Outer rotating rings
        for (let ring = 0; ring < 3; ring++) {
            const ringPulse = 0.4 + Math.sin(time * 2 + ring) * 0.3;
            const ringRadius = effectRadius * (0.8 + ring * 0.3) * ringPulse;
            const ringColors = ['#ff00ff', '#ff1493', '#9370db'];
            ctx.fillStyle = `rgba(255, 0, 255, ${ringPulse * 0.6})`;
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
                const ringX = Math.floor((Math.cos(angle + time * ring) * ringRadius) / px) * px;
                const ringY = Math.floor((Math.sin(angle + time * ring) * ringRadius) / px) * px;
                ctx.fillRect(x + ringX, y + ringY, px, px);
            }
        }
        // Inner rotating particles
        const universalColors = ['#ff00ff', '#ff1493', '#9370db', '#00ffff', '#ffff00'];
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2 + time * 2;
            const particleX = Math.cos(angle) * effectRadius * 0.6;
            const particleY = Math.sin(angle) * effectRadius * 0.6;
            ctx.fillStyle = universalColors[i % universalColors.length];
            ctx.fillRect(Math.floor((x + particleX) / px) * px, Math.floor((y + particleY) / px) * px, px, px);
        }
    }
}

// Draw fish by type with unique 8-bit designs
function drawFishByType(x, y, fish, size, px) {
    const bodyColor = fish.color;
    const darkColor = darkenColor(bodyColor, 0.3);
    const lightColor = lightenColor(bodyColor, 0.3);
    
    // Use designStyle from fish data, or fallback to name-based detection
    let style = fish.designStyle || 'default';
    
    // Fallback to name-based detection if designStyle not set
    if (!fish.designStyle) {
        const fishName = fish.type.toLowerCase();
        if (fishName.includes('glowfin') || fishName.includes('starfish') || fishName.includes('glow') || fishName.includes('shimmer') || fishName.includes('sparkle')) {
            style = 'glow';
        } else if (fishName.includes('shadow') || fishName.includes('phantom') || fishName.includes('void') || fishName.includes('ghost')) {
            style = 'shadow';
        } else if (fishName.includes('fire') || fishName.includes('dragon') || fishName.includes('flame') || fishName.includes('blaze')) {
            style = 'fire';
        } else if (fishName.includes('ice') || fishName.includes('crystal') || fishName.includes('frost') || fishName.includes('glacier')) {
            style = 'ice';
        } else if (fishName.includes('thunder') || fishName.includes('cosmic') || fishName.includes('electric') || fishName.includes('lightning')) {
            style = 'electric';
        }
    }
    
    drawPixelFish(x, y, size, px, bodyColor, darkColor, lightColor, style);
}

// Draw pixelated fish body
function drawPixelFish(x, y, size, px, bodyColor, darkColor, lightColor, style) {
    const width = Math.floor(size / px);
    const height = Math.floor((size * 0.6) / px);
    
    // Fish body pixels (side view)
    let bodyPixels;
    
    switch(style) {
        case 'glow':
            // Glowing fish - rounded with highlights
            bodyPixels = [
                [0, 0, 1, 1, 1, 0, 0],
                [0, 1, 2, 2, 2, 1, 0],
                [1, 2, 2, 2, 2, 2, 1],
                [1, 2, 2, 2, 2, 2, 1],
                [0, 1, 2, 2, 2, 1, 0],
                [0, 0, 1, 1, 1, 0, 0]
            ];
            break;
        case 'shadow':
            // Shadow fish - elongated and dark
            bodyPixels = [
                [0, 1, 1, 1, 1, 1, 0],
                [1, 1, 0, 1, 0, 1, 1],
                [1, 0, 0, 1, 0, 0, 1],
                [1, 0, 0, 1, 0, 0, 1],
                [1, 1, 0, 1, 0, 1, 1],
                [0, 1, 1, 1, 1, 1, 0]
            ];
            break;
        case 'fire':
            // Fire fish - angular and sharp
            bodyPixels = [
                [0, 0, 1, 1, 1, 0],
                [0, 1, 2, 1, 2, 1],
                [1, 2, 1, 2, 1, 2],
                [1, 1, 2, 1, 2, 1],
                [0, 1, 1, 2, 1, 0],
                [0, 0, 1, 1, 0, 0]
            ];
            break;
        case 'ice':
            // Ice fish - sharp and clear
            bodyPixels = [
                [0, 1, 1, 1, 1, 0],
                [1, 2, 1, 1, 2, 1],
                [1, 1, 2, 2, 1, 1],
                [1, 1, 2, 2, 1, 1],
                [1, 2, 1, 1, 2, 1],
                [0, 1, 1, 1, 1, 0]
            ];
            break;
        case 'electric':
            // Electric fish - zigzag pattern
            bodyPixels = [
                [0, 1, 0, 1, 0, 1, 0],
                [1, 2, 1, 2, 1, 2, 1],
                [0, 1, 2, 1, 2, 1, 0],
                [1, 2, 1, 2, 1, 2, 1],
                [0, 1, 0, 1, 0, 1, 0]
            ];
            break;
        default:
            // Default fish - simple rounded
            bodyPixels = [
                [0, 0, 1, 1, 1, 0],
                [0, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1],
                [0, 1, 1, 1, 1, 1],
                [0, 0, 1, 1, 1, 0]
            ];
    }
    
    // Draw body pixels
    for (let row = 0; row < bodyPixels.length; row++) {
        for (let col = 0; col < bodyPixels[row].length; col++) {
            const pixel = bodyPixels[row][col];
            if (pixel === 0) continue;
            
            const pixelX = Math.floor((x + (col - Math.floor(bodyPixels[row].length / 2)) * px) / px) * px;
            const pixelY = Math.floor((y + (row - Math.floor(bodyPixels.length / 2)) * px) / px) * px;
            
            if (pixel === 1) {
                ctx.fillStyle = bodyColor;
            } else if (pixel === 2) {
                ctx.fillStyle = lightColor;
            } else {
                ctx.fillStyle = darkColor;
            }
            
            ctx.fillRect(pixelX, pixelY, px, px);
        }
    }
    
    // Draw tail (varies by style)
    drawFishTail(x, y, size, px, bodyColor, darkColor, style);
    
    // Draw eye
    const eyeX = Math.floor((x + size * 0.3) / px) * px;
    const eyeY = Math.floor((y - size * 0.2) / px) * px;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(eyeX, eyeY, px, px);
    ctx.fillStyle = '#000000';
    ctx.fillRect(eyeX, eyeY, px / 2, px / 2);
}

// Draw fish tail (8-bit pixelated)
function drawFishTail(x, y, size, px, bodyColor, darkColor, style) {
    const tailOffset = Math.floor(size * 0.6 / px) * px;
    
    // Tail pixels (varies by style)
    let tailPixels;
    
    if (style === 'fire' || style === 'dragon') {
        // Sharp angular tail
        tailPixels = [
            [1, 0, 0],
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 1]
        ];
    } else if (style === 'ice' || style === 'crystal') {
        // Pointed tail
        tailPixels = [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 1],
            [0, 0, 1]
        ];
    } else {
        // Rounded tail
        tailPixels = [
            [0, 1, 1],
            [1, 1, 0],
            [0, 1, 1]
        ];
    }
    
    for (let row = 0; row < tailPixels.length; row++) {
        for (let col = 0; col < tailPixels[row].length; col++) {
            if (tailPixels[row][col] === 1) {
                const tailX = Math.floor((x - tailOffset + (col - tailPixels[row].length) * px) / px) * px;
                const tailY = Math.floor((y + (row - Math.floor(tailPixels.length / 2)) * px) / px) * px;
                ctx.fillStyle = bodyColor;
                ctx.fillRect(tailX, tailY, px, px);
            }
        }
    }
}

// Helper functions for color manipulation
function darkenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount * 255);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount * 255);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

function lightenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount * 255);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount * 255);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

function drawRipples() {
    if (!canvas) return;
    
    const now = Date.now();
    
    // Handle case where lastRippleSpawn might be uninitialized or very old
    if (!lastRippleSpawn || lastRippleSpawn === 0) {
        lastRippleSpawn = now;
    }
    
    // Handle large time gaps (e.g., tab was in background) - reset spawn timer
    if (now - lastRippleSpawn > 10000) { // More than 10 seconds gap
        lastRippleSpawn = now - RIPPLE_SPAWN_INTERVAL; // Reset to allow immediate spawn
    }
    
    // Spawn new ripples randomly (but not too frequently)
    if (now - lastRippleSpawn > RIPPLE_SPAWN_INTERVAL + Math.random() * 150) {
        // Random chance to spawn (not every interval)
        if (Math.random() < 0.7) {
            spawnRipple();
            lastRippleSpawn = now;
        }
    }
    
    // Update and draw existing ripples in 8-bit pixelated style
    const ripplePixelSize = 4; // Smaller pixels for ripples
    
    for (let i = waterRipples.length - 1; i >= 0; i--) {
        const ripple = waterRipples[i];
        
        // Calculate age based on actual time
        const age = now - ripple.spawnTime;
        const progress = age / ripple.lifetime;
        
        if (progress >= 1) {
            // Remove expired ripples
            waterRipples.splice(i, 1);
            continue;
        }
        
        // Calculate current radius (expands over time)
        ripple.radius = ripple.maxRadius * progress;
        
        // Calculate opacity (fades out)
        const opacity = ripple.opacity * (1 - progress);
        
        // Draw pixelated ripple (square/octagonal shape instead of smooth circle)
        const pixelOpacity = Math.floor(opacity * 255);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        
        // Draw ripple as pixelated rings
        const numRings = 3;
        for (let ring = 0; ring < numRings; ring++) {
            const ringRadius = ripple.radius * (0.3 + ring * 0.35);
            const ringOpacity = opacity * (1 - ring * 0.3);
            
            if (ringOpacity <= 0) continue;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${ringOpacity})`;
            
            // Draw pixelated circle (optimized - only check pixels near the ring)
            const startX = Math.floor((ripple.x - ringRadius) / ripplePixelSize) * ripplePixelSize;
            const endX = Math.ceil((ripple.x + ringRadius) / ripplePixelSize) * ripplePixelSize;
            const startY = Math.floor((ripple.y - ringRadius) / ripplePixelSize) * ripplePixelSize;
            const endY = Math.ceil((ripple.y + ringRadius) / ripplePixelSize) * ripplePixelSize;
            
            // Optimize: only check pixels in a band around the ring radius
            const ringThickness = ripplePixelSize * 1.5;
            const minDist = ringRadius - ringThickness;
            const maxDist = ringRadius + ringThickness;
            const minDistSq = minDist * minDist;
            const maxDistSq = maxDist * maxDist;
            
            for (let px = startX; px <= endX; px += ripplePixelSize) {
                for (let py = startY; py <= endY; py += ripplePixelSize) {
                    const dx = px - ripple.x;
                    const dy = py - ripple.y;
                    const distSq = dx * dx + dy * dy; // Use squared distance to avoid sqrt
                    
                    // Draw pixel if within ring radius (with some tolerance for pixelation)
                    if (distSq >= minDistSq && distSq <= maxDistSq) {
                        ctx.fillRect(px, py, ripplePixelSize, ripplePixelSize);
                    }
                }
            }
        }
    }
}

// Cast line
function castLine() {
    if (gameState.isCasting || gameState.isReeling) return;
    
    gameState.isCasting = true;
    gameState.lineDepth = 0;
    gameState.bobberThrown = false;
    gameState.bobberThrowProgress = 0;
    gameState.castStartTime = Date.now();
    gameState.castPhase = 'throwing'; // 'throwing', 'sinking', 'complete'
    
    // Initialize bobber position (will be set by draw function on first render)
    gameState.bobberX = 0;
    gameState.bobberY = 0;
}

// Quick Time Event
function startQTE() {
    if (gameState.qteActive) return; // Prevent duplicate QTE starts
    
    const fish = gameState.currentFish;
    const rarityData = fish.rarityData;
    
    gameState.qteActive = true;
    gameState.qteMaxTime = rarityData.qteTime;
    gameState.qteTimer = rarityData.qteTime;
    gameState.qteRequired = rarityData.qteRequired;
    gameState.qteSuccesses = 0;
    gameState.struggleAnimation = 0;
    
    const qteOverlay = document.getElementById('qte-overlay');
    const qteInstruction = document.getElementById('qte-instruction');
    const qteButton = document.getElementById('qte-button');
    const qteTimerBar = document.getElementById('qte-timer-bar');
    
    qteOverlay.classList.remove('hidden');
    
    // Generate new QTE prompt
    function generateQTEPrompt() {
        if (!gameState.qteActive) return;
        
        if (gameState.isMobile) {
            // Mobile: Generate tap location
            const locations = [
                { x: 20, y: 30 },
                { x: 80, y: 30 },
                { x: 20, y: 70 },
                { x: 80, y: 70 },
                { x: 50, y: 20 },
                { x: 50, y: 80 }
            ];
            const location = locations[Math.floor(Math.random() * locations.length)];
            gameState.qteCurrentTapLocation = location;
            
            qteButton.textContent = '👆';
            qteButton.style.position = 'absolute';
            qteButton.style.left = location.x + '%';
            qteButton.style.top = location.y + '%';
            qteButton.style.transform = 'translate(-50%, -50%)';
            qteInstruction.textContent = `Tap here! (${gameState.qteSuccesses + 1}/${gameState.qteRequired})`;
        } else {
            // Desktop: Generate key press
            const key = qteKeys[Math.floor(Math.random() * qteKeys.length)];
            gameState.qteCurrentKey = key;
            
            qteButton.textContent = key;
            qteButton.style.position = 'relative';
            qteButton.style.left = 'auto';
            qteButton.style.top = 'auto';
            qteButton.style.transform = 'none';
            qteInstruction.textContent = `Press ${key}! (${gameState.qteSuccesses + 1}/${gameState.qteRequired})`;
        }
    }
    
    generateQTEPrompt();
    
    // QTE timer countdown
    gameState.qteInterval = setInterval(() => {
        gameState.qteTimer -= 0.1;
        const percentage = (gameState.qteTimer / gameState.qteMaxTime) * 100;
        qteTimerBar.style.width = percentage + '%';
        
        // Change color based on time remaining
        qteTimerBar.classList.remove('warning', 'danger');
        if (percentage < 30) {
            qteTimerBar.classList.add('danger');
        } else if (percentage < 60) {
            qteTimerBar.classList.add('warning');
        }
        
        if (gameState.qteTimer <= 0) {
            clearInterval(gameState.qteInterval);
            failQTE();
        }
        
        if (gameState.qteSuccesses >= gameState.qteRequired) {
            clearInterval(gameState.qteInterval);
            successQTE();
        }
    }, 100);
    
    // Desktop: Keyboard handler
    gameState.qteKeyHandler = (e) => {
        if (!gameState.qteActive) return;
        // Prevent spacebar from triggering cast during QTE
        if (e.code === 'Space') {
            e.preventDefault();
            return;
        }
        const pressedKey = e.key.toUpperCase();
        
        if (pressedKey === gameState.qteCurrentKey) {
            e.preventDefault();
            gameState.qteSuccesses++;
            qteButton.style.transform = 'scale(0.9)';
            setTimeout(() => {
                if (gameState.qteActive) {
                    qteButton.style.transform = 'scale(1)';
                }
            }, 100);
            
            if (gameState.qteSuccesses < gameState.qteRequired) {
                // Generate new prompt
                gameState.qteTimer = gameState.qteMaxTime; // Reset timer for next prompt
                setTimeout(() => {
                    if (gameState.qteActive) {
                        generateQTEPrompt();
                    }
                }, 200);
            } else {
                document.removeEventListener('keydown', gameState.qteKeyHandler);
                gameState.qteKeyHandler = null;
            }
        }
    };
    
    // Mobile: Tap handler
    gameState.qteTapHandler = (e) => {
        if (!gameState.qteActive) return;
        e.preventDefault();
        
        const rect = qteButton.getBoundingClientRect();
        const tapX = e.touches ? e.touches[0].clientX : e.clientX;
        const tapY = e.touches ? e.touches[0].clientY : e.clientY;
        
        if (tapX >= rect.left && tapX <= rect.right && tapY >= rect.top && tapY <= rect.bottom) {
            gameState.qteSuccesses++;
            qteButton.style.transform = 'translate(-50%, -50%) scale(0.9)';
            setTimeout(() => {
                qteButton.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 100);
            
            if (gameState.qteSuccesses < gameState.qteRequired) {
                // Generate new prompt
                gameState.qteTimer = gameState.qteMaxTime; // Reset timer for next prompt
                setTimeout(() => {
                    if (gameState.qteActive) {
                        generateQTEPrompt();
                    }
                }, 200);
            } else {
                qteOverlay.removeEventListener('touchstart', gameState.qteTapHandler);
                qteOverlay.removeEventListener('click', gameState.qteTapHandler);
                gameState.qteTapHandler = null;
            }
        }
    };
    
    if (gameState.isMobile) {
        qteOverlay.addEventListener('touchstart', gameState.qteTapHandler, { passive: false });
        qteOverlay.addEventListener('click', gameState.qteTapHandler);
    } else {
        document.addEventListener('keydown', gameState.qteKeyHandler);
    }
}

function successQTE() {
    gameState.qteActive = false;
    gameState.struggleAnimation = 0;
    document.getElementById('qte-overlay').classList.add('hidden');
    
    // Clean up event listeners
    if (gameState.qteKeyHandler) {
        document.removeEventListener('keydown', gameState.qteKeyHandler);
        gameState.qteKeyHandler = null;
    }
    if (gameState.qteTapHandler) {
        const qteOverlay = document.getElementById('qte-overlay');
        qteOverlay.removeEventListener('touchstart', gameState.qteTapHandler);
        qteOverlay.removeEventListener('click', gameState.qteTapHandler);
        gameState.qteTapHandler = null;
    }
    
    // Start reeling animation (time-based, handled in draw function)
    gameState.reelStartTime = Date.now();
}

function failQTE() {
    gameState.qteActive = false;
    gameState.isReeling = false;
    gameState.currentFish = null;
    gameState.struggleAnimation = 0;
    document.getElementById('qte-overlay').classList.add('hidden');
    
    // Clean up event listeners
    if (gameState.qteKeyHandler) {
        document.removeEventListener('keydown', gameState.qteKeyHandler);
        gameState.qteKeyHandler = null;
    }
    if (gameState.qteTapHandler) {
        const qteOverlay = document.getElementById('qte-overlay');
        qteOverlay.removeEventListener('touchstart', gameState.qteTapHandler);
        qteOverlay.removeEventListener('click', gameState.qteTapHandler);
        gameState.qteTapHandler = null;
    }
    
    // Reset line
    const resetInterval = setInterval(() => {
        gameState.lineDepth -= 3;
        if (gameState.lineDepth <= 0) {
            clearInterval(resetInterval);
            gameState.lineDepth = 0;
        }
        draw();
    }, 16);
}

function catchFish() {
    gameState.isReeling = false;
    gameState.reelStartTime = 0;
    gameState.reelInitialDepth = null;
    gameState.gold += gameState.currentFish.value;
    gameState.fishCount++;
    const caughtFish = { ...gameState.currentFish };
    gameState.inventory.push(caughtFish);
    
    // Save user data
    saveUserData();
    
    // Check if this fish should be on leaderboard
    checkLeaderboardUpdate(caughtFish);
    
    updateUI();
    showFishInfo(caughtFish);
    updateBackpack();
    
    gameState.currentFish = null;
    gameState.lineDepth = 0;
    draw();
}

function showFishInfo(fish) {
    // Use provided fish or fallback to currentFish
    if (!fish) {
        fish = gameState.currentFish;
    }
    
    if (!fish) {
        console.error('No fish provided to showFishInfo');
        return;
    }
    
    const fishInfo = document.getElementById('fish-info');
    const fishDetails = document.getElementById('fish-details');
    
    // Render fish sprite with special effects
    let fishSprite = '';
    try {
        fishSprite = renderFishSprite(fish);
    } catch (error) {
        console.error('Error rendering fish sprite:', error);
        // Continue without sprite if rendering fails
    }
    
    const eventBadge = fish.isEventFish ? '<div style="color: #f39c12; font-weight: bold; margin-top: 5px;">⭐ Event Fish!</div>' : '';
    
    const spriteHtml = fishSprite ? `<img src="${fishSprite}" alt="${fish.type}" style="image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges; width: 96px; height: 96px; margin-bottom: 10px;" />` : '';
    
    fishDetails.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 15px;">
            ${spriteHtml}
            <div class="fish-name" style="color: ${fish.rarityColor}">${fish.type}</div>
        </div>
        <div class="fish-attribute">Rarity: <span class="rarity-${fish.rarity.toLowerCase()}">${fish.rarity}</span></div>
        <div class="fish-attribute">Size: ${fish.size}</div>
        <div class="fish-attribute">Value: <span style="color: #f39c12">${fish.value} gold</span></div>
        ${eventBadge}
    `;
    
    fishInfo.classList.remove('hidden');
}

function updateUI() {
    document.getElementById('gold').textContent = gameState.gold;
    document.getElementById('fish-count').textContent = gameState.fishCount;
}

// Render fish sprite to canvas and return as data URL (includes special effects)
function renderFishSprite(fish) {
    if (!fish) {
        throw new Error('No fish provided to renderFishSprite');
    }
    
    const spriteSize = 64; // Size of sprite canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = spriteSize;
    tempCanvas.height = spriteSize;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {
        throw new Error('Could not get 2d context for sprite rendering');
    }
    
    // Save original context (may be undefined if game not initialized)
    const originalCtx = typeof ctx !== 'undefined' ? ctx : null;
    const originalCanvas = typeof canvas !== 'undefined' ? canvas : null;
    
    // Temporarily use temp canvas
    ctx = tempCtx;
    canvas = tempCanvas;
    
    // Clear canvas with transparent background
    ctx.clearRect(0, 0, spriteSize, spriteSize);
    
    // Draw fish centered (without rotation for sprite)
    const baseSize = 16;
    const sizeMultiplier = fish.size === 'Tiny' ? 0.7 : fish.size === 'Small' ? 0.85 : fish.size === 'Large' ? 1.3 : fish.size === 'Huge' ? 1.8 : 1.0;
    const size = Math.floor(baseSize * sizeMultiplier / PIXEL_SIZE) * PIXEL_SIZE;
    
    // Draw special effects for event/legendary/mythical/universal fish
    const isSpecial = fish.isEventFish || fish.rarity === 'Legendary' || fish.rarity === 'Mythical' || fish.rarity === 'Universal';
    if (isSpecial) {
        drawFishSpecialEffects(spriteSize / 2, spriteSize / 2, fish, size, PIXEL_SIZE);
    }
    
    // Draw fish without rotation for sprite
    ctx.save();
    drawFishByType(spriteSize / 2, spriteSize / 2, fish, size, PIXEL_SIZE);
    ctx.restore();
    
    // Restore original context (only if it existed)
    if (originalCtx !== null) {
        ctx = originalCtx;
    }
    if (originalCanvas !== null) {
        canvas = originalCanvas;
    }
    
    // Return as data URL
    return tempCanvas.toDataURL();
}

function updateBackpack() {
    const backpackList = document.getElementById('backpack-list');
    backpackList.innerHTML = '';
    
    // Override CSS grid - set to block to allow our custom layout
    backpackList.style.display = 'block';
    
    // Show all fish
    let allFish = [...gameState.inventory];
    
    if (allFish.length === 0) {
        backpackList.innerHTML = '<div style="text-align: center; color: #95a5a6; padding: 20px;">No fish caught yet!</div>';
        return;
    }
    
    // Sort fish based on current sort preference
    const rarityOrder = {
        'Common': 1,
        'Uncommon': 2,
        'Rare': 3,
        'Epic': 4,
        'Legendary': 5,
        'Mythical': 6,
        'Universal': 7
    };
    
    switch(gameState.backpackSort) {
        case 'value':
            // Sort by value (highest first)
            allFish.sort((a, b) => b.value - a.value);
            break;
        case 'rarity':
            // Sort by rarity (highest first), then by value
            allFish.sort((a, b) => {
                const rarityDiff = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
                if (rarityDiff !== 0) return rarityDiff;
                return b.value - a.value;
            });
            break;
        case 'recent':
        default:
            // Sort by recent (most recent first) - reverse array
            allFish.reverse();
            break;
    }
    
    // Create container for layout
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '20px';
    container.style.alignItems = 'center'; // Center everything
    container.style.width = '100%';
    
    // Only show "most valuable" section when not sorting by value
    if (gameState.backpackSort !== 'value') {
        // Find most valuable fish (for display at top)
        const mostValuableFish = allFish.reduce((max, fish) => 
            fish.value > max.value ? fish : max, allFish[0]);
        
        // Display most valuable fish at the top and center
        const mostValuableDiv = document.createElement('div');
        mostValuableDiv.style.display = 'flex';
        mostValuableDiv.style.flexDirection = 'column';
        mostValuableDiv.style.alignItems = 'center';
        mostValuableDiv.style.marginBottom = '20px';
        mostValuableDiv.style.width = '100%';
        
        // Render fish sprite
        const mostValuableSprite = renderFishSprite(mostValuableFish);
        
        mostValuableDiv.innerHTML = `
            <div style="color: #f39c12; font-size: 1.2em; margin-bottom: 10px; text-align: center;">🏆 Most Valuable Fish</div>
            <div class="backpack-item most-valuable-item" style="max-width: 300px; width: 100%; border: 3px solid #f39c12; padding: 15px; display: flex; flex-direction: column; align-items: center;">
                <img src="${mostValuableSprite}" alt="${mostValuableFish.type}" style="image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges; width: 64px; height: 64px; margin-bottom: 10px;" />
                <div class="backpack-item-name" style="color: ${mostValuableFish.rarityColor}; font-size: 1.1em; text-align: center;">${mostValuableFish.type}</div>
                <div class="backpack-item-details" style="text-align: center; margin: 5px 0;">${mostValuableFish.size} ${mostValuableFish.rarity}</div>
                <div class="backpack-item-value" style="text-align: center; font-size: 1.2em; color: #f39c12;">${mostValuableFish.value}G</div>
            </div>
        `;
        container.appendChild(mostValuableDiv);
        
        // Add separator
        const separator = document.createElement('div');
        separator.style.width = '100%';
        separator.style.height = '2px';
        separator.style.background = '#34495e';
        separator.style.margin = '10px 0';
        container.appendChild(separator);
        
        // Filter out the most valuable fish from the list (to avoid duplication)
        allFish = allFish.filter(fish => 
            !(fish.value === mostValuableFish.value && fish.type === mostValuableFish.type)
        );
        
        // Add duplicates of most valuable fish back to the list
        const mostValuableCount = gameState.inventory.filter(fish => 
            fish.value === mostValuableFish.value && fish.type === mostValuableFish.type
        ).length;
        
        if (mostValuableCount > 1) {
            // Add remaining duplicates of most valuable fish to the list
            for (let i = 1; i < mostValuableCount; i++) {
                allFish.push(mostValuableFish);
            }
            // Re-sort after adding duplicates
            switch(gameState.backpackSort) {
                case 'rarity':
                    allFish.sort((a, b) => {
                        const rarityDiff = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
                        if (rarityDiff !== 0) return rarityDiff;
                        return b.value - a.value;
                    });
                    break;
                case 'recent':
                default:
                    // Keep recent order (most valuable duplicates go to end)
                    break;
            }
        }
    }
    
    // Create grid for all fish
    const allFishContainer = document.createElement('div');
    allFishContainer.style.display = 'grid';
    allFishContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
    allFishContainer.style.gap = '15px';
    allFishContainer.style.width = '100%';
    allFishContainer.style.justifyItems = 'stretch'; // Stretch items to fill grid cells
    
    // Add all fish
    allFish.forEach(fish => {
        const fishSprite = renderFishSprite(fish);
        const fishDiv = document.createElement('div');
        fishDiv.className = 'backpack-item';
        fishDiv.style.display = 'flex';
        fishDiv.style.flexDirection = 'column';
        fishDiv.style.alignItems = 'center';
        fishDiv.style.padding = '10px';
        fishDiv.style.width = '100%';
        fishDiv.innerHTML = `
            <img src="${fishSprite}" alt="${fish.type}" style="image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges; width: 48px; height: 48px; margin-bottom: 8px;" />
            <div class="backpack-item-name" style="color: ${fish.rarityColor}; text-align: center; font-size: 0.9em;">${fish.type}</div>
            <div class="backpack-item-details" style="text-align: center; font-size: 0.8em; margin: 3px 0;">${fish.size} ${fish.rarity}</div>
            <div class="backpack-item-value" style="text-align: center; color: #f39c12; font-size: 0.9em;">${fish.value}G</div>
        `;
        allFishContainer.appendChild(fishDiv);
    });
    
    container.appendChild(allFishContainer);
    backpackList.appendChild(container);
}

// Authentication and User Management - API-based
async function saveUserData() {
    if (!gameState.currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/user-data/${gameState.currentUser}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gold: gameState.gold,
                fishCount: gameState.fishCount,
                inventory: gameState.inventory,
                settings: gameState.settings,
                character: gameState.character
            })
        });
        
        const result = await response.json();
        if (!result.success) {
            console.error('Failed to save user data:', result.error);
        }
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

async function loadUserData(username) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user-data/${username}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            gameState.gold = result.data.gold || 0;
            gameState.fishCount = result.data.fishCount || 0;
            gameState.inventory = result.data.inventory || [];
            
            // Load admin status from database
            gameState.isAdmin = result.data.isAdmin === true;
            
            // Load settings from database (primary source)
            if (result.data.settings) {
                gameState.settings = { 
                    rainEnabled: true,  // defaults
                    grassEnabled: true,
                    ...result.data.settings  // database settings override defaults
                };
            }
            
            // Load character customization from database
            if (result.data.character) {
                gameState.character = {
                    skinColor: '#ffdbac',
                    hairColor: '#8b4513',
                    hairStyle: 'default',
                    shirtColor: '#4a5568',
                    pantsColor: '#2c3e50',
                    hatColor: '#d4af37',
                    hatStyle: 'cap',
                    accessoryColor: '#dc2626',
                    accessoryType: 'scarf',
                    ...result.data.character  // database character overrides defaults
                };
            }
            
            // Update localStorage to match database
            localStorage.setItem('fishingGameSettings', JSON.stringify(gameState.settings));
            
            updateUI();
            updateBackpack();
            updateSettingsUI();
            
            // Start admin panel updates if admin
            if (gameState.isAdmin && !gameState.adminPanelInterval) {
                gameState.adminPanelInterval = setInterval(() => {
                    updateAdminPanel();
                }, 1000);
            }
        } else {
            // Load from localStorage if API fails
            loadSettings();
            gameState.isAdmin = false; // Not admin if no database data
            updateSettingsUI();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        // Load from localStorage as fallback
        loadSettings();
        gameState.isAdmin = false; // Not admin if error loading
        updateSettingsUI();
    }
}

function loadSettings() {
    // Load from localStorage as fallback (for when not logged in)
    const savedSettings = localStorage.getItem('fishingGameSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            // Only use localStorage settings if database settings aren't available
            if (!gameState.currentUser) {
                gameState.settings = { ...gameState.settings, ...settings };
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
}

function saveSettings() {
    // Save to localStorage as backup
    localStorage.setItem('fishingGameSettings', JSON.stringify(gameState.settings));
    // Save to server if logged in (this is the primary storage)
    if (gameState.currentUser) {
        saveUserData();
    }
}

function updateSettingsUI() {
    const rainToggle = document.getElementById('setting-rain');
    const grassToggle = document.getElementById('setting-grass');
    
    if (rainToggle) {
        rainToggle.checked = gameState.settings.rainEnabled;
    }
    if (grassToggle) {
        grassToggle.checked = gameState.settings.grassEnabled;
    }
    
    // Always update admin panel visibility
    updateAdminPanel();
}

function updateAdminPanel() {
    const adminPanelSection = document.getElementById('admin-panel-section');
    const adminPanel = document.getElementById('admin-panel');
    const timeInfo = document.getElementById('admin-time-info');
    const eventInfo = document.getElementById('admin-event-info');
    
    if (!adminPanelSection) return;
    
    // Always set visibility based on admin status
    if (gameState.isAdmin) {
        adminPanelSection.classList.remove('hidden');
        
        // Update content if elements exist
        if (adminPanel && timeInfo && eventInfo) {
            const timeInfoData = getTimeOfDayInfo();
            const event = getCurrentEvent();
            
            timeInfo.innerHTML = `
                <strong>Current Time:</strong> ${timeInfoData.timeString}<br>
                <strong>Date:</strong> ${timeInfoData.dateString}<br>
                <strong>Phase:</strong> <span style="text-transform: capitalize; color: #3498db;">${timeInfoData.phase}</span> (Hour: ${timeInfoData.hour})
            `;
            
            if (event) {
                eventInfo.innerHTML = `
                    <strong>Active Event:</strong> ${event.name}<br>
                    <strong>Description:</strong> ${event.description}<br>
                    <strong>Special Fish:</strong> ${event.specialFish.join(', ')}<br>
                    <strong>Value Multiplier:</strong> ${event.multiplier}x
                `;
            } else {
                eventInfo.innerHTML = '<em>No active event</em>';
            }
        }
    } else {
        adminPanelSection.classList.add('hidden');
    }
}

async function register(username, password, passwordConfirm) {
    if (!username || !password) {
        return { success: false, error: 'Username and password are required' };
    }
    
    if (password !== passwordConfirm) {
        return { success: false, error: 'Passwords do not match' };
    }
    
    if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                passwordConfirm
            })
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        return { success: false, error: 'Network error. Please try again.' };
    }
}

async function login(username, password) {
    if (!username || !password) {
        return { success: false, error: 'Username and password are required' };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            gameState.currentUser = username;
            await loadUserData(username);
        }
        
        return result;
    } catch (error) {
        return { success: false, error: 'Network error. Please try again.' };
    }
}

async function logout() {
    await saveUserData();
    gameState.currentUser = null;
    gameState.gold = 0;
    gameState.fishCount = 0;
    gameState.inventory = [];
    updateUI();
    updateBackpack();
    localStorage.removeItem('fishingGameCurrentUser');
}

// Leaderboard System - API-based
async function checkLeaderboardUpdate(fish) {
    if (!gameState.currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/leaderboard`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: gameState.currentUser,
                fish: {
                    type: fish.type,
                    rarity: fish.rarity,
                    size: fish.size,
                    value: fish.value,
                    rarityColor: fish.rarityColor
                }
            })
        });
        
        const result = await response.json();
        if (!result.success) {
            console.error('Failed to update leaderboard:', result.error);
        }
    } catch (error) {
        console.error('Error updating leaderboard:', error);
    }
}

async function displayLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '<div style="text-align: center; color: #95a5a6; padding: 20px;">Loading...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/leaderboard`);
        const result = await response.json();
        
        leaderboardList.innerHTML = '';
        
        if (!result.success || !result.leaderboard || result.leaderboard.length === 0) {
            leaderboardList.innerHTML = '<div style="text-align: center; color: #95a5a6; padding: 20px;">No entries yet!</div>';
            return;
        }
        
        result.leaderboard.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = `leaderboard-item rank-${index + 1}`;
            
            const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            
            item.innerHTML = `
                <div class="leaderboard-rank">${rankEmoji || (index + 1)}</div>
                <div class="leaderboard-user-info">
                    <div class="leaderboard-username">${entry.username}</div>
                    <div class="leaderboard-fish-info">
                        <span class="leaderboard-fish-name" style="color: ${entry.fishRarityColor}">${entry.fishName}</span>
                        - ${entry.fishSize} ${entry.fishRarity}
                    </div>
                </div>
                <div class="leaderboard-value">${entry.fishValue}G</div>
            `;
            leaderboardList.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        leaderboardList.innerHTML = '<div style="text-align: center; color: #e74c3c; padding: 20px;">Error loading leaderboard</div>';
    }
}

// 8-bit Icon Drawing Functions - Beveled frame style with shading
function create8BitIcon(iconType, displaySize = 32) {
    // Use 8x8 pixel grid, scale up for crisp rendering
    const gridSize = 8;
    const scale = 4; // Scale factor for crisp pixels
    const canvas = document.createElement('canvas');
    canvas.width = gridSize * scale;
    canvas.height = gridSize * scale;
    const ctx = canvas.getContext('2d');
    
    // CRITICAL: Disable image smoothing for true pixel art
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    
    const px = scale; // Each pixel in the grid is scale x scale pixels
    
    // Color palette: 0=transparent, 1=light grey (icon highlight), 2=medium grey (icon), 3=dark grey (icon shadow), 4=black (outline), 5=light bg (bevel highlight), 6=medium bg, 7=dark bg (bevel shadow)
    const colors = {
        0: 'transparent',
        1: '#e0e0e0', // Light grey - icon highlight
        2: '#b0b0b0', // Medium grey - icon base
        3: '#808080', // Dark grey - icon shadow
        4: '#000000', // Black - outline
        5: '#c0c0c0', // Light bg - bevel highlight
        6: '#808080', // Medium bg - frame
        7: '#606060'  // Dark bg - bevel shadow
    };
    
    let iconPixels;
    
    switch(iconType) {
        case 'backpack':
            // 8-bit backpack icon - clear backpack with top flap and side straps
            iconPixels = [
                [5,5,5,5,5,5,5,5], // Top bevel highlight
                [5,6,6,6,6,6,6,7], // Frame top
                [5,6,4,4,4,4,6,7], // Flap outline (black)
                [5,6,4,1,1,4,6,7], // Flap highlight (light grey)
                [5,6,4,2,2,4,6,7], // Flap base (medium grey)
                [5,6,4,6,6,4,6,7], // Straps area (background color shows through)
                [5,6,4,2,2,4,6,7], // Main body
                [7,7,7,7,7,7,7,7]  // Bottom bevel shadow
            ];
            break;
            
        case 'settings':
            // 8-bit gear icon - clear gear with visible teeth around perimeter
            iconPixels = [
                [5,5,5,5,5,5,5,5], // Top bevel highlight
                [5,6,4,1,1,4,6,7], // Top teeth (light grey with black outline)
                [5,6,1,4,4,1,6,7], // Gear rim (light grey outline, background center)
                [5,6,4,2,2,4,6,7], // Gear body (medium grey with black outline)
                [5,6,4,3,3,4,6,7], // Gear center shadow (dark grey)
                [5,6,1,4,4,1,6,7], // Bottom rim
                [5,6,4,1,1,4,6,7], // Bottom teeth
                [7,7,7,7,7,7,7,7]  // Bottom bevel shadow
            ];
            break;
            
        case 'leaderboard':
            // 8-bit trophy icon - clear trophy cup with handles and base
            iconPixels = [
                [5,5,5,5,5,5,5,5], // Top bevel highlight
                [5,6,4,4,4,4,6,7], // Trophy rim outline (black)
                [5,6,4,1,1,4,6,7], // Cup rim highlight (light grey)
                [5,6,4,2,2,4,6,7], // Cup top (medium grey)
                [5,6,2,6,6,2,6,7], // Cup with handles (background shows handles)
                [5,6,4,2,2,4,6,7], // Cup body
                [5,6,4,3,3,4,6,7], // Stem/pedestal (dark grey shadow)
                [7,7,7,7,7,7,7,7]  // Bottom bevel shadow
            ];
            break;
    }
    
    // Draw beveled frame and icon
    drawBeveledIcon(ctx, iconPixels, colors, px);
    
    return canvas.toDataURL();
}

function drawBeveledIcon(ctx, pixels, colors, px) {
    // Draw each pixel with its assigned color
    for (let row = 0; row < pixels.length; row++) {
        for (let col = 0; col < pixels[row].length; col++) {
            const pixelValue = pixels[row][col];
            if (pixelValue !== 0) {
                const x = Math.floor(col * px);
                const y = Math.floor(row * px);
                ctx.fillStyle = colors[pixelValue] || '#ffffff';
                ctx.fillRect(x, y, px, px);
            }
        }
    }
}

// Initialize game when DOM is ready
function initGame() {
    // Initialize canvas
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2d context!');
        return;
    }
    
    // Resize canvas to fill screen
    resizeCanvas();
    // Remove any existing resize listener and add a new one
    window.removeEventListener('resize', resizeCanvas);
    window.addEventListener('resize', resizeCanvas);
    
    // Function to close fish info (without casting)
    function closeFishInfo() {
        const fishInfo = document.getElementById('fish-info');
        if (fishInfo && !fishInfo.classList.contains('hidden')) {
            fishInfo.classList.add('hidden');
        }
    }
    
    // Function to close fish info and cast again (for spacebar)
    function closeFishInfoAndCast() {
        const fishInfo = document.getElementById('fish-info');
        if (fishInfo && !fishInfo.classList.contains('hidden')) {
            fishInfo.classList.add('hidden');
            // Cast again if not already casting/reeling
            if (!gameState.isCasting && !gameState.isReeling && !gameState.qteActive && !gameState.spacebarPressed) {
                gameState.spacebarPressed = true;
                castLine();
                // Reset flag after a short delay to allow next cast
                setTimeout(() => {
                    gameState.spacebarPressed = false;
                }, 100);
            }
        }
    }
    
    // Spacebar casting (only when not in QTE)
    // Also closes fish info menu if it's open
    // Prevents multiple casts when spacebar is held down
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            // Prevent default scrolling behavior
            e.preventDefault();
            
            // Prevent multiple casts if spacebar is already being processed
            if (gameState.spacebarPressed) {
                return;
            }
            
            const fishInfo = document.getElementById('fish-info');
            // If fish info is visible, close it and cast
            if (fishInfo && !fishInfo.classList.contains('hidden')) {
                closeFishInfoAndCast();
                return;
            }
            // Otherwise, normal casting behavior
            if (!gameState.isCasting && !gameState.isReeling && !gameState.qteActive) {
                gameState.spacebarPressed = true;
                castLine();
                // Reset flag after a short delay to allow next cast
                setTimeout(() => {
                    gameState.spacebarPressed = false;
                }, 100);
            }
        }
    });
    
    // Reset spacebar flag when key is released (helps prevent stuck state)
    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            gameState.spacebarPressed = false;
        }
    });

    // Cast button at top
    const castButtonTop = document.getElementById('cast-button-top');
    if (castButtonTop) {
        castButtonTop.addEventListener('click', castLine);
        castButtonTop.addEventListener('touchstart', (e) => {
            e.preventDefault();
            castLine();
        });
    }

    // Backpack button
    const backpackButton = document.getElementById('backpack-button');
    if (backpackButton) {
        backpackButton.addEventListener('click', () => {
            const backpackOverlay = document.getElementById('backpack-overlay');
            if (backpackOverlay) {
                backpackOverlay.classList.remove('hidden');
                updateBackpackSortButtons();
                updateBackpack();
            }
        });
    }

    const backpackClose = document.getElementById('backpack-close');
    if (backpackClose) {
        backpackClose.addEventListener('click', () => {
            const backpackOverlay = document.getElementById('backpack-overlay');
            if (backpackOverlay) {
                backpackOverlay.classList.add('hidden');
            }
        });
    }
    
    // Backpack sorting buttons
    function updateBackpackSortButtons() {
        const sortRecent = document.getElementById('backpack-sort-recent');
        const sortValue = document.getElementById('backpack-sort-value');
        const sortRarity = document.getElementById('backpack-sort-rarity');
        
        // Reset all buttons
        [sortRecent, sortValue, sortRarity].forEach(btn => {
            if (btn) {
                btn.classList.remove('is-primary');
                btn.classList.add('is-dark');
            }
        });
        
        // Highlight active sort button
        switch(gameState.backpackSort) {
            case 'recent':
                if (sortRecent) {
                    sortRecent.classList.remove('is-dark');
                    sortRecent.classList.add('is-primary');
                }
                break;
            case 'value':
                if (sortValue) {
                    sortValue.classList.remove('is-dark');
                    sortValue.classList.add('is-primary');
                }
                break;
            case 'rarity':
                if (sortRarity) {
                    sortRarity.classList.remove('is-dark');
                    sortRarity.classList.add('is-primary');
                }
                break;
        }
    }
    
    const sortRecentBtn = document.getElementById('backpack-sort-recent');
    const sortValueBtn = document.getElementById('backpack-sort-value');
    const sortRarityBtn = document.getElementById('backpack-sort-rarity');
    
    if (sortRecentBtn) {
        sortRecentBtn.addEventListener('click', () => {
            gameState.backpackSort = 'recent';
            updateBackpackSortButtons();
            updateBackpack();
        });
    }
    
    if (sortValueBtn) {
        sortValueBtn.addEventListener('click', () => {
            gameState.backpackSort = 'value';
            updateBackpackSortButtons();
            updateBackpack();
        });
    }
    
    if (sortRarityBtn) {
        sortRarityBtn.addEventListener('click', () => {
            gameState.backpackSort = 'rarity';
            updateBackpackSortButtons();
            updateBackpack();
        });
    }
    

    // Continue button for fish info (only closes, doesn't auto-cast)
    const continueButton = document.getElementById('continue-button');
    if (continueButton) {
        continueButton.addEventListener('click', closeFishInfo);
    }

    // Authentication handlers
    const authOverlay = document.getElementById('auth-overlay');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const authError = document.getElementById('auth-error');
    
    // Check if user is already logged in (from session)
    const savedUser = localStorage.getItem('fishingGameCurrentUser');
    if (savedUser) {
        gameState.currentUser = savedUser;
        loadUserData(savedUser).then(() => {
            authOverlay.classList.add('hidden');
        });
    } else {
        authOverlay.classList.remove('hidden');
    }
    
    showRegister?.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        authError.classList.add('hidden');
    });
    
    showLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        authError.classList.add('hidden');
    });
    
    loginButton?.addEventListener('click', async () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const result = await login(username, password);
        if (result.success) {
            localStorage.setItem('fishingGameCurrentUser', username);
            authOverlay.classList.add('hidden');
            authError.classList.add('hidden');
        } else {
            authError.textContent = result.error;
            authError.classList.remove('hidden');
        }
    });
    
    registerButton?.addEventListener('click', async () => {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;
        
        const result = await register(username, password, passwordConfirm);
        if (result.success) {
            gameState.currentUser = username;
            localStorage.setItem('fishingGameCurrentUser', username);
            authOverlay.classList.add('hidden');
            authError.classList.add('hidden');
        } else {
            authError.textContent = result.error;
            authError.classList.remove('hidden');
        }
    });
    
    // Leaderboard button
    const leaderboardButton = document.getElementById('leaderboard-button');
    const leaderboardOverlay = document.getElementById('leaderboard-overlay');
    const leaderboardClose = document.getElementById('leaderboard-close');
    
    leaderboardButton?.addEventListener('click', () => {
        displayLeaderboard();
        leaderboardOverlay.classList.remove('hidden');
    });
    
    leaderboardClose?.addEventListener('click', () => {
        leaderboardOverlay.classList.add('hidden');
    });
    
    // Settings button and overlay
    const settingsButton = document.getElementById('settings-button');
    const settingsOverlay = document.getElementById('settings-overlay');
    const settingsClose = document.getElementById('settings-close');
    const rainToggle = document.getElementById('setting-rain');
    const grassToggle = document.getElementById('setting-grass');
    const logoutButton = document.getElementById('logout-button');
    
    settingsButton?.addEventListener('click', () => {
        updateSettingsUI();
        settingsOverlay.classList.remove('hidden');
    });
    
    settingsClose?.addEventListener('click', () => {
        settingsOverlay.classList.add('hidden');
    });
    
    rainToggle?.addEventListener('change', (e) => {
        gameState.settings.rainEnabled = e.target.checked;
        saveSettings();
    });
    
    grassToggle?.addEventListener('change', (e) => {
        gameState.settings.grassEnabled = e.target.checked;
        saveSettings();
    });
    
    logoutButton?.addEventListener('click', async () => {
        if (confirm('Are you sure you want to logout?')) {
            await logout();
            settingsOverlay.classList.add('hidden');
            authOverlay.classList.remove('hidden');
        }
    });
    
    // Admin refresh leaderboard button
    const refreshLeaderboardButton = document.getElementById('admin-refresh-leaderboard');
    const refreshStatusDiv = document.getElementById('admin-refresh-status');
    if (refreshLeaderboardButton) {
        refreshLeaderboardButton.addEventListener('click', async () => {
            if (!gameState.isAdmin) {
                refreshStatusDiv.textContent = 'Error: Admin access required';
                refreshStatusDiv.style.color = '#e74c3c';
                return;
            }
            
            refreshLeaderboardButton.disabled = true;
            refreshStatusDiv.textContent = 'Refreshing leaderboard...';
            refreshStatusDiv.style.color = '#f39c12';
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/leaderboard/refresh`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    refreshStatusDiv.textContent = `✓ ${result.message}`;
                    refreshStatusDiv.style.color = '#2ecc71';
                    
                    // Clear status after 3 seconds
                    setTimeout(() => {
                        refreshStatusDiv.textContent = '';
                    }, 3000);
                } else {
                    refreshStatusDiv.textContent = `Error: ${result.error}`;
                    refreshStatusDiv.style.color = '#e74c3c';
                }
            } catch (error) {
                console.error('Error refreshing leaderboard:', error);
                refreshStatusDiv.textContent = 'Error: Failed to refresh leaderboard';
                refreshStatusDiv.style.color = '#e74c3c';
            } finally {
                refreshLeaderboardButton.disabled = false;
            }
        });
    }
    
    // Load settings on init
    loadSettings();
    // Ensure admin panel is hidden initially
    gameState.isAdmin = false;
    updateAdminPanel();
    updateSettingsUI();
    
    // Allow Enter key to submit forms
    document.getElementById('login-password')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });
    
    document.getElementById('register-password-confirm')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            registerButton.click();
        }
    });

    // Initial draw
    draw();

    // Animation loop - runs continuously for struggling fish animation
    function gameLoop() {
        draw();
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

