// Fish types and generation system

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
    // Get current event if function is available
    const currentEvent = (typeof getCurrentEvent === 'function') ? getCurrentEvent() : null;
    
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fishTypes, allFishTypes, RARITY_CONFIG, rarities, sizes, generateFish };
}

// Export to global scope for browser
if (typeof window !== 'undefined') {
    window.generateFish = generateFish;
}

