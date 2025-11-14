// Environment effects: rain, ripples, etc.

// Rain particles
let rainParticles = [];
let lastFrameTime = Date.now();

function initRainParticles(canvas) {
    rainParticles = [];
    for (let i = 0; i < 100; i++) {
        rainParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 30 + Math.random() * 3
        });
    }
    lastFrameTime = Date.now();
}

// Water ripples system
let waterRipples = [];
let lastRippleSpawn = 0;
const RIPPLE_SPAWN_INTERVAL = 150; // Spawn a ripple every 1.5 seconds on average
const RIPPLE_LIFETIME = 2000; // Ripples last 2 seconds

function spawnRipple(canvas) {
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

function clearRipples() {
    waterRipples = [];
    lastRippleSpawn = 0;
}

function getRainParticles() {
    return rainParticles;
}

function getWaterRipples() {
    return waterRipples;
}

function getLastRippleSpawn() {
    return lastRippleSpawn;
}

function setLastRippleSpawn(time) {
    lastRippleSpawn = time;
}

function getLastFrameTime() {
    return lastFrameTime;
}

function setLastFrameTime(time) {
    lastFrameTime = time;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initRainParticles,
        spawnRipple,
        clearRipples,
        getRainParticles,
        getWaterRipples,
        getLastRippleSpawn,
        setLastRippleSpawn,
        getLastFrameTime,
        setLastFrameTime,
        RIPPLE_SPAWN_INTERVAL,
        RIPPLE_LIFETIME
    };
}

// Export to global scope for browser
if (typeof window !== 'undefined') {
    window.initRainParticles = initRainParticles;
    window.spawnRipple = spawnRipple;
    window.clearRipples = clearRipples;
    window.getRainParticles = getRainParticles;
    window.getWaterRipples = getWaterRipples;
    window.getLastRippleSpawn = getLastRippleSpawn;
    window.setLastRippleSpawn = setLastRippleSpawn;
    window.getLastFrameTime = getLastFrameTime;
    window.setLastFrameTime = setLastFrameTime;
}

