// Game logic: casting, catching fish
// Uses global gameState, generateFish, startQTE, saveUserData, checkLeaderboardUpdate

function castLine() {
    if (gameState.isCasting || gameState.isReeling) return;
    
    // Don't allow casting while backpack or shop is open
    const backpackOverlay = document.getElementById('backpack-overlay');
    const shopOverlay = document.getElementById('shop-overlay');
    if ((backpackOverlay && !backpackOverlay.classList.contains('hidden')) ||
        (shopOverlay && !shopOverlay.classList.contains('hidden'))) {
        return;
    }
    
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

function catchFish() {
    gameState.isReeling = false;
    gameState.reelStartTime = 0;
    gameState.reelInitialDepth = null;
    // Gold is now earned by selling fish, not catching them
    gameState.fishCount++;
    const caughtFish = { ...gameState.currentFish };
    gameState.inventory.push(caughtFish);
    
    // Save user data
    if (typeof saveUserData === 'function') {
        saveUserData();
    }
    
    // Check if this fish should be on leaderboard
    if (typeof checkLeaderboardUpdate === 'function') {
        checkLeaderboardUpdate(caughtFish);
    }
    
    // Update UI
    if (typeof updateUI === 'function') updateUI();
    if (typeof showFishInfo === 'function') showFishInfo(caughtFish);
    if (typeof updateBackpack === 'function') updateBackpack();
    
    gameState.currentFish = null;
    gameState.lineDepth = 0;
    
    // Redraw
    if (typeof draw === 'function') draw();
}

// Export functions to global scope
if (typeof window !== 'undefined') {
    window.castLine = castLine;
    window.catchFish = catchFish;
}

