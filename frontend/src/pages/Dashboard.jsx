import React, { useState, useEffect } from 'react';
import { restaurantApi } from '../services/api';
import FoodCard from '../components/FoodCard/FoodCard';
import MapView from '../components/MapView/MapView';
import { MapPin, Navigation, Search, LayoutGrid, Compass, SearchX } from 'lucide-react';
import axios from 'axios';
import { CardSkeleton } from '../components/Common/Skeleton';
import './Dashboard.css';

const Dashboard = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locationStatus, setLocationStatus] = useState('Checking location...');
    const [coords, setCoords] = useState(null);
    const [searchQuery, setSearchQuery] = useState({ source: '', destination: '' });
    const [activeCategory, setActiveCategory] = useState('All');
    const [locationPermission, setLocationPermission] = useState('unknown');
    const [nameSearch, setNameSearch] = useState('');
    const [hoveredRestId, setHoveredRestId] = useState(null);
    const [routeFallbackWarning, setRouteFallbackWarning] = useState(false);
    const [routeSourceCoords, setRouteSourceCoords] = useState(null);
    const [routeDestCoords, setRouteDestCoords] = useState(null);

    const fallbackImages = [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1470&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1470&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?q=80&w=1516&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1470&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1374&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1374&auto=format&fit=crop"
    ];

    const filteredRestaurants = restaurants.filter(res => {
        const matchesCategory = activeCategory === 'All' || (res.category || '').toLowerCase() === activeCategory.toLowerCase();
        return matchesCategory;
    });

    const handleToggleLocation = () => {
        if (coords) {
            setCoords(null);
            setLocationStatus('Showing all restaurants.');
            fetchAllRestaurants();
        } else {
            getLocation();
        }
    };

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
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                setLocationPermission(result.state);
                if (result.state === 'granted') {
                    getLocation();
                } else {
                    setLocationStatus('Showing all restaurants.');
                    fetchAllRestaurants();
                }
                result.onchange = () => setLocationPermission(result.state);
            });
        } else {
            fetchAllRestaurants();
        }
    }, []);

    const fetchAllRestaurants = async () => {
        setLoading(true);
        try {
            const response = await restaurantApi.getAll();
            const arr = Array.isArray(response) ? response : (response?.content || []);
            const normalized = arr.map(r => ({
                ...r,
                isActive: r.isActive !== undefined ? r.isActive : r.active
            }));
            setRestaurants(normalized);
        } catch (err) {
            console.error("Failed to fetch restaurants", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchNearbyRestaurants = async (lat, lon) => {
        setLoading(true);
        try {
            // Using 10000km radius to ensure dummy restaurants (New Delhi) are found anywhere from user's true location
            const response = await restaurantApi.getNearby(lat, lon, 10000);
            const arr = Array.isArray(response) ? response : (response?.content || []);
            const normalized = arr.map(r => ({
                ...r,
                isActive: r.isActive !== undefined ? r.isActive : r.active
            }));
            setRestaurants(normalized);
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
            const data = response.data;
            if (data && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            }
            return null;
        } catch (err) {
            console.error("Geocoding failed", err);
            return null;
        }
    };

    const handleRouteSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.source || !searchQuery.destination) return;

        setLoading(true);
        try {
            const srcCoord = await getCoords(searchQuery.source);
            const destCoord = await getCoords(searchQuery.destination);

            if (!srcCoord || !destCoord) {
                setLocationStatus("Could not find locations.");
                setLoading(false);
                return;
            }
            
            // Set the route coordinates so the MapView can draw the road map
            setRouteSourceCoords(srcCoord);
            setRouteDestCoords(destCoord);
            
            const response = await restaurantApi.searchByRoute(
                srcCoord.lat, srcCoord.lon, 
                destCoord.lat, destCoord.lon
            );
            const arr = Array.isArray(response) ? response : (response?.content || []);
            const normalized = arr.map(r => ({
                ...r,
                isActive: r.isActive !== undefined ? r.isActive : r.active
            }));
            if (normalized.length > 0) {
                setRestaurants(normalized);
                setRouteFallbackWarning(false);
            } else {
                // Professional Fallback
                const fallbackResponse = await restaurantApi.getAll();
                const fallbackArr = Array.isArray(fallbackResponse) ? fallbackResponse : (fallbackResponse?.content || []);
                const fallbackNormalized = fallbackArr.map(r => ({
                    ...r,
                    isActive: r.isActive !== undefined ? r.isActive : r.active
                }));
                setRestaurants(fallbackNormalized);
                setRouteFallbackWarning(true);
            }
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page auth-page-global-bg">
            <div className="bg-mesh"></div>
            
            <div className="dashboard-layout-elite animate-fade-in">
                <main className="dashboard-container">
                    {/* Centered Search Row */}
                    <div className="search-row-pro">
                        <form className="route-search-bar-unified glass-modern" onSubmit={handleRouteSearch}>
                            <div className="search-field">
                                <MapPin className="search-field-icon source" size={20} />
                                <div className="search-field-content">
                                    <label>SOURCE</label>
                                    <input 
                                        type="text" 
                                        placeholder="Starting location..." 
                                        value={searchQuery.source}
                                        onChange={(e) => setSearchQuery({ ...searchQuery, source: e.target.value })}
                                    />
                                </div>
                            </div>
                            
                            <div className="search-divider">
                                <div className="divider-line"></div>
                            </div>

                            <div className="search-field">
                                <MapPin className="search-field-icon destination" size={20} />
                                <div className="search-field-content">
                                    <label>DESTINATION</label>
                                    <input 
                                        type="text" 
                                        placeholder="Where are you going?" 
                                        value={searchQuery.destination}
                                        onChange={(e) => setSearchQuery({ ...searchQuery, destination: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="search-submit-btn-pro">
                                <Search size={20} />
                                <span>Find Route</span>
                            </button>
                        </form>
                    </div>

                    {/* Elite Filter Bar */}
                    <div className="filter-bar-elite">
                        <button 
                            className={`filter-pill-status ${coords ? 'active' : ''}`}
                            onClick={handleToggleLocation}
                        >
                            <MapPin size={14} className={coords ? 'text-orange-glow' : ''} />
                            <span>{coords ? 'Near Me Active' : 'Near Me'}</span>
                            {coords && <div className="status-indicator"></div>}
                        </button>

                        <div className="v-divider"></div>

                        <div className="dropdown-filter-group">
                            <select className="elite-dropdown" value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}>
                                <option value="All">Cuisine</option>
                                <option value="Indian">Indian</option>
                                <option value="Fast Food">Fast Food</option>
                            </select>

                            <select className="elite-dropdown">
                                <option value="">Price</option>
                                <option value="low">Budget</option>
                                <option value="mid">Premium</option>
                            </select>

                            <select className="elite-dropdown">
                                <option value="">Rating</option>
                                <option value="4">4.0+</option>
                                <option value="4.5">4.5+</option>
                            </select>
                        </div>
                    </div>

                    {/* Split View Container */}
                    <div className="dashboard-split-view">
                        <div className="restaurant-grid-container scroll-pro">
                            {routeFallbackWarning && !loading && (
                                <div className="glass-modern" style={{margin: '0 0 1rem 0', padding: '1rem 1.5rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#fcd34d'}}>
                                    <MapPin size={20} />
                                    <div>
                                        <strong>No restaurants found exactly on this route.</strong> 
                                        <span style={{opacity: 0.8, marginLeft: '5px', fontSize: '0.9rem'}}>Showing top recommended restaurants instead.</span>
                                    </div>
                                </div>
                            )}
                            <div className="restaurant-grid-elite">
                                {loading ? (
                                    Array.from({ length: 4 }).map((_, idx) => <CardSkeleton key={idx} />)
                                ) : filteredRestaurants.length > 0 ? (
                                    filteredRestaurants.map((res, index) => (
                                        <FoodCard 
                                            key={res._id || res.id} 
                                            id={res._id || res.id}
                                            name={res.restaurantName} 
                                            restaurant={res.restaurantName} 
                                            address={res.address}
                                            rating={res.rating || 4.2} 
                                            image={res.imageUrl || fallbackImages[index % fallbackImages.length]}
                                            distance={res.distance}
                                            isActive={res.isActive !== false}
                                            onHover={(id) => setHoveredRestId(id)}
                                            onLeave={() => setHoveredRestId(null)}
                                        />
                                    ))
                                ) : (
                                    <div className="empty-state-card glass-modern animate-fade-in">
                                        <div className="empty-state-icon-wrapper">
                                            <SearchX size={54} strokeWidth={1.5} />
                                            <div className="icon-pulse"></div>
                                        </div>
                                        <h3>No Restaurants Found</h3>
                                        <p>We couldn't find any results matching your current filters or route.</p>
                                        <button 
                                            className="btn-primary-slim mt-4" 
                                            onClick={() => {
                                                setCoords(null);
                                                setRouteSourceCoords(null);
                                                setRouteDestCoords(null);
                                                setRouteFallbackWarning(false);
                                                setActiveCategory('All');
                                                fetchAllRestaurants();
                                            }}
                                        >
                                            Reset All Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="map-view-container-pro">
                            <MapView 
                                restaurants={restaurants} 
                                sourceCoords={routeSourceCoords} 
                                destinationCoords={routeDestCoords} 
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
