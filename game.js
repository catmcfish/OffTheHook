// Game state
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
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    currentUser: null,
    settings: {
        rainEnabled: true,
        grassEnabled: true
    }
};

// Canvas setup - will be initialized when DOM is ready
let canvas;
let ctx;

function resizeCanvas() {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initRainParticles();
        // Clear ripples on resize
        waterRipples = [];
        lastRippleSpawn = 0;
    }
}

// Fantasy fish types
const fishTypes = [
    { name: 'Glowfin', baseValue: 10, color: '#ffff00' },
    { name: 'Crystal Scale', baseValue: 15, color: '#00ffff' },
    { name: 'Shadow Serpent', baseValue: 20, color: '#800080' },
    { name: 'Fire Gills', baseValue: 25, color: '#ff4500' },
    { name: 'Ice Fin', baseValue: 18, color: '#87ceeb' },
    { name: 'Thunder Trout', baseValue: 22, color: '#9370db' },
    { name: 'Mystic Ray', baseValue: 30, color: '#ff1493' },
    { name: 'Cosmic Carp', baseValue: 35, color: '#4b0082' },
    { name: 'Phantom Pike', baseValue: 28, color: '#2f4f4f' },
    { name: 'Starfish', baseValue: 40, color: '#ffd700' },
    { name: 'Dragon Fin', baseValue: 50, color: '#ff6347' },
    { name: 'Celestial Bass', baseValue: 60, color: '#00ced1' },
    { name: 'Void Eel', baseValue: 70, color: '#191970' },
    { name: 'Prismatic Perch', baseValue: 80, color: '#ff1493' },
    { name: 'Ethereal Angelfish', baseValue: 90, color: '#da70d6' },
    { name: 'Titan Tuna', baseValue: 100, color: '#ff8c00' },
    { name: 'Godfish', baseValue: 150, color: '#ff00ff' },
    { name: 'Omnipotent Oarfish', baseValue: 200, color: '#ff1493' }
];

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

// Keys for desktop QTE
const qteKeys = ['A', 'S', 'D', 'W', 'E', 'Q', 'R', 'F'];

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
    const type = fishTypes[Math.floor(Math.random() * fishTypes.length)];
    
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
    
    // Calculate value
    const value = Math.floor(type.baseValue * rarity.multiplier * size.multiplier);
    
    return {
        type: type.name,
        rarity: rarity.name,
        size: size.name,
        value: value,
        color: type.color,
        rarityColor: rarity.color,
        rarityData: rarity
    };
}

// Rain particles
let rainParticles = [];
let lastFrameTime = Date.now();

function initRainParticles() {
    rainParticles = [];
    for (let i = 0; i < 100; i++) {
        rainParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 6 + Math.random() * 3
        });
    }
    lastFrameTime = Date.now();
}

// Water ripples system
let waterRipples = [];
let lastRippleSpawn = 0;
const RIPPLE_SPAWN_INTERVAL = 1500; // Spawn a ripple every 1.5 seconds on average
const RIPPLE_LIFETIME = 2000; // Ripples last 2 seconds

function spawnRipple() {
    if (!canvas) return;
    
    const waterLevel = canvas.height * 0.6;
    const landEndX = canvas.width * 0.4;
    
    // Spawn ripple randomly in water area
    const x = landEndX + Math.random() * (canvas.width - landEndX);
    const y = waterLevel + Math.random() * (canvas.height - waterLevel);
    
    waterRipples.push({
        x: x,
        y: y,
        radius: 2,
        maxRadius: 15 + Math.random() * 10,
        opacity: 0.6,
        spawnTime: Date.now(),
        lifetime: RIPPLE_LIFETIME
    });
}

// Rain particles will be initialized when canvas is ready

// Draw game
function draw() {
    if (!canvas || !ctx || canvas.width === 0 || canvas.height === 0) {
        return;
    }
    
    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw sky (dark grey, overcast) - fills top portion
    const skyHeight = canvas.height * 0.6;
    const skyGradient = ctx.createLinearGradient(0, 0, 0, skyHeight);
    skyGradient.addColorStop(0, '#4a5568');
    skyGradient.addColorStop(1, '#2d3748');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, skyHeight);
    
    // Draw rain (if enabled) - use time-based updates so it continues even when paused
    if (gameState.settings.rainEnabled) {
        const now = Date.now();
        const deltaTime = Math.min((now - lastFrameTime) / 16.67, 100); // Cap at 100ms to prevent huge jumps
        lastFrameTime = now;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        rainParticles.forEach((particle, i) => {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle.x, particle.y + 10);
            ctx.stroke();
            
            // Update based on actual time elapsed, not frame count
            particle.y += particle.speed * (deltaTime / 16.67); // Normalize to 60fps
            if (particle.y > canvas.height) {
                particle.y = -10;
                particle.x = Math.random() * canvas.width;
            }
        });
    } else {
        // Still update lastFrameTime even when rain is disabled to prevent time jumps
        lastFrameTime = Date.now();
    }
    
    // Draw water (dark blue) - fills right side and below beach curve
    // Draw water FIRST so beach can be drawn on top
    const waterLevel = canvas.height * 0.6;
    const landStartX = 0;
    const landEndX = canvas.width * 0.4; // Land extends about 40% of screen width
    
    // Beach starting height - independent of water level
    const beachStartY = canvas.height * 0.5; // Beach starts higher up
    
    // Define curve control points once - used for beach curve
    const curveControlX = landEndX * 0.4;
    const curveControlY = waterLevel - 110;
    const curveEndY = canvas.height; // End point of curve (where beach meets water)
    
    const waterGradient = ctx.createLinearGradient(0, waterLevel, 0, canvas.height);
    waterGradient.addColorStop(0, '#1e3c72');
    waterGradient.addColorStop(0.5, '#2a4a7a');
    waterGradient.addColorStop(1, '#0f1f3d');
    ctx.fillStyle = waterGradient;
    // Water is at static height - horizontal line
    ctx.fillRect(0, waterLevel, canvas.width, canvas.height - waterLevel);
    
    // Draw land/beach (brown) - left side, curving down into ocean
    // Draw beach AFTER water so it appears on top
    ctx.fillStyle = '#8b6f47';
    ctx.beginPath();
    ctx.moveTo(landStartX, 0);
    ctx.lineTo(landStartX, beachStartY);
    // Create a more pronounced curve down and to the right into ocean
    ctx.quadraticCurveTo(curveControlX, curveControlY, landEndX, curveEndY);
    ctx.lineTo(landEndX, canvas.height);
    ctx.lineTo(landStartX, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // Draw grass/vegetation on top of land (along the curve) - if enabled
    if (gameState.settings.grassEnabled) {
        ctx.fillStyle = '#5a7c3a';
        ctx.beginPath();
        ctx.moveTo(landStartX, 0);
        ctx.lineTo(landStartX, beachStartY);
        ctx.quadraticCurveTo(curveControlX, curveControlY, landEndX, curveEndY);
        ctx.lineTo(landEndX, curveEndY + 8);
        ctx.quadraticCurveTo(curveControlX, curveControlY + 8, landStartX, beachStartY + 8);
        ctx.closePath();
        ctx.fill();
    }
    
    // Calculate character position on beach (standing on the curve)
    const charX = landEndX * 0.25;
    // Calculate Y position on the quadratic curve using the formula
    const t = charX / landEndX; // Parameter t from 0 to 1
    const beachCurveY = (1 - t) * (1 - t) * beachStartY + 2 * (1 - t) * t * curveControlY + t * t * curveEndY;
    const charY = beachCurveY;
    
    // Draw character on beach (facing right toward ocean)
    drawCharacter(charX, charY, true); // true = facing right
    
    // Draw fishing line - casting forward/right from beach into water (side view)
    if (gameState.isCasting || gameState.isReeling) {
        const lineStartX = charX + 8;
        const lineStartY = charY - 15;
        
        let lineEndX, lineEndY;
        
        // If bobber is being thrown, animate it through the air
        if (gameState.bobberThrown && gameState.bobberThrowProgress < 1) {
            // Calculate destination
            const maxCastDistance = canvas.width * 0.4;
            const destX = lineStartX + maxCastDistance;
            const destY = waterLevel + 10;
            
            // Animate bobber along arc trajectory
            const progress = gameState.bobberThrowProgress;
            lineEndX = lineStartX + (destX - lineStartX) * progress;
            // Arc trajectory: higher at the start, lower at the end
            const arcHeight = 60 * Math.sin(progress * Math.PI); // Creates an arc
            lineEndY = lineStartY + (destY - lineStartY) * progress - arcHeight;
            
            // Update bobber position
            gameState.bobberX = lineEndX;
            gameState.bobberY = lineEndY;
        } else if (gameState.isReeling) {
            // When reeling, use the calculated position
            const maxCastDistance = canvas.width * 0.4;
            lineEndX = lineStartX + (gameState.lineDepth / gameState.maxDepth) * maxCastDistance;
            lineEndY = waterLevel + 10 + (gameState.lineDepth / gameState.maxDepth) * 50;
        } else if (gameState.isCasting && gameState.bobberThrown && gameState.bobberThrowProgress >= 1) {
            // Bobber has landed, now line is going deeper
            const maxCastDistance = canvas.width * 0.4;
            const baseX = lineStartX + maxCastDistance;
            const baseY = waterLevel + 10;
            lineEndX = baseX;
            lineEndY = baseY + (gameState.lineDepth / gameState.maxDepth) * 50;
            
            // Update bobber position to follow line depth
            gameState.bobberX = lineEndX;
            gameState.bobberY = lineEndY;
        } else if (gameState.isCasting && !gameState.bobberThrown) {
            // During casting (before throw starts), initialize bobber at character
            if (gameState.bobberX === 0 && gameState.bobberY === 0) {
                gameState.bobberX = lineStartX;
                gameState.bobberY = lineStartY;
            }
            lineEndX = gameState.bobberX;
            lineEndY = gameState.bobberY;
        } else {
            // Fallback
            lineEndX = lineStartX;
            lineEndY = lineStartY;
        }
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(lineStartX, lineStartY);
        ctx.lineTo(lineEndX, lineEndY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw bobber (either flying or in water)
        if (gameState.bobberThrown || gameState.isReeling || (gameState.isCasting && gameState.bobberThrowProgress >= 1)) {
            ctx.fillStyle = '#8b4513';
            ctx.beginPath();
            ctx.arc(lineEndX, lineEndY, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        // Draw fish if caught (with struggling animation)
        if (gameState.currentFish && gameState.isReeling) {
            const fishX = lineEndX + Math.sin(gameState.struggleAnimation) * 12;
            const fishY = lineEndY + Math.cos(gameState.struggleAnimation * 0.7) * 8;
            drawFish(fishX, fishY, gameState.currentFish);
            
            // Update struggle animation
            gameState.struggleAnimation += 0.3;
        }
    }
    
    // Draw water ripples (if rain is enabled)
    if (gameState.settings.rainEnabled) {
        drawRipples();
    }
}

function drawCharacter(x, y, facingRight = false) {
    // 8-bit character side view (like Mario), standing on pier
    const width = 16;
    const height = 24;
    const direction = facingRight ? 1 : -1;
    
    // Body (standing, side view)
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(x - width/2, y - height, width, height);
    
    // Head (side view, circular-ish)
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(x, y - height - 8, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Hat/Helmet (golden colored, side view)
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(x - 8, y - height - 12, 16, 6);
    ctx.fillRect(x - 6, y - height - 16, 12, 4);
    
    // Scarf/Cape (red) - hanging down on the side facing away from direction
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x - width/2 - (direction * 2), y - height + 4, 4, height - 8);
    
    // Eyes (side view, facing the direction)
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + (direction * 2), y - height - 6, 2, 2);
    
    // Arms (side view)
    ctx.fillStyle = '#ffdbac';
    ctx.fillRect(x - width/2 - 4, y - height + 6, 4, 8);
    ctx.fillRect(x + width/2, y - height + 6, 4, 8);
    
    // Fishing rod (when fishing) - golden rod, pointing forward in facing direction
    if (gameState.isCasting || gameState.isReeling) {
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + (direction * width/2), y - height + 10);
        ctx.lineTo(x + (direction * 25), y - height - 5);
        ctx.stroke();
    }
}

function drawFish(x, y, fish) {
    const baseSize = 20;
    const sizeMultiplier = fish.size === 'Tiny' ? 0.7 : fish.size === 'Small' ? 0.85 : fish.size === 'Large' ? 1.3 : fish.size === 'Huge' ? 1.8 : 1.0;
    const size = baseSize * sizeMultiplier;
    
    // Fish body with struggling motion
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(gameState.struggleAnimation) * 0.2);
    
    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Fish tail (wiggling)
    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(-size - size/2, -size/3);
    ctx.lineTo(-size - size/2, size/3);
    ctx.closePath();
    ctx.fill();
    
    // Fish eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(size / 3, -size / 4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(size / 3, -size / 4, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawRipples() {
    if (!canvas) return;
    
    const now = Date.now();
    
    // Spawn new ripples randomly (but not too frequently)
    if (now - lastRippleSpawn > RIPPLE_SPAWN_INTERVAL + Math.random() * 1000) {
        // Random chance to spawn (not every interval)
        if (Math.random() < 0.7) {
            spawnRipple();
            lastRippleSpawn = now;
        }
    }
    
    // Update and draw existing ripples
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.5;
    
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
        
        // Draw ripple
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw inner ring for more detail
        if (ripple.radius > 5) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius * 0.6, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

// Cast line
function castLine() {
    if (gameState.isCasting || gameState.isReeling) return;
    
    gameState.isCasting = true;
    gameState.lineDepth = 0;
    gameState.bobberThrown = false;
    gameState.bobberThrowProgress = 0;
    
    // Initialize bobber position (will be set by draw function on first render)
    gameState.bobberX = 0;
    gameState.bobberY = 0;
    
    // Wait for first draw to set bobber position, then start throw animation
    setTimeout(() => {
        // Animate bobber throw (arc through air)
        const throwDuration = 800; // milliseconds
        const throwStartTime = Date.now();
        
        const throwInterval = setInterval(() => {
            const elapsed = Date.now() - throwStartTime;
            gameState.bobberThrowProgress = Math.min(elapsed / throwDuration, 1);
            gameState.bobberThrown = true;
            
            if (gameState.bobberThrowProgress >= 1) {
                clearInterval(throwInterval);
                // Bobber has landed, now animate line going down
                gameState.lineDepth = 0;
                
                const castInterval = setInterval(() => {
                    gameState.lineDepth += 2;
                    if (gameState.lineDepth >= gameState.maxDepth) {
                        clearInterval(castInterval);
                        gameState.isCasting = false;
                        
                        // Fish bites!
                        setTimeout(() => {
                            gameState.currentFish = generateFish();
                            gameState.isReeling = true;
                            startQTE();
                        }, 500);
                    }
                    draw();
                }, 16);
            }
            draw();
        }, 16);
    }, 50); // Small delay to ensure first draw has happened
}

// Quick Time Event
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
    
    // Animate reeling in (pulling fish back toward character)
    const reelInterval = setInterval(() => {
        gameState.lineDepth -= 3;
        if (gameState.lineDepth <= 0) {
            clearInterval(reelInterval);
            catchFish();
        }
        draw();
    }, 16);
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
    
    // Reset line
    const resetInterval = setInterval(() => {
        gameState.lineDepth -= 3;
        if (gameState.lineDepth <= 0) {
            clearInterval(resetInterval);
            gameState.lineDepth = 0;
        }
        draw();
    }, 16);
}

function catchFish() {
    gameState.isReeling = false;
    gameState.gold += gameState.currentFish.value;
    gameState.fishCount++;
    const caughtFish = { ...gameState.currentFish };
    gameState.inventory.push(caughtFish);
    
    // Save user data
    saveUserData();
    
    // Check if this fish should be on leaderboard
    checkLeaderboardUpdate(caughtFish);
    
    updateUI();
    showFishInfo();
    updateBackpack();
    
    gameState.currentFish = null;
    gameState.lineDepth = 0;
    draw();
}

function showFishInfo() {
    const fishInfo = document.getElementById('fish-info');
    const fishDetails = document.getElementById('fish-details');
    const fish = gameState.currentFish;
    
    fishDetails.innerHTML = `
        <div class="fish-name" style="color: ${fish.rarityColor}">${fish.type}</div>
        <div class="fish-attribute">Rarity: <span class="rarity-${fish.rarity.toLowerCase()}">${fish.rarity}</span></div>
        <div class="fish-attribute">Size: ${fish.size}</div>
        <div class="fish-attribute">Value: <span style="color: #f39c12">${fish.value} gold</span></div>
    `;
    
    fishInfo.classList.remove('hidden');
}

function updateUI() {
    document.getElementById('gold').textContent = gameState.gold;
    document.getElementById('fish-count').textContent = gameState.fishCount;
}

function updateBackpack() {
    const backpackList = document.getElementById('backpack-list');
    backpackList.innerHTML = '';
    
    // Show all fish
    const allFish = [...gameState.inventory].reverse();
    
    if (allFish.length === 0) {
        backpackList.innerHTML = '<div style="text-align: center; color: #95a5a6; padding: 20px;">No fish caught yet!</div>';
        return;
    }
    
    // Find most valuable fish
    const mostValuableFish = allFish.reduce((max, fish) => 
        fish.value > max.value ? fish : max, allFish[0]);
    
    // Display most valuable fish at the top
    const mostValuableDiv = document.createElement('div');
    mostValuableDiv.className = 'most-valuable-fish';
    mostValuableDiv.innerHTML = `
        <div class="most-valuable-header">🏆 Most Valuable Fish</div>
        <div class="backpack-item most-valuable-item">
            <div class="backpack-item-name" style="color: ${mostValuableFish.rarityColor}">${mostValuableFish.type}</div>
            <div class="backpack-item-details">${mostValuableFish.size} ${mostValuableFish.rarity}</div>
            <div class="backpack-item-value">${mostValuableFish.value}G</div>
        </div>
    `;
    backpackList.appendChild(mostValuableDiv);
    
    // Add separator
    const separator = document.createElement('div');
    separator.className = 'backpack-separator';
    separator.innerHTML = '<div class="separator-text">All Fish</div>';
    backpackList.appendChild(separator);
    
    allFish.forEach(fish => {
        const item = document.createElement('div');
        item.className = 'backpack-item';
        item.innerHTML = `
            <div class="backpack-item-name" style="color: ${fish.rarityColor}">${fish.type}</div>
            <div class="backpack-item-details">${fish.size} ${fish.rarity}</div>
            <div class="backpack-item-value">${fish.value}G</div>
        `;
        backpackList.appendChild(item);
    });
}

// Authentication and User Management - API-based
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
                settings: gameState.settings
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
            
            // Load settings from database (primary source)
            if (result.data.settings) {
                gameState.settings = { 
                    rainEnabled: true,  // defaults
                    grassEnabled: true,
                    ...result.data.settings  // database settings override defaults
                };
            }
            
            // Update localStorage to match database
            localStorage.setItem('fishingGameSettings', JSON.stringify(gameState.settings));
            
            updateUI();
            updateBackpack();
            updateSettingsUI();
        } else {
            // Load from localStorage if API fails
            loadSettings();
            updateSettingsUI();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        // Load from localStorage as fallback
        loadSettings();
        updateSettingsUI();
    }
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
    if (gameState.currentUser) {
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
    updateUI();
    updateBackpack();
    localStorage.removeItem('fishingGameCurrentUser');
}

// Leaderboard System - API-based
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

// Initialize game when DOM is ready
function initGame() {
    // Initialize canvas
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
    
    // Resize canvas to fill screen
    resizeCanvas();
    // Remove any existing resize listener and add a new one
    window.removeEventListener('resize', resizeCanvas);
    window.addEventListener('resize', resizeCanvas);
    
    // Spacebar casting (only when not in QTE)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !gameState.isCasting && !gameState.isReeling && !gameState.qteActive) {
            e.preventDefault();
            castLine();
        }
    });

    // Cast button at top
    const castButtonTop = document.getElementById('cast-button-top');
    if (castButtonTop) {
        castButtonTop.addEventListener('click', castLine);
        castButtonTop.addEventListener('touchstart', (e) => {
            e.preventDefault();
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
                updateBackpack();
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

    // Continue button for fish info
    const continueButton = document.getElementById('continue-button');
    if (continueButton) {
        continueButton.addEventListener('click', () => {
            const fishInfo = document.getElementById('fish-info');
            if (fishInfo) {
                fishInfo.classList.add('hidden');
            }
        });
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
        loadUserData(savedUser).then(() => {
            authOverlay.classList.add('hidden');
        });
    } else {
        authOverlay.classList.remove('hidden');
    }
    
    showRegister?.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        authError.classList.add('hidden');
    });
    
    showLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        authError.classList.add('hidden');
    });
    
    loginButton?.addEventListener('click', async () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const result = await login(username, password);
        if (result.success) {
            localStorage.setItem('fishingGameCurrentUser', username);
            authOverlay.classList.add('hidden');
            authError.classList.add('hidden');
        } else {
            authError.textContent = result.error;
            authError.classList.remove('hidden');
        }
    });
    
    registerButton?.addEventListener('click', async () => {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;
        
        const result = await register(username, password, passwordConfirm);
        if (result.success) {
            gameState.currentUser = username;
            localStorage.setItem('fishingGameCurrentUser', username);
            authOverlay.classList.add('hidden');
            authError.classList.add('hidden');
        } else {
            authError.textContent = result.error;
            authError.classList.remove('hidden');
        }
    });
    
    // Leaderboard button
    const leaderboardButton = document.getElementById('leaderboard-button');
    const leaderboardOverlay = document.getElementById('leaderboard-overlay');
    const leaderboardClose = document.getElementById('leaderboard-close');
    
    leaderboardButton?.addEventListener('click', () => {
        displayLeaderboard();
        leaderboardOverlay.classList.remove('hidden');
    });
    
    leaderboardClose?.addEventListener('click', () => {
        leaderboardOverlay.classList.add('hidden');
    });
    
    // Settings button and overlay
    const settingsButton = document.getElementById('settings-button');
    const settingsOverlay = document.getElementById('settings-overlay');
    const settingsClose = document.getElementById('settings-close');
    const rainToggle = document.getElementById('setting-rain');
    const grassToggle = document.getElementById('setting-grass');
    const logoutButton = document.getElementById('logout-button');
    
    settingsButton?.addEventListener('click', () => {
        updateSettingsUI();
        settingsOverlay.classList.remove('hidden');
    });
    
    settingsClose?.addEventListener('click', () => {
        settingsOverlay.classList.add('hidden');
    });
    
    rainToggle?.addEventListener('change', (e) => {
        gameState.settings.rainEnabled = e.target.checked;
        saveSettings();
    });
    
    grassToggle?.addEventListener('change', (e) => {
        gameState.settings.grassEnabled = e.target.checked;
        saveSettings();
    });
    
    logoutButton?.addEventListener('click', async () => {
        if (confirm('Are you sure you want to logout?')) {
            await logout();
            settingsOverlay.classList.add('hidden');
            authOverlay.classList.remove('hidden');
        }
    });
    
    // Load settings on init
    loadSettings();
    updateSettingsUI();
    
    // Allow Enter key to submit forms
    document.getElementById('login-password')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });
    
    document.getElementById('register-password-confirm')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            registerButton.click();
        }
    });

    // Initial draw
    draw();

    // Animation loop - runs continuously for struggling fish animation
    function gameLoop() {
        draw();
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

