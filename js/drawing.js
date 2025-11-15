// Drawing module - All drawing functions for the game
// Uses global: gameState, canvas, ctx
// Depends on: utils.js (darkenColor, lightenColor), environment.js (for ripples)

// Pixel size constant
const PIXEL_SIZE = 4; // Size of each pixel for 8-bit look

// ============================================================================
// CHARACTER DRAWING FUNCTIONS
// ============================================================================


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

// Draw character body base (skin color) - drawn first as base layer
function drawCharacterBodyBase(x, y, facingRight, skinColor) {
    const direction = facingRight ? 1 : -1;
    const px = PIXEL_SIZE;
    
    ctx.fillStyle = skinColor;
    // Body base pixels (torso shape in skin color)
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

// Draw character shirt (8-bit pixelated) - drawn on top of body base
function drawCharacterShirt(x, y, facingRight, shirtColor) {
    const direction = facingRight ? 1 : -1;
    const px = PIXEL_SIZE;
    
    ctx.fillStyle = shirtColor;
    // Shirt pixels (torso shape in shirt color)
    const shirtPixels = [
        [0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0]
    ];
    
    for (let row = 0; row < shirtPixels.length; row++) {
        for (let col = 0; col < shirtPixels[row].length; col++) {
            if (shirtPixels[row][col] === 1) {
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

// Draw character back arm (8-bit pixelated) - drawn behind body
function drawCharacterBackArm(x, y, facingRight, skinColor) {
    const direction = facingRight ? 1 : -1;
    const px = PIXEL_SIZE;
    
    ctx.fillStyle = skinColor;
    // Back arm (behind body)
    ctx.fillRect(x - 2 * px * direction, y - 14, px, 2 * px);
}

// Draw character front arm (8-bit pixelated) - drawn in front of body
function drawCharacterFrontArm(x, y, facingRight, skinColor) {
    const direction = facingRight ? 1 : -1;
    const px = PIXEL_SIZE;
    
    ctx.fillStyle = skinColor;
    // Front arm (in front of body)
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
        // Cape pixels (larger, flowing) - positioned behind body so edges are visible
        const capePixels = [
            [1, 1, 0],
            [1, 1, 0],
            [1, 1, 0],
            [1, 1, 0],
            [1, 1, 0],
            [1, 0, 0]
        ];
        for (let row = 0; row < capePixels.length; row++) {
            for (let col = 0; col < capePixels[row].length; col++) {
                if (capePixels[row][col] === 1) {
                    // Position cape slightly behind body (offset by -1 pixel in direction)
                    // This makes the cape visible on the back side
                    ctx.fillRect(x + (col - 3) * px * direction, y - 18 + row * px, px, px);
                }
            }
        }
    }
}

// Main character drawing function - modular and customizable
function drawCharacter(x, y, facingRight = false) {
    const char = gameState.character;
    
    // Draw character parts in order (back to front)
    // 1. Back arm (drawn first so it's behind everything)
    drawCharacterBackArm(x, y, facingRight, char.skinColor);

    // Front arm (drawn after body so it's in front)
    drawCharacterFrontArm(x, y, facingRight, char.skinColor);
    
    // 2. Accessory cape (drawn before body so it's behind, but after back arm)
    // Only draw cape here; scarf will be drawn later
    if (char.accessoryType === 'cape') {
        drawCharacterAccessory(x, y, facingRight, char.accessoryColor, char.accessoryType);
    }
    
    // 3. Body base (skin color) - drawn as base layer
    drawCharacterBodyBase(x, y, facingRight, char.skinColor);
    
    // 4. Shirt - drawn on top of body base so shirt color shows
    drawCharacterShirt(x, y, facingRight, char.shirtColor);
    
    // 5. Pants
    drawCharacterPants(x, y, facingRight, char.pantsColor);
    
    // 7. Accessory scarf (drawn after body so it's visible in front)
    if (char.accessoryType === 'scarf') {
        drawCharacterAccessory(x, y, facingRight, char.accessoryColor, char.accessoryType);
    }
    
    // 9. Hair (drawn after head but before hat)
    drawCharacterHair(x, y, facingRight, char.hairColor, char.hairStyle);
    
    // 10. Hat (drawn last so it's on top)
    drawCharacterHat(x, y, facingRight, char.hatColor, char.hatStyle);
    
    // 11. Fishing rod (when fishing) - 8-bit pixelated rod, pointing forward
    if (gameState.isCasting || gameState.isReeling) {
        drawFishingRod(x, y, facingRight);
    }
}

// ============================================================================
// FISHING EQUIPMENT DRAWING FUNCTIONS
// ============================================================================

// Draw 8-bit pixelated fishing rod
function drawFishingRod(x, y, facingRight) {
    const direction = facingRight ? 1 : -1;
    const px = PIXEL_SIZE;
    
    // Get equipped rod color, default to golden if none equipped
    let rodColor = '#d4af37'; // Default golden color
    if (gameState.equipment && gameState.equipment.rod) {
        if (typeof getEquippedItem === 'function') {
            const equippedRod = getEquippedItem('rods', gameState.equipment.rod);
            if (equippedRod && equippedRod.color) {
                rodColor = equippedRod.color;
            }
        }
    }
    
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
    
    // Get equipped line color, default to white if none equipped
    let lineColor = '#ffffff'; // Default white color
    if (gameState.equipment && gameState.equipment.line) {
        if (typeof getEquippedItem === 'function') {
            const equippedLine = getEquippedItem('lines', gameState.equipment.line);
            if (equippedLine && equippedLine.color) {
                lineColor = equippedLine.color;
            }
        }
    }
    
    ctx.fillStyle = lineColor;
    
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
    // Convert line color to rgba with transparency
    const rgb = hexToRgb(lineColor);
    if (rgb) {
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
    } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    }
    const continuousSteps = Math.floor(distance / px);
    for (let i = 0; i <= continuousSteps; i++) {
        const t = i / continuousSteps;
        const lineX = Math.floor((startX + dx * t) / px) * px;
        const lineY = Math.floor((startY + dy * t) / px) * px;
        ctx.fillRect(lineX, lineY, px, px);
    }
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Draw 8-bit pixelated bobber
function drawBobber(x, y) {
    const px = PIXEL_SIZE;
    
    // Get equipped bobber colors, default to brown if none equipped
    let bobberColor = '#8b4513'; // Default brown
    let bobberOutline = '#654321'; // Default darker brown
    let hasGlow = false;
    let isRainbow = false;
    
    if (gameState.equipment && gameState.equipment.bobber) {
        if (typeof getEquippedItem === 'function') {
            const equippedBobber = getEquippedItem('bobbers', gameState.equipment.bobber);
            if (equippedBobber) {
                if (equippedBobber.color) bobberColor = equippedBobber.color;
                if (equippedBobber.outlineColor) bobberOutline = equippedBobber.outlineColor;
                if (equippedBobber.glow) hasGlow = true;
                if (equippedBobber.rainbow) isRainbow = true;
            }
        }
    }
    
    // Bobber pixels - circular shape approximated with pixels
    const bobberRadius = 6;
    
    // Draw glow effect if bobber has glow property
    if (hasGlow) {
        const time = Date.now() * 0.005;
        const glowRadius = bobberRadius + 4;
        const glowOpacity = 0.5 + Math.sin(time * 2) * 0.3;
        const rgb = hexToRgb(bobberColor);
        if (rgb) {
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${glowOpacity})`;
            const glowStartX = Math.floor((x - glowRadius) / px) * px;
            const glowEndX = Math.ceil((x + glowRadius) / px) * px;
            const glowStartY = Math.floor((y - glowRadius) / px) * px;
            const glowEndY = Math.ceil((y + glowRadius) / px) * px;
            
            for (let pxX = glowStartX; pxX <= glowEndX; pxX += px) {
                for (let pxY = glowStartY; pxY <= glowEndY; pxY += px) {
                    const dx = pxX - x;
                    const dy = pxY - y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < glowRadius && dist > bobberRadius) {
                        ctx.fillRect(pxX, pxY, px, px);
                    }
                }
            }
        }
    }
    
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
                // Inner fill - use rainbow colors if rainbow bobber
                if (isRainbow) {
                    const angle = Math.atan2(dy, dx);
                    const normalizedAngle = (angle + Math.PI) / (2 * Math.PI);
                    const rainbowColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
                    const colorIndex = Math.floor(normalizedAngle * rainbowColors.length) % rainbowColors.length;
                    ctx.fillStyle = rainbowColors[colorIndex];
                } else {
                    ctx.fillStyle = bobberColor;
                }
                ctx.fillRect(pxX, pxY, px, px);
            } else if (dist < bobberRadius + 1) {
                // Outline
                ctx.fillStyle = bobberOutline;
                ctx.fillRect(pxX, pxY, px, px);
            }
        }
    }
    
    // Add highlight pixel for 8-bit look (unless rainbow)
    if (!isRainbow) {
        const rgb = hexToRgb(bobberColor);
        if (rgb) {
            // Lighten the color for highlight
            const highlightR = Math.min(255, rgb.r + 40);
            const highlightG = Math.min(255, rgb.g + 40);
            const highlightB = Math.min(255, rgb.b + 40);
            ctx.fillStyle = `rgb(${highlightR}, ${highlightG}, ${highlightB})`;
        } else {
            ctx.fillStyle = '#a0522d'; // Fallback lighter brown
        }
        ctx.fillRect(Math.floor((x - 2) / px) * px, Math.floor((y - 2) / px) * px, px, px);
    }
}

// ============================================================================
// FISH DRAWING FUNCTIONS
// ============================================================================

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
    // Use color manipulation from utils.js
    const darkColor = (typeof darkenColor === 'function') ? darkenColor(bodyColor, 0.3) : bodyColor;
    const lightColor = (typeof lightenColor === 'function') ? lightenColor(bodyColor, 0.3) : bodyColor;
    
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

// ============================================================================
// ENVIRONMENT DRAWING FUNCTIONS
// ============================================================================

// Draw water ripples (uses environment module)
function drawRipples() {
    if (!canvas) return;
    
    // Get ripple data from environment module
    if (typeof getWaterRipples !== 'function' || typeof getLastRippleSpawn !== 'function' || 
        typeof setLastRippleSpawn !== 'function' || typeof spawnRipple !== 'function') {
        return; // Environment module not loaded
    }
    
    const waterRipples = getWaterRipples();
    let lastRippleSpawn = getLastRippleSpawn();
    const RIPPLE_SPAWN_INTERVAL = 150; // From environment module
    const RIPPLE_LIFETIME = 2000;
    
    const now = Date.now();
    
    // Handle case where lastRippleSpawn might be uninitialized or very old
    if (!lastRippleSpawn || lastRippleSpawn === 0) {
        setLastRippleSpawn(now);
        lastRippleSpawn = now;
    }
    
    // Handle large time gaps (e.g., tab was in background) - reset spawn timer
    if (now - lastRippleSpawn > 10000) { // More than 10 seconds gap
        setLastRippleSpawn(now - RIPPLE_SPAWN_INTERVAL); // Reset to allow immediate spawn
        lastRippleSpawn = now - RIPPLE_SPAWN_INTERVAL;
    }
    
    // Spawn new ripples randomly (but not too frequently)
    if (now - lastRippleSpawn > RIPPLE_SPAWN_INTERVAL + Math.random() * 150) {
        // Random chance to spawn (not every interval)
        if (Math.random() < 0.7) {
            spawnRipple(canvas);
            setLastRippleSpawn(now);
            lastRippleSpawn = now;
        }
    }
    
    // Update and draw existing ripples in 8-bit pixelated style
    const ripplePixelSize = 4; // Smaller pixels for ripples
    
    // Note: We need to modify the array directly, so we'll work with the reference
    // This is a limitation of the current design - ripples array is managed by environment module
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

// ============================================================================
// SPRITE RENDERING FUNCTIONS
// ============================================================================

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
    const savedCtx = ctx;
    const savedCanvas = canvas;
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

// ============================================================================
// ICON DRAWING FUNCTIONS
// ============================================================================

// 8-bit Icon Drawing Functions - Beveled frame style with shading
function create8BitIcon(iconType, displaySize = 32) {
    // Use 8x8 pixel grid, scale up for crisp rendering
    const gridSize = 8;
    const scale = 4; // Scale factor for crisp pixels
    const iconCanvas = document.createElement('canvas');
    iconCanvas.width = gridSize * scale;
    iconCanvas.height = gridSize * scale;
    const iconCtx = iconCanvas.getContext('2d');
    
    // CRITICAL: Disable image smoothing for true pixel art
    iconCtx.imageSmoothingEnabled = false;
    iconCtx.webkitImageSmoothingEnabled = false;
    iconCtx.mozImageSmoothingEnabled = false;
    iconCtx.msImageSmoothingEnabled = false;
    
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
    drawBeveledIcon(iconCtx, iconPixels, colors, px);
    
    return iconCanvas.toDataURL();
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

// Export functions to global scope
if (typeof window !== 'undefined') {
    window.PIXEL_SIZE = PIXEL_SIZE;
    window.drawCharacter = drawCharacter;
    window.drawCharacterHead = drawCharacterHead;
    window.drawCharacterHair = drawCharacterHair;
    window.drawCharacterHat = drawCharacterHat;
    window.drawCharacterBodyBase = drawCharacterBodyBase;
    window.drawCharacterShirt = drawCharacterShirt;
    window.drawCharacterPants = drawCharacterPants;
    window.drawCharacterBackArm = drawCharacterBackArm;
    window.drawCharacterFrontArm = drawCharacterFrontArm;
    window.drawCharacterAccessory = drawCharacterAccessory;
    window.drawFishingRod = drawFishingRod;
    window.drawFishingLine = drawFishingLine;
    window.drawBobber = drawBobber;
    window.drawFish = drawFish;
    window.drawFishSpecialEffects = drawFishSpecialEffects;
    window.drawFishByType = drawFishByType;
    window.drawPixelFish = drawPixelFish;
    window.drawFishTail = drawFishTail;
    window.drawRipples = drawRipples;
    window.renderFishSprite = renderFishSprite;
    window.create8BitIcon = create8BitIcon;
    window.drawBeveledIcon = drawBeveledIcon;
}

