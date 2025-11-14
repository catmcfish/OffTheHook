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

// Initialize game when DOM is ready
function initGame() {
    // Initialize canvas and ctx (attach to global scope for modules)
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
    
    // Make canvas and ctx globally accessible for modules
    if (typeof window !== 'undefined') {
        window.canvas = canvas;
        window.ctx = ctx;
    }
    
    // Resize canvas to fill screen (from rendering.js)
    if (typeof resizeCanvas === 'function') {
        resizeCanvas();
        // Remove any existing resize listener and add a new one
        window.removeEventListener('resize', resizeCanvas);
        window.addEventListener('resize', resizeCanvas);
    }
    
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
                if (typeof castLine === 'function') {
                    castLine();
                }
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
            
            // Don't allow casting while backpack is open
            const backpackOverlay = document.getElementById('backpack-overlay');
            if (backpackOverlay && !backpackOverlay.classList.contains('hidden')) {
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
                if (typeof castLine === 'function') {
                    castLine();
                }
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
    if (castButtonTop && typeof castLine === 'function') {
        castButtonTop.addEventListener('click', () => {
            // Don't allow casting while backpack or shop is open
            const backpackOverlay = document.getElementById('backpack-overlay');
            const shopOverlay = document.getElementById('shop-overlay');
            if ((backpackOverlay && !backpackOverlay.classList.contains('hidden')) ||
                (shopOverlay && !shopOverlay.classList.contains('hidden'))) {
                return;
            }
            castLine();
        });
        castButtonTop.addEventListener('touchstart', (e) => {
            e.preventDefault();
            // Don't allow casting while backpack or shop is open
            const backpackOverlay = document.getElementById('backpack-overlay');
            const shopOverlay = document.getElementById('shop-overlay');
            if ((backpackOverlay && !backpackOverlay.classList.contains('hidden')) ||
                (shopOverlay && !shopOverlay.classList.contains('hidden'))) {
                return;
            }
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
                if (typeof updateBackpackSortButtons === 'function') {
                    updateBackpackSortButtons();
                }
                if (typeof updateBackpack === 'function') {
                    updateBackpack();
                }
                // updateBuybackSlot is called by updateBackpack, but ensure it's updated
                if (typeof updateBuybackSlot === 'function') {
                    updateBuybackSlot();
                }
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
    const sortRecentBtn = document.getElementById('backpack-sort-recent');
    const sortValueBtn = document.getElementById('backpack-sort-value');
    const sortRarityBtn = document.getElementById('backpack-sort-rarity');
    
    if (sortRecentBtn && typeof updateBackpackSortButtons === 'function' && typeof updateBackpack === 'function') {
        sortRecentBtn.addEventListener('click', () => {
            gameState.backpackSort = 'recent';
            updateBackpackSortButtons();
            updateBackpack();
        });
    }
    
    if (sortValueBtn && typeof updateBackpackSortButtons === 'function' && typeof updateBackpack === 'function') {
        sortValueBtn.addEventListener('click', () => {
            gameState.backpackSort = 'value';
            updateBackpackSortButtons();
            updateBackpack();
        });
    }
    
    if (sortRarityBtn && typeof updateBackpackSortButtons === 'function' && typeof updateBackpack === 'function') {
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
        if (typeof loadUserData === 'function') {
            loadUserData(savedUser).then(() => {
                if (authOverlay) {
                    authOverlay.classList.add('hidden');
                }
            });
        }
    } else {
        if (authOverlay) {
            authOverlay.classList.remove('hidden');
        }
    }
    
    showRegister?.addEventListener('click', (e) => {
        e.preventDefault();
        if (loginForm) loginForm.classList.add('hidden');
        if (registerForm) registerForm.classList.remove('hidden');
        if (authError) authError.classList.add('hidden');
    });
    
    showLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        if (registerForm) registerForm.classList.add('hidden');
        if (loginForm) loginForm.classList.remove('hidden');
        if (authError) authError.classList.add('hidden');
    });
    
    loginButton?.addEventListener('click', async () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        if (typeof login === 'function') {
            const result = await login(username, password);
            if (result.success) {
                localStorage.setItem('fishingGameCurrentUser', username);
                if (authOverlay) authOverlay.classList.add('hidden');
                if (authError) authError.classList.add('hidden');
            } else {
                if (authError) {
                    authError.textContent = result.error;
                    authError.classList.remove('hidden');
                }
            }
        }
    });
    
    registerButton?.addEventListener('click', async () => {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;
        
        if (typeof register === 'function') {
            const result = await register(username, password, passwordConfirm);
            if (result.success) {
                gameState.currentUser = username;
                localStorage.setItem('fishingGameCurrentUser', username);
                if (authOverlay) authOverlay.classList.add('hidden');
                if (authError) authError.classList.add('hidden');
            } else {
                if (authError) {
                    authError.textContent = result.error;
                    authError.classList.remove('hidden');
                }
            }
        }
    });
    
    // Leaderboard button
    const leaderboardButton = document.getElementById('leaderboard-button');
    const leaderboardOverlay = document.getElementById('leaderboard-overlay');
    const leaderboardClose = document.getElementById('leaderboard-close');
    
    leaderboardButton?.addEventListener('click', () => {
        if (typeof displayLeaderboard === 'function') {
            displayLeaderboard();
        }
        if (leaderboardOverlay) {
            leaderboardOverlay.classList.remove('hidden');
        }
    });
    
    leaderboardClose?.addEventListener('click', () => {
        if (leaderboardOverlay) {
            leaderboardOverlay.classList.add('hidden');
        }
    });
    
    // Shop button and overlay
    const shopButton = document.getElementById('shop-button');
    const shopOverlay = document.getElementById('shop-overlay');
    const shopClose = document.getElementById('shop-close');
    const shopCategoryClothes = document.getElementById('shop-category-clothes');
    const shopCategoryRods = document.getElementById('shop-category-rods');
    const shopCategoryLines = document.getElementById('shop-category-lines');
    const shopCategoryBobbers = document.getElementById('shop-category-bobbers');
    
    shopButton?.addEventListener('click', () => {
        if (typeof showShop === 'function') {
            showShop();
        }
    });
    
    shopClose?.addEventListener('click', () => {
        if (shopOverlay) {
            shopOverlay.classList.add('hidden');
        }
    });
    
    shopCategoryClothes?.addEventListener('click', () => {
        gameState.shopCategory = 'clothes';
        if (typeof updateShopCategoryButtons === 'function') updateShopCategoryButtons();
        if (typeof updateShopItems === 'function') updateShopItems();
    });
    
    shopCategoryRods?.addEventListener('click', () => {
        gameState.shopCategory = 'rods';
        if (typeof updateShopCategoryButtons === 'function') updateShopCategoryButtons();
        if (typeof updateShopItems === 'function') updateShopItems();
    });
    
    shopCategoryLines?.addEventListener('click', () => {
        gameState.shopCategory = 'lines';
        if (typeof updateShopCategoryButtons === 'function') updateShopCategoryButtons();
        if (typeof updateShopItems === 'function') updateShopItems();
    });
    
    shopCategoryBobbers?.addEventListener('click', () => {
        gameState.shopCategory = 'bobbers';
        if (typeof updateShopCategoryButtons === 'function') updateShopCategoryButtons();
        if (typeof updateShopItems === 'function') updateShopItems();
    });
    
    // Settings button and overlay
    const settingsButton = document.getElementById('settings-button');
    const settingsOverlay = document.getElementById('settings-overlay');
    const settingsClose = document.getElementById('settings-close');
    const rainToggle = document.getElementById('setting-rain');
    const grassToggle = document.getElementById('setting-grass');
    const logoutButton = document.getElementById('logout-button');
    
    settingsButton?.addEventListener('click', () => {
        if (typeof updateSettingsUI === 'function') {
            updateSettingsUI();
        }
        if (settingsOverlay) {
            settingsOverlay.classList.remove('hidden');
        }
    });
    
    settingsClose?.addEventListener('click', () => {
        if (settingsOverlay) {
            settingsOverlay.classList.add('hidden');
        }
    });
    
    rainToggle?.addEventListener('change', (e) => {
        gameState.settings.rainEnabled = e.target.checked;
        if (typeof saveSettings === 'function') {
            saveSettings();
        }
    });
    
    grassToggle?.addEventListener('change', (e) => {
        gameState.settings.grassEnabled = e.target.checked;
        if (typeof saveSettings === 'function') {
            saveSettings();
        }
    });
    
    logoutButton?.addEventListener('click', async () => {
        if (confirm('Are you sure you want to logout?')) {
            if (typeof logout === 'function') {
                await logout();
            }
            if (settingsOverlay) settingsOverlay.classList.add('hidden');
            if (authOverlay) authOverlay.classList.remove('hidden');
        }
    });
    
    // Admin refresh leaderboard button
    const refreshLeaderboardButton = document.getElementById('admin-refresh-leaderboard');
    const refreshStatusDiv = document.getElementById('admin-refresh-status');
    if (refreshLeaderboardButton) {
        refreshLeaderboardButton.addEventListener('click', async () => {
            if (!gameState.isAdmin) {
                if (refreshStatusDiv) {
                    refreshStatusDiv.textContent = 'Error: Admin access required';
                    refreshStatusDiv.style.color = '#e74c3c';
                }
                return;
            }
            
            refreshLeaderboardButton.disabled = true;
            if (refreshStatusDiv) {
                refreshStatusDiv.textContent = 'Refreshing leaderboard...';
                refreshStatusDiv.style.color = '#f39c12';
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/leaderboard/refresh`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const result = await response.json();
                
                if (refreshStatusDiv) {
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
                }
            } catch (error) {
                console.error('Error refreshing leaderboard:', error);
                if (refreshStatusDiv) {
                    refreshStatusDiv.textContent = 'Error: Failed to refresh leaderboard';
                    refreshStatusDiv.style.color = '#e74c3c';
                }
            } finally {
                refreshLeaderboardButton.disabled = false;
            }
        });
    }
    
    // Load settings on init
    if (typeof loadSettings === 'function') {
        loadSettings();
    }
    // Ensure admin panel is hidden initially
    gameState.isAdmin = false;
    if (typeof updateAdminPanel === 'function') {
        updateAdminPanel();
    }
    if (typeof updateSettingsUI === 'function') {
        updateSettingsUI();
    }
    
    // Allow Enter key to submit forms
    document.getElementById('login-password')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && loginButton) {
            loginButton.click();
        }
    });
    
    document.getElementById('register-password-confirm')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && registerButton) {
            registerButton.click();
        }
    });

    // Initial draw (from rendering.js)
    if (typeof draw === 'function') {
        draw();
    }

    // Animation loop - runs continuously for struggling fish animation
    function gameLoop() {
        if (typeof draw === 'function') {
            draw();
        }
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
