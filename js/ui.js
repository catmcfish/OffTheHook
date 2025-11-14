// UI management module
// Uses global gameState

function updateUI() {
    const goldEl = document.getElementById('gold');
    const fishCountEl = document.getElementById('fish-count');
    if (goldEl) goldEl.textContent = gameState.gold;
    if (fishCountEl) fishCountEl.textContent = gameState.fishCount;
    // Also update shop gold if shop is open
    if (typeof updateShopGold === 'function') {
        updateShopGold();
    }
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
    
    if (!fishInfo || !fishDetails) return;
    
    // Render fish sprite with special effects (requires renderFishSprite from drawing module)
    let fishSprite = '';
    try {
        if (typeof renderFishSprite === 'function') {
            fishSprite = renderFishSprite(fish);
        }
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

function updateBackpack() {
    const backpackList = document.getElementById('backpack-list');
    if (!backpackList) return;
    
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
        
        // Render fish sprite (requires renderFishSprite from drawing module)
        let mostValuableSprite = '';
        try {
            if (typeof renderFishSprite === 'function') {
                mostValuableSprite = renderFishSprite(mostValuableFish);
            }
        } catch (error) {
            console.error('Error rendering sprite:', error);
        }
        
        mostValuableDiv.innerHTML = `
            <div style="color: #f39c12; font-size: 1.2em; margin-bottom: 10px; text-align: center;">🏆 Most Valuable Fish</div>
            <div class="backpack-item most-valuable-item" style="max-width: 300px; width: 100%; border: 3px solid #f39c12; padding: 15px; display: flex; flex-direction: column; align-items: center;">
                ${mostValuableSprite ? `<img src="${mostValuableSprite}" alt="${mostValuableFish.type}" style="image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges; width: 64px; height: 64px; margin-bottom: 10px;" />` : ''}
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
    allFish.forEach((fish) => {
        let fishSprite = '';
        try {
            if (typeof renderFishSprite === 'function') {
                fishSprite = renderFishSprite(fish);
            }
        } catch (error) {
            console.error('Error rendering sprite:', error);
        }
        
        const fishDiv = document.createElement('div');
        fishDiv.className = 'backpack-item';
        fishDiv.style.display = 'flex';
        fishDiv.style.flexDirection = 'column';
        fishDiv.style.alignItems = 'center';
        fishDiv.style.padding = '10px';
        fishDiv.style.width = '100%';
        
        // Store fish data as JSON in data attribute for reliable matching
        fishDiv.setAttribute('data-fish-data', JSON.stringify({
            type: fish.type,
            size: fish.size,
            rarity: fish.rarity,
            value: fish.value,
            rarityColor: fish.rarityColor
        }));
        
        const sellButton = document.createElement('button');
        sellButton.className = 'sell-button nes-btn is-error';
        sellButton.textContent = 'Sell';
        sellButton.style.marginTop = '8px';
        sellButton.addEventListener('click', () => {
            const fishData = JSON.parse(fishDiv.getAttribute('data-fish-data'));
            sellFish(fishData);
        });
        
        fishDiv.innerHTML = `
            ${fishSprite ? `<img src="${fishSprite}" alt="${fish.type}" style="image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges; width: 48px; height: 48px; margin-bottom: 8px;" />` : ''}
            <div class="backpack-item-name" style="color: ${fish.rarityColor}; text-align: center; font-size: 0.9em;">${fish.type}</div>
            <div class="backpack-item-details" style="text-align: center; font-size: 0.8em; margin: 3px 0;">${fish.size} ${fish.rarity}</div>
            <div class="backpack-item-value" style="text-align: center; color: #f39c12; font-size: 0.9em;">${fish.value}G</div>
        `;
        fishDiv.appendChild(sellButton);
        allFishContainer.appendChild(fishDiv);
    });
    
    container.appendChild(allFishContainer);
    backpackList.appendChild(container);
    
    // Update buyback slot display
    updateBuybackSlot();
}

function updateBuybackSlot() {
    const buybackSlot = document.getElementById('buyback-slot');
    if (!buybackSlot) return;
    
    buybackSlot.innerHTML = '';
    
    if (gameState.buyback) {
        let fishSprite = '';
        try {
            if (typeof renderFishSprite === 'function') {
                fishSprite = renderFishSprite(gameState.buyback);
            }
        } catch (error) {
            console.error('Error rendering sprite:', error);
        }
        
        const buybackDiv = document.createElement('div');
        buybackDiv.className = 'buyback-item';
        
        const buybackButton = document.createElement('button');
        buybackButton.className = 'nes-btn is-success';
        buybackButton.textContent = 'Buyback';
        buybackButton.style.marginTop = '10px';
        buybackButton.style.fontSize = '0.85em';
        buybackButton.addEventListener('click', () => {
            buybackFish();
        });
        
        buybackDiv.innerHTML = `
            ${fishSprite ? `<img src="${fishSprite}" alt="${gameState.buyback.type}" style="image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges; width: 64px; height: 64px; margin-bottom: 8px;" />` : ''}
            <div class="buyback-item-name" style="color: ${gameState.buyback.rarityColor}; text-align: center; font-size: 0.9em;">${gameState.buyback.type}</div>
            <div style="text-align: center; font-size: 0.8em; margin: 3px 0; color: #95a5a6;">${gameState.buyback.size} ${gameState.buyback.rarity}</div>
            <div class="buyback-item-value" style="text-align: center; color: #f39c12; font-size: 0.9em;">${gameState.buyback.value}G</div>
        `;
        buybackDiv.appendChild(buybackButton);
        buybackSlot.appendChild(buybackDiv);
    } else {
        buybackSlot.innerHTML = '<div style="text-align: center; color: #95a5a6; font-size: 0.9em;">No fish in buyback</div>';
    }
}

function sellFish(fishData) {
    // Find the fish in inventory by matching all properties
    const fishIndex = gameState.inventory.findIndex(f => 
        f.type === fishData.type &&
        f.size === fishData.size &&
        f.rarity === fishData.rarity &&
        f.value === fishData.value
    );
    
    if (fishIndex === -1) {
        console.error('Fish not found in inventory:', fishData);
        return;
    }
    
    const fish = gameState.inventory[fishIndex];
    
    // Remove fish from inventory
    gameState.inventory.splice(fishIndex, 1);
    
    // Add gold
    gameState.gold += fish.value;
    
    // Store fish in buyback (replace previous buyback)
    gameState.buyback = { ...fish };
    
    // Save user data
    if (typeof saveUserData === 'function') {
        saveUserData();
    }
    
    // Update UI
    if (typeof updateUI === 'function') updateUI();
    if (typeof updateBackpack === 'function') updateBackpack();
}

function buybackFish() {
    if (!gameState.buyback) {
        console.error('No fish in buyback');
        return;
    }
    
    const fish = gameState.buyback;
    
    // Check if player has enough gold
    if (gameState.gold < fish.value) {
        alert(`Not enough gold! Need ${fish.value}G but only have ${gameState.gold}G.`);
        return;
    }
    
    // Remove gold
    gameState.gold -= fish.value;
    
    // Restore fish to inventory
    gameState.inventory.push({ ...fish });
    
    // Clear buyback
    gameState.buyback = null;
    
    // Save user data
    if (typeof saveUserData === 'function') {
        saveUserData();
    }
    
    // Update UI
    if (typeof updateUI === 'function') updateUI();
    if (typeof updateBackpack === 'function') updateBackpack();
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
    if (gameState.currentUser && typeof saveUserData === 'function') {
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
            // Requires getTimeOfDayInfo and getCurrentEvent from events module
            let timeInfoData = {};
            let event = null;
            
            if (typeof getTimeOfDayInfo === 'function') {
                timeInfoData = getTimeOfDayInfo();
            }
            if (typeof getCurrentEvent === 'function') {
                event = getCurrentEvent();
            }
            
            timeInfo.innerHTML = `
                <strong>Current Time:</strong> ${timeInfoData.timeString || 'N/A'}<br>
                <strong>Date:</strong> ${timeInfoData.dateString || 'N/A'}<br>
                <strong>Phase:</strong> <span style="text-transform: capitalize; color: #3498db;">${timeInfoData.phase || 'N/A'}</span> (Hour: ${timeInfoData.hour || 'N/A'})
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

// Export functions to global scope
if (typeof window !== 'undefined') {
    window.updateUI = updateUI;
    window.showFishInfo = showFishInfo;
    window.updateBackpack = updateBackpack;
    window.updateBuybackSlot = updateBuybackSlot;
    window.sellFish = sellFish;
    window.buybackFish = buybackFish;
    window.loadSettings = loadSettings;
    window.saveSettings = saveSettings;
    window.updateSettingsUI = updateSettingsUI;
    window.updateAdminPanel = updateAdminPanel;
    window.updateBackpackSortButtons = updateBackpackSortButtons;
}

