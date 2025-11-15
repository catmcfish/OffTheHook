// Rendering module - Main rendering loop and canvas management
// Uses global: gameState, canvas, ctx, skyGradientCache (from gameState.js)
// Depends on: drawing.js, events.js, environment.js, gameLogic.js, qte.js

// Performance profiling (only enabled in development)
const PERFORMANCE_PROFILING = false; // Set to true to enable profiling
let performanceStats = {
    frameCount: 0,
    totalTime: 0,
    skyTime: 0,
    rainTime: 0,
    waterTime: 0,
    beachTime: 0,
    grassTime: 0,
    characterTime: 0,
    fishingLineTime: 0,
    ripplesTime: 0,
    otherTime: 0
};

// Resize canvas to fill window
function resizeCanvas() {
    if (typeof canvas === 'undefined' || !canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Initialize rain particles if environment module is available
    if (typeof initRainParticles === 'function') {
        initRainParticles(canvas);
    }
    
    // Initialize clouds if environment module is available
    if (typeof initClouds === 'function') {
        initClouds(canvas);
    }
    
    // Clear ripples on resize if environment module is available
    if (typeof clearRipples === 'function') {
        clearRipples();
    }
    
    // Clear gradient cache on resize
    if (typeof skyGradientCache !== 'undefined') {
        skyGradientCache.gradient = null;
        skyGradientCache.canvasHeight = null;
        skyGradientCache.timeOfDay = null;
    }
}

// Main rendering loop
function draw() {
    if (typeof canvas === 'undefined' || !canvas || typeof ctx === 'undefined' || !ctx || canvas.width === 0 || canvas.height === 0) {
        return;
    }
    
    const frameStart = PERFORMANCE_PROFILING ? performance.now() : 0;
    let sectionStart = frameStart;
    
    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update time of day (from events.js)
    if (typeof getTimeOfDay === 'function' && typeof getCurrentEvent === 'function') {
        gameState.timeOfDay = getTimeOfDay();
        gameState.currentEvent = getCurrentEvent();
    }
    
    // Calculate deltaTime early for use in animations (clouds, rain, etc.)
    const now = Date.now();
    let lastFrameTime = typeof getLastFrameTime === 'function' ? getLastFrameTime() : now;
    let deltaTime = (now - lastFrameTime) / 16.67; // Normalize to 60fps
    
    // Handle large time gaps (e.g., tab was in background)
    if (deltaTime > 100) {
        // Tab was paused for a while - reset particles to prevent weird behavior
        if (typeof initRainParticles === 'function') {
            initRainParticles(canvas);
        }
        if (typeof initClouds === 'function') {
            initClouds(canvas);
        }
        deltaTime = 1; // Use normal delta for this frame
    } else if (deltaTime < 0) {
        // Time went backwards (system clock change) - reset
        deltaTime = 1;
    } else if (deltaTime === 0 || isNaN(deltaTime)) {
        // Prevent division by zero or NaN
        deltaTime = 1;
    }
    
    // Store deltaTime globally for use in drawing functions
    if (typeof window !== 'undefined') {
        window.deltaTime = deltaTime;
    }
    
    // Draw sky with gradual color transitions based on exact time
    const skyHeight = canvas.height * 0.6;
    
    // Get gradual sky colors based on exact time (not just timeOfDay phase)
    let topColor, bottomColor;
    if (typeof getSkyColors === 'function') {
        const skyColors = getSkyColors();
        topColor = skyColors.topColor;
        bottomColor = skyColors.bottomColor;
    } else {
        // Fallback to discrete colors if getSkyColors not available
        switch (gameState.timeOfDay) {
            case 'morning':
                topColor = '#ff9a56';
                bottomColor = '#ffd89b';
                break;
            case 'noon':
                topColor = '#87ceeb';
                bottomColor = '#e0f6ff';
                break;
            case 'afternoon':
                topColor = '#ffa500';
                bottomColor = '#ffd700';
                break;
            case 'night':
                topColor = '#191970';
                bottomColor = '#000033';
                break;
            default:
                topColor = '#4a5568';
                bottomColor = '#2d3748';
        }
    }
    
    // Create gradient (recreate every frame for smooth color transitions)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, skyHeight);
    skyGradient.addColorStop(0, topColor);
    skyGradient.addColorStop(1, bottomColor);
    
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, skyHeight);
    
    // Draw sun or moon based on time
    if (typeof getSunMoonPosition === 'function') {
        const sunMoonPos = getSunMoonPosition(canvas.width, canvas.height);
        if (sunMoonPos.isDaytime && sunMoonPos.sunX !== null && sunMoonPos.sunY !== null) {
            if (typeof drawSun === 'function') {
                drawSun(sunMoonPos.sunX, sunMoonPos.sunY);
            }
        } else if (!sunMoonPos.isDaytime && sunMoonPos.moonX !== null && sunMoonPos.moonY !== null) {
            if (typeof drawMoon === 'function') {
                drawMoon(sunMoonPos.moonX, sunMoonPos.moonY);
            }
        }
    }
    
    // Draw clouds (after sky but before other elements)
    if (typeof drawClouds === 'function') {
        drawClouds();
    }
    
    // Spawn and draw seagulls (occasionally)
    if (typeof getSeagulls === 'function' && typeof getLastSeagullSpawn === 'function' && 
        typeof setLastSeagullSpawn === 'function' && typeof spawnSeagull === 'function') {
        
        const lastSeagullSpawn = getLastSeagullSpawn();
        const SEAGULL_MIN_SPAWN_INTERVAL = 5000;
        const SEAGULL_MAX_SPAWN_INTERVAL = 15000;
        
        // Spawn seagull occasionally (every 5-15 seconds)
        if (!lastSeagullSpawn || lastSeagullSpawn === 0) {
            setLastSeagullSpawn(now);
        } else {
            const timeSinceLastSpawn = now - lastSeagullSpawn;
            const spawnInterval = SEAGULL_MIN_SPAWN_INTERVAL + Math.random() * (SEAGULL_MAX_SPAWN_INTERVAL - SEAGULL_MIN_SPAWN_INTERVAL);
            
            if (timeSinceLastSpawn > spawnInterval) {
                spawnSeagull(canvas);
                setLastSeagullSpawn(now);
            }
        }
        
        // Draw seagulls
        if (typeof drawSeagulls === 'function') {
            drawSeagulls();
        }
    }
    
    if (PERFORMANCE_PROFILING) {
        performanceStats.skyTime += performance.now() - sectionStart;
        sectionStart = performance.now();
    }
    
    // Update frame time for next frame (from environment.js)
    if (typeof setLastFrameTime === 'function') {
        setLastFrameTime(now);
    }
    
    // Draw rain (if enabled) - 8-bit pixelated style
    if (gameState.settings.rainEnabled && typeof getRainParticles === 'function') {
        const rainParticles = getRainParticles();
        const rainPixelSize = 2; // Size of each rain pixel
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        rainParticles.forEach((particle, i) => {
            // Draw rain as pixel blocks (vertical line of pixels)
            const rainLength = 8; // Length of rain drop in pixels
            const pixelX = Math.floor(particle.x / rainPixelSize) * rainPixelSize;
            const pixelY = Math.floor(particle.y / rainPixelSize) * rainPixelSize;
            
            // Draw vertical line of pixels for 8-bit rain
            for (let j = 0; j < rainLength; j++) {
                const yPos = pixelY + (j * rainPixelSize);
                if (yPos >= 0 && yPos < canvas.height) {
                    ctx.fillRect(pixelX, yPos, rainPixelSize, rainPixelSize);
                }
            }
            
            // Update based on actual time elapsed, not frame count
            particle.y += particle.speed * deltaTime;
            if (particle.y > canvas.height + (rainLength * rainPixelSize)) {
                particle.y = -(rainLength * rainPixelSize);
                particle.x = Math.random() * canvas.width;
            }
        });
        
        if (PERFORMANCE_PROFILING) {
            performanceStats.rainTime += performance.now() - sectionStart;
            sectionStart = performance.now();
        }
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
    
    // Draw pixelated ocean (8-bit style)
    // Use solid colors in pixel blocks instead of gradients
    const pixelSize = 8; // Size of each pixel block
    ctx.fillStyle = '#1e3c72'; // Base ocean color
    
    // Draw ocean in pixel blocks for 8-bit look
    for (let y = Math.floor(waterLevel / pixelSize) * pixelSize; y < canvas.height; y += pixelSize) {
        for (let x = 0; x < canvas.width; x += pixelSize) {
            // Create depth effect with different shades
            const depth = (y - waterLevel) / (canvas.height - waterLevel);
            if (depth < 0.3) {
                ctx.fillStyle = '#2a4a7a'; // Lighter blue near surface
            } else if (depth < 0.6) {
                ctx.fillStyle = '#1e3c72'; // Medium blue
            } else {
                ctx.fillStyle = '#0f1f3d'; // Dark blue at bottom
            }
            
            // Add some pixelated wave pattern (checkerboard effect)
            const wavePattern = Math.floor((x + y * 0.5) / (pixelSize * 2)) % 2;
            if (wavePattern === 0 && depth < 0.4) {
                ctx.fillStyle = '#3a5a8a'; // Slightly lighter for wave effect
            }
            
            ctx.fillRect(x, y, pixelSize, pixelSize);
        }
    }
    
    if (PERFORMANCE_PROFILING) {
        performanceStats.waterTime += performance.now() - sectionStart;
        sectionStart = performance.now();
    }
    
    // Draw pixelated beach (8-bit style)
    // Draw beach AFTER water so it appears on top
    const beachPixelSize = 8;
    ctx.fillStyle = '#8b6f47'; // Beach brown color
    
    // Draw beach in pixel blocks, following the curve
    for (let y = Math.floor(beachStartY / beachPixelSize) * beachPixelSize; y < canvas.height; y += beachPixelSize) {
        for (let x = 0; x < landEndX; x += beachPixelSize) {
            // Calculate if this pixel is on the beach side of the curve
            const t = x / landEndX;
            const curveY = (1 - t) * (1 - t) * beachStartY + 2 * (1 - t) * t * curveControlY + t * t * curveEndY;
            
            // Check if pixel is on beach (left of curve or below curve)
            if (x < landStartX || y >= curveY) {
                // Add some texture variation
                const texture = Math.floor((x + y * 0.7) / (beachPixelSize * 3)) % 3;
                if (texture === 0) {
                    ctx.fillStyle = '#9b7f57'; // Slightly lighter
                } else if (texture === 1) {
                    ctx.fillStyle = '#7b5f37'; // Slightly darker
                } else {
                    ctx.fillStyle = '#8b6f47'; // Base color
                }
                
                ctx.fillRect(x, y, beachPixelSize, beachPixelSize);
            }
        }
    }
    
    if (PERFORMANCE_PROFILING) {
        performanceStats.beachTime += performance.now() - sectionStart;
        sectionStart = performance.now();
    }
    
    // Draw beach edge pixels more precisely for smoother curve appearance
    for (let x = 0; x < landEndX; x += beachPixelSize) {
        const t = x / landEndX;
        const curveY = (1 - t) * (1 - t) * beachStartY + 2 * (1 - t) * t * curveControlY + t * t * curveEndY;
        const pixelY = Math.floor(curveY / beachPixelSize) * beachPixelSize;
        
        // Draw edge pixels
        ctx.fillStyle = '#8b6f47';
        ctx.fillRect(x, pixelY, beachPixelSize, beachPixelSize);
        
        // Add highlight pixels on curve edge
        if (pixelY < canvas.height - beachPixelSize) {
            ctx.fillStyle = '#9b7f57';
            ctx.fillRect(x, pixelY - beachPixelSize, beachPixelSize, beachPixelSize);
        }
    }
    
    // Draw pixelated grass/vegetation on top of land (along the curve) - if enabled
    if (gameState.settings.grassEnabled) {
        const grassPixelSize = 8;
        ctx.fillStyle = '#5a7c3a'; // Grass green
        
        // Draw grass in pixel blocks along the curve
        for (let x = 0; x < landEndX; x += grassPixelSize) {
            const t = x / landEndX;
            const curveY = (1 - t) * (1 - t) * beachStartY + 2 * (1 - t) * t * curveControlY + t * t * curveEndY;
            const grassTopY = Math.floor(curveY / grassPixelSize) * grassPixelSize;
            const grassHeight = Math.max(grassPixelSize, Math.floor(8 / grassPixelSize) * grassPixelSize);
            
            // Draw grass pixels with some variation
            for (let y = grassTopY; y < grassTopY + grassHeight; y += grassPixelSize) {
                const texture = Math.floor((x + y * 0.5) / (grassPixelSize * 2)) % 2;
                if (texture === 0) {
                    ctx.fillStyle = '#6a8c4a'; // Slightly lighter green
                } else {
                    ctx.fillStyle = '#5a7c3a'; // Base green
                }
                
                // Only draw if on beach side
                if (x < landStartX || y >= curveY) {
                    ctx.fillRect(x, y, grassPixelSize, grassPixelSize);
                }
            }
        }
    }
    
    if (PERFORMANCE_PROFILING && gameState.settings.grassEnabled) {
        performanceStats.grassTime += performance.now() - sectionStart;
        sectionStart = performance.now();
    }
    
    // Calculate character position on beach (standing on the curve)
    const charX = landEndX * 0.25;
    // Calculate Y position on the quadratic curve using the formula
    const t = charX / landEndX; // Parameter t from 0 to 1
    const beachCurveY = (1 - t) * (1 - t) * beachStartY + 2 * (1 - t) * t * curveControlY + t * t * curveEndY;
    const charY = beachCurveY;
    
    // Draw character on beach (facing right toward ocean)
    if (typeof drawCharacter === 'function') {
        drawCharacter(charX, charY, true); // true = facing right
    }
    
    if (PERFORMANCE_PROFILING) {
        performanceStats.characterTime += performance.now() - sectionStart;
        sectionStart = performance.now();
    }
    
    // ========================================================================
    // ANIMATION UPDATES: Use time-based state updates, NOT setInterval
    // See documentation at top of file for the unified animation system pattern
    // ========================================================================
    
    // Update casting/reeling animations based on time (time-based, not interval-based)
    if (gameState.isCasting && gameState.castStartTime) {
        const now = Date.now();
        const elapsed = now - gameState.castStartTime;
        const throwDuration = 800; // milliseconds
        
        if (gameState.castPhase === 'throwing') {
            gameState.bobberThrowProgress = Math.min(elapsed / throwDuration, 1);
            gameState.bobberThrown = true;
            
            if (gameState.bobberThrowProgress >= 1) {
                // Bobber has landed, start sinking phase
                gameState.castPhase = 'sinking';
                gameState.castStartTime = now; // Reset timer for sinking phase
                gameState.lineDepth = 0;
            }
        } else if (gameState.castPhase === 'sinking') {
            const sinkElapsed = now - gameState.castStartTime;
            const sinkSpeed = 2; // pixels per frame equivalent (at 60fps)
            gameState.lineDepth = Math.min(sinkElapsed * sinkSpeed / 16.67, gameState.maxDepth);
            
            if (gameState.lineDepth >= gameState.maxDepth) {
                // Sinking complete, wait for QTE before starting reeling
                gameState.isCasting = false;
                gameState.isReeling = true; // Set flag but don't start timer yet
                gameState.reelStartTime = 0; // Will be set after QTE completes
                gameState.castPhase = 'complete';
                
                // Fish bites after a short delay
                setTimeout(() => {
                    if (typeof generateFish === 'function') {
                        gameState.currentFish = generateFish();
                    }
                    if (typeof startQTE === 'function') {
                        startQTE();
                    }
                }, 500);
            }
        }
    }
    
    // Update reeling animation based on time (pause during QTE)
    if (gameState.isReeling && gameState.reelStartTime && !gameState.qteActive) {
        const now = Date.now();
        const reelElapsed = now - gameState.reelStartTime;
        const reelSpeed = 3; // pixels per frame equivalent (at 60fps)
        // Store initial depth when reeling starts if not already set
        if (!gameState.reelInitialDepth) {
            gameState.reelInitialDepth = gameState.lineDepth || gameState.maxDepth;
        }
        gameState.lineDepth = Math.max(0, gameState.reelInitialDepth - (reelElapsed * reelSpeed / 16.67));
        
        if (gameState.lineDepth <= 0) {
            gameState.reelInitialDepth = null; // Reset
            if (typeof catchFish === 'function') {
                catchFish();
            }
        }
    }
    
    // Draw fishing line - casting forward/right from beach into water (side view)
    if (gameState.isCasting || gameState.isReeling) {
        // Use rod tip position if available (from drawFishingRod), otherwise fallback to character position
        const lineStartX = gameState.rodTipX !== undefined ? gameState.rodTipX : charX + 8;
        const lineStartY = gameState.rodTipY !== undefined ? gameState.rodTipY : charY - 15;
        
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
            // When reeling, bobber moves back towards character position
            const maxCastDistance = canvas.width * 0.4;
            const reelProgress = 1 - (gameState.lineDepth / gameState.maxDepth); // 0 = far, 1 = close
            const farX = lineStartX + maxCastDistance;
            const farY = waterLevel + 10;
            
            // Interpolate between far position and character position
            lineEndX = farX + (lineStartX - farX) * reelProgress;
            lineEndY = farY + (lineStartY - farY) * reelProgress;
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
        
        // Draw pixelated fishing line (8-bit style)
        if (typeof drawFishingLine === 'function') {
            drawFishingLine(lineStartX, lineStartY, lineEndX, lineEndY);
        }
        
        if (PERFORMANCE_PROFILING) {
            performanceStats.fishingLineTime += performance.now() - sectionStart;
            sectionStart = performance.now();
        }
        
        // Draw pixelated bobber (8-bit style)
        if (gameState.bobberThrown || gameState.isReeling || (gameState.isCasting && gameState.bobberThrowProgress >= 1)) {
            if (typeof drawBobber === 'function') {
                drawBobber(lineEndX, lineEndY);
            }
        }
        
        // Draw fish if caught (with struggling animation, following the bobber)
        if (gameState.currentFish && gameState.isReeling) {
            // Fish follows the bobber position (lineEndX, lineEndY)
            // Add struggle animation offset from bobber position
            const fishX = lineEndX + Math.sin(gameState.struggleAnimation) * 12;
            const fishY = lineEndY + Math.cos(gameState.struggleAnimation * 0.7) * 8;
            if (typeof drawFish === 'function') {
                drawFish(fishX, fishY, gameState.currentFish);
            }
            
            // Update struggle animation
            gameState.struggleAnimation += 0.3;
        }
    }
    
    // Draw water ripples (if rain is enabled)
    if (gameState.settings.rainEnabled && typeof drawRipples === 'function') {
        drawRipples();
        
        if (PERFORMANCE_PROFILING) {
            performanceStats.ripplesTime += performance.now() - sectionStart;
            sectionStart = performance.now();
        }
    }
    
    if (PERFORMANCE_PROFILING) {
        const frameTime = performance.now() - frameStart;
        performanceStats.totalTime += frameTime;
        performanceStats.frameCount++;
        
        // Log performance stats every 60 frames (~1 second at 60fps)
        if (performanceStats.frameCount % 60 === 0) {
            const avgFrameTime = performanceStats.totalTime / performanceStats.frameCount;
            const avgFPS = 1000 / avgFrameTime;
            console.log('=== Performance Report ===');
            console.log(`Average FPS: ${avgFPS.toFixed(2)}`);
            console.log(`Average frame time: ${avgFrameTime.toFixed(2)}ms`);
            console.log('Time per section (avg ms per frame):');
            console.log(`  Sky: ${(performanceStats.skyTime / performanceStats.frameCount).toFixed(2)}ms`);
            console.log(`  Rain: ${(performanceStats.rainTime / performanceStats.frameCount).toFixed(2)}ms`);
            console.log(`  Water: ${(performanceStats.waterTime / performanceStats.frameCount).toFixed(2)}ms`);
            console.log(`  Beach: ${(performanceStats.beachTime / performanceStats.frameCount).toFixed(2)}ms`);
            console.log(`  Grass: ${(performanceStats.grassTime / performanceStats.frameCount).toFixed(2)}ms`);
            console.log(`  Character: ${(performanceStats.characterTime / performanceStats.frameCount).toFixed(2)}ms`);
            console.log(`  Fishing Line: ${(performanceStats.fishingLineTime / performanceStats.frameCount).toFixed(2)}ms`);
            console.log(`  Ripples: ${(performanceStats.ripplesTime / performanceStats.frameCount).toFixed(2)}ms`);
            console.log(`  Other: ${(performanceStats.otherTime / performanceStats.frameCount).toFixed(2)}ms`);
            
            // Reset stats
            performanceStats = {
                frameCount: 0,
                totalTime: 0,
                skyTime: 0,
                rainTime: 0,
                waterTime: 0,
                beachTime: 0,
                grassTime: 0,
                characterTime: 0,
                fishingLineTime: 0,
                ripplesTime: 0,
                otherTime: 0
            };
        }
    }
}

// Export functions to global scope
if (typeof window !== 'undefined') {
    window.draw = draw;
    window.resizeCanvas = resizeCanvas;
}

