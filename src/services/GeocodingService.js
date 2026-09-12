// GeocodingService.js - handles Nominatim API calls

class GeocodingService {
    static async search(query) {
        if (!query || query.trim() === '') return [];
        
        try {
            // Using OpenStreetMap Nominatim API
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            return data.map(item => ({
                name: item.display_name.split(',')[0],
                fullName: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon)
            }));
        } catch (error) {
            console.error('Geocoding error:', error);
            throw new Error('Failed to search location.');
        }
    }
}
