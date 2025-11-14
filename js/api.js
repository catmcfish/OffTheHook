// API calls module
// Uses global gameState and API_BASE_URL

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
                character: gameState.character,
                buyback: gameState.buyback,
                equipment: gameState.equipment
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
            gameState.buyback = result.data.buyback || null;
            
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
            
            // Load equipment from database
            if (result.data.equipment) {
                gameState.equipment = {
                    rod: null,
                    line: null,
                    bobber: null,
                    ownedRods: [],
                    ownedLines: [],
                    ownedBobbers: [],
                    ownedClothes: [],
                    ...result.data.equipment  // database equipment overrides defaults
                };
            }
            
            // Initialize default equipment for new players or if equipment is empty
            if (typeof initializeDefaultEquipment === 'function') {
                initializeDefaultEquipment();
            }
            
            // Update localStorage to match database
            localStorage.setItem('fishingGameSettings', JSON.stringify(gameState.settings));
            
            // Update UI (will be called from UI module)
            if (typeof updateUI === 'function') updateUI();
            if (typeof updateBackpack === 'function') updateBackpack();
            if (typeof updateSettingsUI === 'function') updateSettingsUI();
            
            // Start admin panel updates if admin
            if (gameState.isAdmin && !gameState.adminPanelInterval) {
                gameState.adminPanelInterval = setInterval(() => {
                    if (typeof updateAdminPanel === 'function') updateAdminPanel();
                }, 1000);
            }
        } else {
            // Load from localStorage if API fails
            if (typeof loadSettings === 'function') loadSettings();
            gameState.isAdmin = false; // Not admin if no database data
            // Initialize default equipment
            if (typeof initializeDefaultEquipment === 'function') {
                initializeDefaultEquipment();
            }
            if (typeof updateSettingsUI === 'function') updateSettingsUI();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        // Load from localStorage as fallback
        if (typeof loadSettings === 'function') loadSettings();
        gameState.isAdmin = false; // Not admin if error loading
        // Initialize default equipment
        if (typeof initializeDefaultEquipment === 'function') {
            initializeDefaultEquipment();
        }
        if (typeof updateSettingsUI === 'function') updateSettingsUI();
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
    gameState.buyback = null;
    if (typeof updateUI === 'function') updateUI();
    if (typeof updateBackpack === 'function') updateBackpack();
    localStorage.removeItem('fishingGameCurrentUser');
}

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

// Export functions to global scope for use in other modules
if (typeof window !== 'undefined') {
    window.saveUserData = saveUserData;
    window.loadUserData = loadUserData;
    window.register = register;
    window.login = login;
    window.logout = logout;
    window.checkLeaderboardUpdate = checkLeaderboardUpdate;
    window.displayLeaderboard = displayLeaderboard;
}

