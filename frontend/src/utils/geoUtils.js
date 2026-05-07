export const CITY_COORDS = {
    'delhi': { lat: 28.6139, lon: 77.2090 },
    'mumbai': { lat: 19.0760, lon: 72.8777 },
    'pune': { lat: 18.5204, lon: 73.8567 },
    'bangalore': { lat: 12.9716, lon: 77.5946 },
    'hyderabad': { lat: 17.3850, lon: 78.4867 },
    'chennai': { lat: 13.0827, lon: 80.2707 },
    'kolkata': { lat: 22.5726, lon: 88.3639 },
    'jaipur': { lat: 26.9124, lon: 75.7873 },
    'ahmedabad': { lat: 23.0225, lon: 72.5714 },
    'lucknow': { lat: 26.8467, lon: 80.9462 },
    'chandigarh': { lat: 30.7333, lon: 76.7794 },
    'indore': { lat: 22.7196, lon: 75.8577 },
};

import axios from 'axios';

export const getCoordsForCity = (cityName) => {
    const city = cityName.toLowerCase().trim();
    return CITY_COORDS[city] || CITY_COORDS['delhi']; // Default to Delhi for demo
};

export const reverseGeocode = async (lat, lon) => {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
        const data = response.data;
        // Try to get a clean city/town/village name
        return data.address.city || data.address.town || data.address.village || data.address.county || data.display_name.split(',')[0];
    } catch (err) {
        console.error("Reverse geocoding failed", err);
        return "Unknown Hub";
    }
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};
