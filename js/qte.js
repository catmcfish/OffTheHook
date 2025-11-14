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
            // Mobile: Generate tap location - expanded to cover more of the screen
            // Including edges, corners, and more varied positions
            const locations = [
                // Corners
                { x: 10, y: 10 },
                { x: 90, y: 10 },
                { x: 10, y: 90 },
                { x: 90, y: 90 },
                // Edges (top/bottom)
                { x: 20, y: 15 },
                { x: 50, y: 10 },
                { x: 80, y: 15 },
                { x: 20, y: 85 },
                { x: 50, y: 90 },
                { x: 80, y: 85 },
                // Edges (left/right)
                { x: 10, y: 30 },
                { x: 10, y: 50 },
                { x: 10, y: 70 },
                { x: 90, y: 30 },
                { x: 90, y: 50 },
                { x: 90, y: 70 },
                // Middle area (varied)
                { x: 20, y: 30 },
                { x: 80, y: 30 },
                { x: 20, y: 70 },
                { x: 80, y: 70 },
                { x: 30, y: 20 },
                { x: 70, y: 20 },
                { x: 30, y: 80 },
                { x: 70, y: 80 },
                // Center area
                { x: 50, y: 20 },
                { x: 50, y: 80 },
                { x: 25, y: 50 },
                { x: 75, y: 50 },
                // More varied positions
                { x: 15, y: 40 },
                { x: 85, y: 40 },
                { x: 15, y: 60 },
                { x: 85, y: 60 },
                { x: 40, y: 15 },
                { x: 60, y: 15 },
                { x: 40, y: 85 },
                { x: 60, y: 85 }
            ];
            const location = locations[Math.floor(Math.random() * locations.length)];
            gameState.qteCurrentTapLocation = location;
            
            // Mobile QTE button - empty green button
            qteButton.textContent = '';
            qteButton.className = 'qte-button nes-btn is-success'; // Ensure NES.css classes are maintained
            // Position relative to overlay (full screen)
            qteButton.style.position = 'fixed';
            qteButton.style.left = location.x + 'vw';
            qteButton.style.top = location.y + 'vh';
            qteButton.style.transform = 'translate(-50%, -50%)';
            qteButton.style.zIndex = '16'; // Above overlay (z-index 15)
            qteInstruction.textContent = `Tap here! (${gameState.qteSuccesses + 1}/${gameState.qteRequired})`;
        } else {
            // Desktop: Generate key press
            const key = qteKeys[Math.floor(Math.random() * qteKeys.length)];
            gameState.qteCurrentKey = key;
            
            qteButton.textContent = key;
            qteButton.className = 'qte-button nes-btn is-success'; // Ensure NES.css classes are maintained
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
            // Preserve positioning transform while adding scale animation
            qteButton.style.transform = 'translate(-50%, -50%) scale(0.9)';
            setTimeout(() => {
                if (gameState.qteActive) {
                    qteButton.style.transform = 'translate(-50%, -50%) scale(1)';
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
    const qteOverlay = document.getElementById('qte-overlay');
    const qteButton = document.getElementById('qte-button');
    qteOverlay.classList.add('hidden');
    
    // Reset button styles
    qteButton.style.position = '';
    qteButton.style.left = '';
    qteButton.style.top = '';
    qteButton.style.transform = '';
    qteButton.style.zIndex = '';
    
    // Clean up event listeners
    if (gameState.qteKeyHandler) {
        document.removeEventListener('keydown', gameState.qteKeyHandler);
        gameState.qteKeyHandler = null;
    }
    if (gameState.qteTapHandler) {
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
    const qteOverlay = document.getElementById('qte-overlay');
    const qteButton = document.getElementById('qte-button');
    qteOverlay.classList.add('hidden');
    
    // Reset button styles
    qteButton.style.position = '';
    qteButton.style.left = '';
    qteButton.style.top = '';
    qteButton.style.transform = '';
    qteButton.style.zIndex = '';
    
    // Clean up event listeners
    if (gameState.qteKeyHandler) {
        document.removeEventListener('keydown', gameState.qteKeyHandler);
        gameState.qteKeyHandler = null;
    }
    if (gameState.qteTapHandler) {
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

