// math.js - utility functions for GPS calculations

// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}

// Converts radians to numeric degrees
function toDeg(Value) {
    return Value * 180 / Math.PI;
}

/**
 * Calculates the great-circle distance between two points on Earth using Haversine formula
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1Rad) * Math.cos(lat2Rad); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c;
    
    return d;
}

/**
 * Calculates the initial bearing from point 1 to point 2
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} bearing in degrees from true north
 */
function calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = toRad(lon2 - lon1);
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    
    let brng = toDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
}

/**
 * Converts bearing in degrees to a compass direction string
 * @param {number} bearing 
 * @returns {string} compass direction (e.g., "↗ Northeast")
 */
function getCompassDirection(bearing) {
    const directions = [
        { label: "↑ North", min: 337.5, max: 360 },
        { label: "↑ North", min: 0, max: 22.5 },
        { label: "↗ Northeast", min: 22.5, max: 67.5 },
        { label: "→ East", min: 67.5, max: 112.5 },
        { label: "↘ Southeast", min: 112.5, max: 157.5 },
        { label: "↓ South", min: 157.5, max: 202.5 },
        { label: "↙ Southwest", min: 202.5, max: 247.5 },
        { label: "← West", min: 247.5, max: 292.5 },
        { label: "↖ Northwest", min: 292.5, max: 337.5 }
    ];

    for (const dir of directions) {
        if (bearing >= dir.min && bearing < dir.max) {
            return dir.label;
        }
    }
    return "↑ North";
}

/**
 * Estimates travel time assuming a hilarious straight line speed (e.g., walking through walls at 5 km/h)
 * @param {number} distanceKm 
 * @returns {number} time in minutes
 */
function estimateTime(distanceKm) {
    const speedKmh = 5; // average walking speed, but straight through obstacles
    return Math.round((distanceKm / speedKmh) * 60);
}
