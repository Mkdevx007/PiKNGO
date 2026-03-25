import React, { useState, useEffect } from 'react';
import { restaurantApi } from '../services/api';
import FoodCard from '../components/FoodCard/FoodCard';
import { MapPin, Navigation, Search, Loader2, LayoutGrid, Map as MapIcon, Compass } from 'lucide-react';
import axios from 'axios';
import MapView from '../components/MapView/MapView';
import './Dashboard.css';

// Skeleton Component defined OUTSIDE the main component to prevent re-mounting issues
const SkeletonCard = () => (
    <div className="food-card glass-card flex-col skeleton-wrapper">
        <div className="skeleton-image"></div>
        <div className="food-details">
            <div className="skeleton-line title"></div>
            <div className="skeleton-line subtitle"></div>
            <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '10px' }}>
                <div className="skeleton-btn"></div>
                <div className="skeleton-btn"></div>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locationStatus, setLocationStatus] = useState('Checking location...');
    const [coords, setCoords] = useState(null);
    const [searchQuery, setSearchQuery] = useState({ source: '', destination: '' });
    const [sourceCoords, setSourceCoords] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [viewMode, setViewMode] = useState('grid');
    const [locationPermission, setLocationPermission] = useState('unknown');

    const [hoveredRestId, setHoveredRestId] = useState(null);

    const defaultRestaurantImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1470&auto=format&fit=crop";

    // Mock filtering logic for demo purposes
    const filteredRestaurants = restaurants.filter(res => {
        if (activeCategory === 'All') return true;
        const name = (res.resturantName || res.restaurantName || '').toLowerCase();
        if (activeCategory === 'Pure Veg' && (name.includes('veg') || name.includes('pure'))) return true;
        if (activeCategory === 'Fast Food' && (name.includes('burger') || name.includes('dhaba') || name.includes('king'))) return true;
        if (activeCategory === 'Fine Dining' && (name.includes('restaurant') || name.includes('hotel'))) return true;
        return name.length % 2 === 0; // Random-ish fallback for others
    });

    const categories = [
        { name: 'All', icon: <LayoutGrid size={18} /> },
        { name: 'Pure Veg', icon: '🥦' },
        { name: 'Fast Food', icon: '🍔' },
        { name: 'Fine Dining', icon: '🍷' },
        { name: 'Beverages', icon: '☕' },
        { name: 'Desserts', icon: '🍰' }
    ];

    const getLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('Geolocation is not supported by your browser');
            fetchAllRestaurants();
            return;
        }

        setLocationStatus('Requesting location access...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ latitude, longitude });
                setLocationStatus('Showing restaurants near you');
                fetchNearbyRestaurants(latitude, longitude);
            },
            (error) => {
                console.error("Location error:", error);
                setLocationStatus('Location access denied. Showing all restaurants.');
                fetchAllRestaurants();
            },
            { timeout: 5000, enableHighAccuracy: true }
        );
    };

    useEffect(() => {
        // Try getting location gently without triggering prompt if not needed
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                setLocationPermission(result.state);
                if (result.state === 'granted') {
                    getLocation(); // Will not prompt, just get
                } else {
                    setLocationStatus('Showing all restaurants.');
                    fetchAllRestaurants();
                }
                // Listen for permission changes
                result.onchange = () => setLocationPermission(result.state);
            });
        } else {
            // Safari fallback
            fetchAllRestaurants();
        }
    }, []);

    const fetchAllRestaurants = async () => {
        setLoading(true);
        try {
            const response = await restaurantApi.getAll();
            setRestaurants(response.data);
            setLocationStatus('Showing all restaurants.');
        } catch (err) {
            console.error("Failed to fetch restaurants", err);
        } finally {
            setLoading(true); // Wait, this should be false, but I want to keep the loading state for a bit? No, false.
            setLoading(false);
        }
    };

    const fetchNearbyRestaurants = async (lat, lon) => {
        setLoading(true);
        try {
            const response = await restaurantApi.getNearby(lat, lon);
            setRestaurants(response.data);
        } catch (err) {
            console.error("Failed to fetch nearby restaurants", err);
            fetchAllRestaurants();
        } finally {
            setLoading(false);
        }
    };

    const getCoords = async (query) => {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            if (response.data && response.data.length > 0) {
                return {
                    lat: parseFloat(response.data[0].lat),
                    lon: parseFloat(response.data[0].lon)
                };
            }
            return null;
        } catch (err) {
            console.error("Geocoding failed", err);
            return null;
        }
    };

    const handleRouteSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.source || !searchQuery.destination) return;

        setLoading(true);
        try {
            const srcCoord = await getCoords(searchQuery.source);
            const destCoord = await getCoords(searchQuery.destination);

            if (!srcCoord || !destCoord) {
                setLocationStatus("Could not find locations. Please try again.");
                setLoading(false);
                return;
            }
            
            const response = await restaurantApi.searchByRoute(
                srcCoord.lat, srcCoord.lon, 
                destCoord.lat, destCoord.lon
            );
            console.log("Search Results:", response.data);
            setRestaurants(response.data);
            setSourceCoords(srcCoord);
            setDestinationCoords(destCoord);
            setLocationStatus(`Showing restaurants between ${searchQuery.source} and ${searchQuery.destination}`);
            setViewMode('map'); // Automatically switch to map view on search
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoading(false);
        }
    };

    const userName = localStorage.getItem('name');
    const userPhone = localStorage.getItem('phone');
    const userDisplay = userName || userPhone || 'Guest Traveller';
    // Get first letter of name if available, otherwise first letter of Display string
    const userInitial = (userName ? userName.charAt(0) : userDisplay.charAt(0)).toUpperCase();

    return (
        <div className="dashboard-page auth-page-global-bg">
            <div className="bg-mesh"></div>
            <div className="bg-vignette"></div>
            
            <div className="dashboard-layout container animate-fade-in">
                <main className="dashboard-main-full">
                    {/* Search and Filters Strip */}
                    <div className="search-filter-strip">
                        <form className="route-search-bar glass-floating horizontal-search" onSubmit={handleRouteSearch}>
                            <div className="search-input">
                                <div className="input-glow"></div>
                                <div className="input-group">
                                    <label>Source</label>
                                    <input 
                                        type="text" 
                                        placeholder="My Location - 123 Main St" 
                                        value={searchQuery.source}
                                        onChange={(e) => setSearchQuery({ ...searchQuery, source: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="divider-icon"><Navigation size={18} /></div>
                            <div className="search-input">
                                <div className="input-glow"></div>
                                <div className="input-group">
                                    <label>Destination</label>
                                    <input 
                                        type="text" 
                                        placeholder="Downtown - City Center" 
                                        value={searchQuery.destination}
                                        onChange={(e) => setSearchQuery({ ...searchQuery, destination: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="search-btn-premium">
                                <Search size={22} />
                                <span>Search</span>
                            </button>
                        </form>

                        <div className="filter-dropdowns">
                            <div className="flex justify-between items-center mb-2">
                                <h3>Filters</h3>
                                {locationPermission !== 'granted' && (
                                    <button 
                                        className="location-prompt-banner glass" 
                                        onClick={getLocation}
                                        style={{ 
                                            padding: '4px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '0.8rem',
                                            background: 'rgba(255, 126, 0, 0.1)',
                                            border: '1px solid var(--accent-orange)',
                                            color: 'var(--accent-orange)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <MapPin size={14} /> 
                                        {locationPermission === 'denied' ? 'Location Denied - Click to retry' : 'Enable Location for Nearby results'}
                                    </button>
                                )}
                            </div>
                            <div className="dropdowns-container">
                                <button 
                                    type="button" 
                                    className={`filter-select glass ${coords ? 'active-filter' : ''}`} 
                                    onClick={getLocation} 
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '6px', 
                                        color: coords ? 'white' : 'var(--accent-orange)', 
                                        borderColor: 'var(--accent-orange)',
                                        background: coords ? 'var(--accent-orange)' : 'transparent'
                                    }}
                                >
                                    <MapPin size={14} /> {coords ? 'Near Me Active' : 'Near Me'}
                                </button>
                                <select className="filter-select glass"><option>Cuisine</option></select>
                                <select className="filter-select glass"><option>Price</option></select>
                                <select className="filter-select glass"><option>Rating</option></select>
                            </div>
                        </div>
                    </div>



            <div className="dashboard-content-split">
                <div className="restaurant-grid-container">
                    <div className="restaurant-grid">
                        {loading ? (
                            // Render 6 Skeletons while loading
                            Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)
                        ) : filteredRestaurants.length > 0 ? (
                            filteredRestaurants.map((res, index) => (
                                <FoodCard 
                                    key={res._id || res.id} 
                                    id={res._id || res.id}
                                    name={res.resturantName || res.restaurantName} 
                                    restaurant={res.resturantName || res.restaurantName} 
                                    address={res.address}
                                    price="$$" 
                                    rating={4.5} 
                                    image={res.imageUrl || defaultRestaurantImage}
                                    distance={res.distance}
                                    onHover={(id) => setHoveredRestId(id)}
                                    onLeave={() => setHoveredRestId(null)}
                                />
                            ))
                        ) : (
                            <div className="empty-state glass">
                                <h3>No restaurants found in this area</h3>
                                <p>Try searching for a different route or expanding your search radius.</p>
                                <button className="btn-secondary" onClick={fetchAllRestaurants}>Show All Restaurants</button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="map-container-side">
                    {/* Always show map, even while loading */}
                    <MapView 
                        restaurants={restaurants} 
                        sourceCoords={sourceCoords} 
                        destinationCoords={destinationCoords} 
                        hoveredRestId={hoveredRestId}
                    />
                </div>
            </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;

