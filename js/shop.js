// Shop management module
// Uses global gameState

// Helper function to get equipped item by ID
function getEquippedItem(category, itemId) {
    if (!itemId) return null;
    const items = SHOP_ITEMS[category] || [];
    return items.find(item => item.id === itemId) || null;
}

// Default item IDs (these are free and always owned)
const DEFAULT_ITEMS = {
    clothes: {
        shirt: 'shirt_default',
        pants: 'pants_default',
        hat: 'hat_default',
        accessory: 'accessory_default'
    },
    rod: 'rod_default',
    line: 'line_default',
    bobber: 'bobber_default'
};

// Shop items catalog
const SHOP_ITEMS = {
    clothes: [
        // Default items (always owned, free)
        { id: 'shirt_default', name: 'Default Shirt', description: 'Your starting shirt', price: 0, type: 'shirt', color: '#4a5568', isDefault: true },
        { id: 'pants_default', name: 'Default Pants', description: 'Your starting pants', price: 0, type: 'pants', color: '#2c3e50', isDefault: true },
        { id: 'hat_default', name: 'Default Cap', description: 'Your starting cap', price: 0, type: 'hat', style: 'cap', color: '#d4af37', isDefault: true },
        { id: 'accessory_default', name: 'Default Scarf', description: 'Your starting scarf', price: 0, type: 'accessory', accessoryType: 'scarf', color: '#dc2626', isDefault: true },
        // Purchasable items
        { id: 'shirt_red', name: 'Red Shirt', description: 'A vibrant red shirt', price: 50, type: 'shirt', color: '#e74c3c' },
        { id: 'shirt_blue', name: 'Blue Shirt', description: 'A cool blue shirt', price: 50, type: 'shirt', color: '#3498db' },
        { id: 'shirt_green', name: 'Green Shirt', description: 'A fresh green shirt', price: 50, type: 'shirt', color: '#2ecc71' },
        { id: 'shirt_yellow', name: 'Yellow Shirt', description: 'A bright yellow shirt', price: 50, type: 'shirt', color: '#f1c40f' },
        { id: 'pants_black', name: 'Black Pants', description: 'Stylish black pants', price: 75, type: 'pants', color: '#1a1a1a' },
        { id: 'pants_brown', name: 'Brown Pants', description: 'Classic brown pants', price: 75, type: 'pants', color: '#8b4513' },
        { id: 'hat_beanie', name: 'Beanie', description: 'A cozy beanie', price: 100, type: 'hat', style: 'beanie', color: '#34495e' },
        { id: 'hat_crown', name: 'Crown', description: 'A regal crown', price: 500, type: 'hat', style: 'crown', color: '#d4af37' },
        { id: 'scarf_red', name: 'Red Scarf', description: 'A warm red scarf', price: 60, type: 'accessory', accessoryType: 'scarf', color: '#e74c3c' },
        { id: 'cape_blue', name: 'Blue Cape', description: 'A majestic blue cape', price: 200, type: 'accessory', accessoryType: 'cape', color: '#3498db' }
    ],
    rods: [
        // Default rod (always owned, free)
        { id: 'rod_default', name: 'Default Rod', description: 'Your starting fishing rod', price: 0, stats: { durability: 1 }, color: '#d4af37', isDefault: true },
        // Purchasable rods
        { id: 'rod_basic', name: 'Basic Rod', description: 'A simple fishing rod', price: 100, stats: { durability: 1 }, color: '#8b4513' },
        { id: 'rod_wooden', name: 'Wooden Rod', description: 'A sturdy wooden rod', price: 250, stats: { durability: 2 }, color: '#654321' },
        { id: 'rod_iron', name: 'Iron Rod', description: 'A durable iron rod', price: 500, stats: { durability: 3 }, color: '#708090' },
        { id: 'rod_golden', name: 'Golden Rod', description: 'A luxurious golden rod', price: 1000, stats: { durability: 5 }, color: '#ffd700' },
        { id: 'rod_legendary', name: 'Legendary Rod', description: 'The ultimate fishing rod', price: 5000, stats: { durability: 10 }, color: '#9370db' }
    ],
    lines: [
        // Default line (always owned, free)
        { id: 'line_default', name: 'Default Line', description: 'Your starting fishing line', price: 0, stats: { strength: 1 }, color: '#ffffff', isDefault: true },
        // Purchasable lines
        { id: 'line_basic', name: 'Basic Line', description: 'A simple fishing line', price: 50, stats: { strength: 1 }, color: '#ffffff' },
        { id: 'line_strong', name: 'Strong Line', description: 'A reinforced fishing line', price: 150, stats: { strength: 2 }, color: '#d3d3d3' },
        { id: 'line_steel', name: 'Steel Line', description: 'An unbreakable steel line', price: 400, stats: { strength: 3 }, color: '#c0c0c0' },
        { id: 'line_titanium', name: 'Titanium Line', description: 'A premium titanium line', price: 800, stats: { strength: 5 }, color: '#e6e6fa' },
        { id: 'line_mystic', name: 'Mystic Line', description: 'A magical fishing line', price: 2000, stats: { strength: 10 }, color: '#ff69b4' }
    ],
    bobbers: [
        // Default bobber (always owned, free)
        { id: 'bobber_default', name: 'Default Bobber', description: 'Your starting bobber', price: 0, stats: { visibility: 1 }, color: '#8b4513', outlineColor: '#654321', isDefault: true },
        // Purchasable bobbers
        { id: 'bobber_basic', name: 'Basic Bobber', description: 'A simple bobber', price: 25, stats: { visibility: 1 }, color: '#8b4513', outlineColor: '#654321' },
        { id: 'bobber_red', name: 'Red Bobber', description: 'A bright red bobber', price: 75, stats: { visibility: 2 }, color: '#e74c3c', outlineColor: '#c0392b' },
        { id: 'bobber_glow', name: 'Glowing Bobber', description: 'A glowing bobber', price: 200, stats: { visibility: 3 }, color: '#ffff00', outlineColor: '#ffd700', glow: true },
        { id: 'bobber_rainbow', name: 'Rainbow Bobber', description: 'A colorful rainbow bobber', price: 500, stats: { visibility: 5 }, color: '#ff69b4', outlineColor: '#9370db', rainbow: true },
        { id: 'bobber_legendary', name: 'Legendary Bobber', description: 'The ultimate bobber', price: 1500, stats: { visibility: 10 }, color: '#9370db', outlineColor: '#4b0082', glow: true }
    ]
};

function updateShopGold() {
    const shopGoldEl = document.getElementById('shop-gold');
    if (shopGoldEl) {
        shopGoldEl.textContent = gameState.gold;
    }
}

function updateShopCategoryButtons() {
    const categoryButtons = {
        'clothes': document.getElementById('shop-category-clothes'),
        'rods': document.getElementById('shop-category-rods'),
        'lines': document.getElementById('shop-category-lines'),
        'bobbers': document.getElementById('shop-category-bobbers')
    };
    
    // Reset all buttons
    Object.values(categoryButtons).forEach(btn => {
        if (btn) {
            btn.classList.remove('is-primary');
            btn.classList.add('is-dark');
        }
    });
    
    // Highlight active category
    const activeBtn = categoryButtons[gameState.shopCategory];
    if (activeBtn) {
        activeBtn.classList.remove('is-dark');
        activeBtn.classList.add('is-primary');
    }
}

function updateShopItems() {
    const shopItemsEl = document.getElementById('shop-items');
    if (!shopItemsEl) return;
    
    shopItemsEl.innerHTML = '';
    
    const items = SHOP_ITEMS[gameState.shopCategory] || [];
    
    if (items.length === 0) {
        shopItemsEl.innerHTML = '<div style="text-align: center; color: #95a5a6; padding: 20px;">No items available in this category!</div>';
        return;
    }
    
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';
        
        // Check if item is owned (default items are always owned)
        let isOwned = false;
        let isEquipped = false;
        
        if (item.isDefault) {
            isOwned = true; // Default items are always owned
        }
        
        if (gameState.shopCategory === 'clothes') {
            if (!isOwned) {
                isOwned = gameState.equipment.ownedClothes.includes(item.id);
            }
            // Check if equipped based on item type
            if (item.type === 'shirt') {
                isEquipped = gameState.character.shirtColor === item.color;
            } else if (item.type === 'pants') {
                isEquipped = gameState.character.pantsColor === item.color;
            } else if (item.type === 'hat') {
                isEquipped = gameState.character.hatStyle === item.style && gameState.character.hatColor === item.color;
            } else if (item.type === 'accessory') {
                isEquipped = gameState.character.accessoryType === item.accessoryType && gameState.character.accessoryColor === item.color;
            }
        } else if (gameState.shopCategory === 'rods') {
            if (!isOwned) {
                isOwned = gameState.equipment.ownedRods.includes(item.id);
            }
            isEquipped = gameState.equipment.rod === item.id || (item.isDefault && !gameState.equipment.rod);
        } else if (gameState.shopCategory === 'lines') {
            if (!isOwned) {
                isOwned = gameState.equipment.ownedLines.includes(item.id);
            }
            isEquipped = gameState.equipment.line === item.id || (item.isDefault && !gameState.equipment.line);
        } else if (gameState.shopCategory === 'bobbers') {
            if (!isOwned) {
                isOwned = gameState.equipment.ownedBobbers.includes(item.id);
            }
            isEquipped = gameState.equipment.bobber === item.id || (item.isDefault && !gameState.equipment.bobber);
        }
        
        if (isOwned) {
            itemDiv.classList.add('owned');
        }
        if (isEquipped) {
            itemDiv.classList.add('equipped');
        }
        
        const buyButton = document.createElement('button');
        buyButton.className = 'shop-item-button nes-btn';
        
        if (isEquipped) {
            buyButton.textContent = 'Equipped';
            buyButton.classList.add('is-success');
            buyButton.disabled = true;
        } else if (isOwned || item.isDefault) {
            buyButton.textContent = 'Equip';
            buyButton.classList.add('is-warning');
            buyButton.addEventListener('click', () => {
                equipItem(item);
            });
        } else {
            buyButton.textContent = `Buy (${item.price}G)`;
            buyButton.classList.add('is-primary');
            if (gameState.gold < item.price) {
                buyButton.disabled = true;
                buyButton.classList.add('is-disabled');
            } else {
                buyButton.addEventListener('click', () => {
                    purchaseItem(item);
                });
            }
        }
        
        const priceText = item.isDefault ? 'Free' : `${item.price}G`;
        itemDiv.innerHTML = `
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-description">${item.description}</div>
            <div class="shop-item-price">${priceText}</div>
        `;
        itemDiv.appendChild(buyButton);
        
        shopItemsEl.appendChild(itemDiv);
    });
}

function purchaseItem(item) {
    // Default items cannot be purchased (they're free and always owned)
    if (item.isDefault) {
        equipItem(item);
        return;
    }
    
    if (gameState.gold < item.price) {
        alert(`Not enough gold! Need ${item.price}G but only have ${gameState.gold}G.`);
        return;
    }
    
    // Deduct gold
    gameState.gold -= item.price;
    
    // Add to owned items
    if (gameState.shopCategory === 'clothes') {
        if (!gameState.equipment.ownedClothes.includes(item.id)) {
            gameState.equipment.ownedClothes.push(item.id);
        }
        // Auto-equip clothes when purchased
        equipItem(item);
    } else if (gameState.shopCategory === 'rods') {
        if (!gameState.equipment.ownedRods.includes(item.id)) {
            gameState.equipment.ownedRods.push(item.id);
        }
        // Auto-equip rod when purchased
        equipItem(item);
    } else if (gameState.shopCategory === 'lines') {
        if (!gameState.equipment.ownedLines.includes(item.id)) {
            gameState.equipment.ownedLines.push(item.id);
        }
        // Auto-equip line when purchased
        equipItem(item);
    } else if (gameState.shopCategory === 'bobbers') {
        if (!gameState.equipment.ownedBobbers.includes(item.id)) {
            gameState.equipment.ownedBobbers.push(item.id);
        }
        // Auto-equip bobber when purchased
        equipItem(item);
    }
    
    // Save user data
    if (typeof saveUserData === 'function') {
        saveUserData();
    }
    
    // Update UI
    if (typeof updateUI === 'function') updateUI();
    updateShopGold();
    updateShopItems();
}

function equipItem(item) {
    if (gameState.shopCategory === 'clothes') {
        if (item.type === 'shirt') {
            gameState.character.shirtColor = item.color;
        } else if (item.type === 'pants') {
            gameState.character.pantsColor = item.color;
        } else if (item.type === 'hat') {
            gameState.character.hatStyle = item.style;
            gameState.character.hatColor = item.color;
        } else if (item.type === 'accessory') {
            gameState.character.accessoryType = item.accessoryType;
            gameState.character.accessoryColor = item.color;
        }
    } else if (gameState.shopCategory === 'rods') {
        gameState.equipment.rod = item.id;
    } else if (gameState.shopCategory === 'lines') {
        gameState.equipment.line = item.id;
    } else if (gameState.shopCategory === 'bobbers') {
        gameState.equipment.bobber = item.id;
    }
    
    // Save user data
    if (typeof saveUserData === 'function') {
        saveUserData();
    }
    
    // Update UI
    updateShopItems();
    
    // Trigger redraw to show updated character appearance
    if (typeof draw === 'function') {
        draw();
    }
}

function initializeDefaultEquipment() {
    // Initialize default equipment if not already set
    // This ensures new players start with default items owned and equipped
    
    // Initialize default clothes as owned
    const defaultClothes = [
        DEFAULT_ITEMS.clothes.shirt,
        DEFAULT_ITEMS.clothes.pants,
        DEFAULT_ITEMS.clothes.hat,
        DEFAULT_ITEMS.clothes.accessory
    ];
    
    defaultClothes.forEach(itemId => {
        if (!gameState.equipment.ownedClothes.includes(itemId)) {
            gameState.equipment.ownedClothes.push(itemId);
        }
    });
    
    // Initialize default rod, line, bobber as owned
    if (!gameState.equipment.ownedRods.includes(DEFAULT_ITEMS.rod)) {
        gameState.equipment.ownedRods.push(DEFAULT_ITEMS.rod);
    }
    if (!gameState.equipment.ownedLines.includes(DEFAULT_ITEMS.line)) {
        gameState.equipment.ownedLines.push(DEFAULT_ITEMS.line);
    }
    if (!gameState.equipment.ownedBobbers.includes(DEFAULT_ITEMS.bobber)) {
        gameState.equipment.ownedBobbers.push(DEFAULT_ITEMS.bobber);
    }
    
    // Equip default items if nothing is equipped
    if (!gameState.equipment.rod) {
        gameState.equipment.rod = DEFAULT_ITEMS.rod;
    }
    if (!gameState.equipment.line) {
        gameState.equipment.line = DEFAULT_ITEMS.line;
    }
    if (!gameState.equipment.bobber) {
        gameState.equipment.bobber = DEFAULT_ITEMS.bobber;
    }
    
    // Character defaults are already set in gameState, so we don't need to change them
    // But we ensure the default clothes match what's in gameState.character
    
    // Save equipment state after initialization
    if (typeof saveUserData === 'function') {
        saveUserData();
    }
}

function showShop() {
    const shopOverlay = document.getElementById('shop-overlay');
    if (shopOverlay) {
        updateShopGold();
        updateShopCategoryButtons();
        updateShopItems();
        shopOverlay.classList.remove('hidden');
    }
}

// Export functions to global scope
if (typeof window !== 'undefined') {
    window.updateShopGold = updateShopGold;
    window.updateShopCategoryButtons = updateShopCategoryButtons;
    window.updateShopItems = updateShopItems;
    window.purchaseItem = purchaseItem;
    window.equipItem = equipItem;
    window.showShop = showShop;
    window.initializeDefaultEquipment = initializeDefaultEquipment;
    window.getEquippedItem = getEquippedItem;
    window.SHOP_ITEMS = SHOP_ITEMS; // Export for use in drawing module
}

