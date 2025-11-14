// Quick Time Event (QTE) system
// Uses global gameState

// Keys for desktop QTE
const qteKeys = ['A', 'S', 'D', 'W', 'E', 'Q', 'R', 'F'];

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
    
    // Reset line - need to call draw function
    const resetInterval = setInterval(() => {
        gameState.lineDepth -= 3;
        if (gameState.lineDepth <= 0) {
            clearInterval(resetInterval);
            gameState.lineDepth = 0;
        }
        // Note: draw() will be called from rendering module
        if (typeof draw === 'function') draw();
    }, 16);
}

// Export functions to global scope
if (typeof window !== 'undefined') {
    window.startQTE = startQTE;
    window.successQTE = successQTE;
    window.failQTE = failQTE;
}

