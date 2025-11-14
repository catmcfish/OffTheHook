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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getTimeOfDay, getTimeOfDayInfo, SYNCHRONOUS_EVENTS, getCurrentEvent };
}

// Export to global scope for browser
if (typeof window !== 'undefined') {
    window.getTimeOfDay = getTimeOfDay;
    window.getTimeOfDayInfo = getTimeOfDayInfo;
    window.getCurrentEvent = getCurrentEvent;
}

