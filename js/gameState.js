// Game state management
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gameState, canvas, ctx, skyGradientCache };
}

// Export to global scope for browser
if (typeof window !== 'undefined') {
    window.gameState = gameState;
    window.skyGradientCache = skyGradientCache;
    // Canvas and ctx will be initialized in game.js initGame()
}

