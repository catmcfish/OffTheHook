// Utility functions

// Color manipulation utilities
// amount is a percentage (0.0 to 1.0) for darkening/lightening
function darkenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount * 255);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount * 255);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

function lightenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount * 255);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount * 255);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

// Export functions to global scope for use in other modules
if (typeof window !== 'undefined') {
    window.darkenColor = darkenColor;
    window.lightenColor = lightenColor;
}

