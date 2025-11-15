// Time of day and event system

// Time of day system
function getTimeOfDay() {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 5 && hour < 9) {
        return 'morning';
    } else if (hour >= 9 && hour < 13) {
        return 'noon';
    } else if (hour >= 13 && hour < 18) {
        return 'afternoon';
    } else {
        return 'night';
    }
}

function getTimeOfDayInfo() {
    const now = new Date();
    const timeOfDay = getTimeOfDay();
    return {
        phase: timeOfDay,
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
        timeString: now.toLocaleTimeString(),
        dateString: now.toLocaleDateString()
    };
}

// Synchronous events system
const SYNCHRONOUS_EVENTS = {
    morning: {
        name: 'Dawn Fishing',
        description: 'Special fish appear during morning hours!',
        specialFish: ['Glowfin', 'Crystal Scale'],
        multiplier: 1.2
    },
    noon: {
        name: 'Midday Bounty',
        description: 'Increased chance of rare fish!',
        specialFish: ['Fire Gills', 'Thunder Trout'],
        multiplier: 1.5
    },
    afternoon: {
        name: 'Afternoon Delight',
        description: 'Epic fish are more common!',
        specialFish: ['Dragon Fin', 'Celestial Bass'],
        multiplier: 1.3
    },
    night: {
        name: 'Midnight Mystery',
        description: 'Legendary fish emerge from the depths!',
        specialFish: ['Shadow Serpent', 'Void Eel', 'Phantom Pike'],
        multiplier: 2.0
    }
};

function getCurrentEvent() {
    const timeOfDay = getTimeOfDay();
    return SYNCHRONOUS_EVENTS[timeOfDay] || null;
}

// Sun/Moon position calculation
// Sunrise at 8am (hour 8), Sunset at 10pm (hour 22)
// Day length: 14 hours (8am to 10pm)
function getSunMoonPosition(canvasWidth, canvasHeight) {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const totalMinutes = hour * 60 + minute;
    
    // Convert to 24-hour cycle
    // Sunrise: 8am = 480 minutes
    // Sunset: 10pm = 1320 minutes
    const sunriseMinutes = 8 * 60; // 8am
    const sunsetMinutes = 22 * 60; // 10pm
    const dayLength = sunsetMinutes - sunriseMinutes; // 14 hours = 840 minutes
    
    let sunProgress, moonProgress;
    let isDaytime = false;
    
    if (totalMinutes >= sunriseMinutes && totalMinutes < sunsetMinutes) {
        // Daytime: sun is visible
        isDaytime = true;
        sunProgress = (totalMinutes - sunriseMinutes) / dayLength; // 0 to 1
        moonProgress = null; // Moon not visible during day
    } else {
        // Nighttime: moon is visible
        isDaytime = false;
        sunProgress = null; // Sun not visible during night
        
        // Calculate moon progress (0 to 1 over night period)
        if (totalMinutes < sunriseMinutes) {
            // Before sunrise (late night/early morning)
            const nightBeforeSunrise = 24 * 60 - sunsetMinutes + totalMinutes;
            const totalNightLength = 24 * 60 - dayLength;
            moonProgress = nightBeforeSunrise / totalNightLength;
        } else {
            // After sunset (evening/night)
            const nightAfterSunset = totalMinutes - sunsetMinutes;
            const totalNightLength = 24 * 60 - dayLength;
            moonProgress = nightAfterSunset / totalNightLength;
        }
    }
    
    // Calculate positions
    // Sun/Moon moves from left (sunrise) to right (sunset) across the sky
    // Y position varies: starts low (horizon), peaks at noon, ends low (horizon)
    let x, y;
    
    if (isDaytime && sunProgress !== null) {
        // Sun position: arc across sky
        x = canvasWidth * (0.1 + sunProgress * 0.8); // Moves from 10% to 90% of width
        // Arc height: low at sunrise/sunset, high at noon
        const arcHeight = Math.sin(sunProgress * Math.PI); // 0 at edges, 1 at center
        y = canvasHeight * 0.6 - (arcHeight * canvasHeight * 0.4); // Moves from horizon to higher in sky
    } else if (!isDaytime && moonProgress !== null) {
        // Moon position: similar arc but inverted (moon rises in evening)
        x = canvasWidth * (0.1 + moonProgress * 0.8);
        const arcHeight = Math.sin(moonProgress * Math.PI);
        y = canvasHeight * 0.6 - (arcHeight * canvasHeight * 0.35); // Slightly lower than sun
    } else {
        x = 0;
        y = 0;
    }
    
    return {
        isDaytime,
        sunX: isDaytime ? x : null,
        sunY: isDaytime ? y : null,
        moonX: !isDaytime ? x : null,
        moonY: !isDaytime ? y : null,
        sunProgress,
        moonProgress
    };
}

// Calculate gradual sky colors based on exact time
function getSkyColors() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const totalMinutes = hour * 60 + minute;
    
    const sunriseMinutes = 8 * 60; // 8am
    const sunsetMinutes = 22 * 60; // 10pm
    const dayLength = sunsetMinutes - sunriseMinutes;
    
    let topColor, bottomColor;
    
    if (totalMinutes >= sunriseMinutes && totalMinutes < sunsetMinutes) {
        // Daytime - gradual transition
        const dayProgress = (totalMinutes - sunriseMinutes) / dayLength;
        
        // Sunrise (0-0.1): orange-pink to light orange
        // Morning (0.1-0.3): light orange to sky blue
        // Noon (0.3-0.7): sky blue
        // Afternoon (0.7-0.9): sky blue to orange
        // Sunset (0.9-1.0): orange to deep orange-red
        
        if (dayProgress < 0.1) {
            // Sunrise transition
            const t = dayProgress / 0.1;
            topColor = interpolateColor('#ff6b35', '#ff9a56', t); // Deep orange to orange-pink
            bottomColor = interpolateColor('#ff6b35', '#ffd89b', t); // Deep orange to light orange
        } else if (dayProgress < 0.3) {
            // Morning transition
            const t = (dayProgress - 0.1) / 0.2;
            topColor = interpolateColor('#ff9a56', '#87ceeb', t); // Orange-pink to sky blue
            bottomColor = interpolateColor('#ffd89b', '#e0f6ff', t); // Light orange to light blue
        } else if (dayProgress < 0.7) {
            // Noon - sky blue
            topColor = '#87ceeb';
            bottomColor = '#e0f6ff';
        } else if (dayProgress < 0.9) {
            // Afternoon transition
            const t = (dayProgress - 0.7) / 0.2;
            topColor = interpolateColor('#87ceeb', '#ffa500', t); // Sky blue to orange
            bottomColor = interpolateColor('#e0f6ff', '#ffd700', t); // Light blue to gold
        } else {
            // Sunset transition
            const t = (dayProgress - 0.9) / 0.1;
            topColor = interpolateColor('#ffa500', '#ff6b35', t); // Orange to deep orange-red
            bottomColor = interpolateColor('#ffd700', '#ff8c42', t); // Gold to orange
        }
    } else {
        // Nighttime - gradual transition
        let nightProgress;
        if (totalMinutes < sunriseMinutes) {
            // Before sunrise (late night/early morning)
            const nightBeforeSunrise = 24 * 60 - sunsetMinutes + totalMinutes;
            const totalNightLength = 24 * 60 - dayLength;
            nightProgress = nightBeforeSunrise / totalNightLength;
        } else {
            // After sunset (evening/night)
            const nightAfterSunset = totalMinutes - sunsetMinutes;
            const totalNightLength = 24 * 60 - dayLength;
            nightProgress = nightAfterSunset / totalNightLength;
        }
        
        // Sunset to night (0-0.2): orange-red to dark blue
        // Night (0.2-0.8): dark blue
        // Night to sunrise (0.8-1.0): dark blue to orange-red
        
        if (nightProgress < 0.2) {
            // Sunset to night transition
            const t = nightProgress / 0.2;
            topColor = interpolateColor('#ff6b35', '#191970', t); // Deep orange-red to midnight blue
            bottomColor = interpolateColor('#ff8c42', '#000033', t); // Orange to very dark blue
        } else if (nightProgress < 0.8) {
            // Night - dark blue
            topColor = '#191970';
            bottomColor = '#000033';
        } else {
            // Night to sunrise transition
            const t = (nightProgress - 0.8) / 0.2;
            topColor = interpolateColor('#191970', '#ff6b35', t); // Midnight blue to deep orange-red
            bottomColor = interpolateColor('#000033', '#ff8c42', t); // Very dark blue to orange
        }
    }
    
    return { topColor, bottomColor };
}

// Helper function to interpolate between two hex colors
function interpolateColor(color1, color2, t) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return color1;
    
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);
    
    return `rgb(${r}, ${g}, ${b})`;
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        getTimeOfDay, 
        getTimeOfDayInfo, 
        SYNCHRONOUS_EVENTS, 
        getCurrentEvent,
        getSunMoonPosition,
        getSkyColors,
        interpolateColor,
        hexToRgb
    };
}

// Export to global scope for browser
if (typeof window !== 'undefined') {
    window.getTimeOfDay = getTimeOfDay;
    window.getTimeOfDayInfo = getTimeOfDayInfo;
    window.getCurrentEvent = getCurrentEvent;
    window.getSunMoonPosition = getSunMoonPosition;
    window.getSkyColors = getSkyColors;
    window.interpolateColor = interpolateColor;
    window.hexToRgb = hexToRgb;
}

