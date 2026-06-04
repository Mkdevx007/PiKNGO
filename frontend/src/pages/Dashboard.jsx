import React, { useState, useEffect } from 'react';
import { aiApi, restaurantApi } from '../services/api';
import FoodCard from '../components/FoodCard/FoodCard';
import MapView from '../components/MapView/MapView';
import { MapPin, Navigation, Search, LayoutGrid, Compass, SearchX, Star, Brain, Sparkles, Zap } from 'lucide-react';
import axios from 'axios';
import { CardSkeleton } from '../components/Common/Skeleton';
import { useCart } from '../context/CartContext';
import { CITY_COORDS, reverseGeocode, calculateDistance } from '../utils/geoUtils';
import FlashDealOverlay from '../components/FlashDeal/FlashDealOverlay';
import DriveModeOverlay from '../components/DriveMode/DriveModeOverlay';
import { Mic, MicOff, Zap as ZapIcon } from 'lucide-react';
import useWakeWord from '../hooks/useWakeWord';
import './Dashboard.css';

const Dashboard = () => {
    const { addToCart } = useCart();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locationStatus, setLocationStatus] = useState('Checking location...');
    const [coords, setCoords] = useState(null);
    const [searchQuery, setSearchQuery] = useState({ source: '', destination: '' });
    const [activeCategory, setActiveCategory] = useState('All');
    const [locationPermission, setLocationPermission] = useState('unknown');
    const [nameSearch, setNameSearch] = useState('');
    const [hoveredRestId, setHoveredRestId] = useState(null);
    const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
    const [showDestSuggestions, setShowDestSuggestions] = useState(false);
    const [mobileView, setMobileView] = useState('list'); // 'list' or 'map'
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulatedLocation, setSimulatedLocation] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [recsLoading, setRecsLoading] = useState(false);
    const [activeFlashDeal, setActiveFlashDeal] = useState(null);
    const [shownFlashDeals, setShownFlashDeals] = useState(new Set());
    const [showDriveMode, setShowDriveMode] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
        return localStorage.getItem('wakeWordEnabled') === 'true';
    });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Keyboard shortcut: Ctrl+M to toggle Drive Mode
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
                e.preventDefault();
                setShowDriveMode(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Voice wake word: say "Drive Mode" or "Hey PikNGo" to activate
    useWakeWord({
        onWake: () => setShowDriveMode(true),
        isActive: showDriveMode,
        enabled: isVoiceEnabled,
    });

    const cities = Object.keys(CITY_COORDS).map(city => city.charAt(0).toUpperCase() + city.slice(1));

    const filteredSourceCities = cities.filter(city => 
        city.toLowerCase().includes(searchQuery.source.toLowerCase()) && city.toLowerCase() !== searchQuery.source.toLowerCase()
    );

    const filteredDestCities = cities.filter(city => 
        city.toLowerCase().includes(searchQuery.destination.toLowerCase()) && city.toLowerCase() !== searchQuery.destination.toLowerCase()
    );
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
            { 
                timeout: 3000, 
                enableHighAccuracy: false, // Instant resolution via IP/Cell Towers rather than slow hardware GPS
                maximumAge: 60000          // Use cached location from last 60s for immediate response
            }
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
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        setRecsLoading(true);
        try {
            const res = await aiApi.getRecommendations();
            setRecommendations(Array.isArray(res) ? res : []);
        } catch (err) {
            console.error("Failed to fetch AI recommendations", err);
        } finally {
            setRecsLoading(false);
        }
    };

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
        if (!query) return null;
        const normalizedQuery = query.toLowerCase().trim();
        
        // Instant memory cache lookup for popular cities
        if (CITY_COORDS[normalizedQuery]) {
            console.log(`[PikNGo Cache] Instant resolution for: ${normalizedQuery}`);
            return { 
                lat: CITY_COORDS[normalizedQuery].lat, 
                lon: CITY_COORDS[normalizedQuery].lon 
            };
        }

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
            // Run Origin and Destination lookups in parallel (cuts Nominatim network wait time in half!)
            const [srcCoord, destCoord] = await Promise.all([
                getCoords(searchQuery.source),
                getCoords(searchQuery.destination)
            ]);

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

    const handleMapClick = async (lat, lon) => {
        if (!searchQuery.source) {
            setLocationStatus("Identifying Origin...");
            const name = await reverseGeocode(lat, lon);
            setSearchQuery(prev => ({ ...prev, source: name }));
            setRouteSourceCoords({ lat, lon });
            setLocationStatus(`Origin set to ${name}`);
        } else if (!searchQuery.destination) {
            setLocationStatus("Identifying Destination...");
            const name = await reverseGeocode(lat, lon);
            setSearchQuery(prev => ({ ...prev, destination: name }));
            setRouteDestCoords({ lat, lon });
            setLocationStatus(`Destination set to ${name}`);
            // Auto search after setting both coords
            setTimeout(() => handleRouteSearch(), 500);
        } else {
            // Reset and start over
            const name = await reverseGeocode(lat, lon);
            setSearchQuery({ source: name, destination: '' });
            setRouteSourceCoords({ lat, lon });
            setRouteDestCoords(null);
            setRouteFallbackWarning(false);
            setLocationStatus(`Origin reset to ${name}`);
        }
    };

    const handleSimulationToggle = () => {
        if (!routeSourceCoords || !routeDestCoords) return;
        setIsSimulating(!isSimulating);
        if (!isSimulating) {
            setSimulatedLocation(routeSourceCoords);
            setLocationStatus("Simulation active: Tracking route...");
        } else {
            setLocationStatus("Simulation terminated.");
        }
    };

    // Geofencing Check for Flash Deals
    useEffect(() => {
        if (!coords && !simulatedLocation) return;
        if (activeFlashDeal) return;

        const currentPos = simulatedLocation || coords;
        const lat = currentPos.latitude || currentPos.lat;
        const lon = currentPos.longitude || currentPos.lon;

        const nearbyFlashRest = restaurants.find(res => {
            if (shownFlashDeals.has(res.id)) return false;
            const dist = calculateDistance(lat, lon, res.latitude, res.longitude);
            return dist !== null && dist <= 2.0; // 2km threshold
        });

        if (nearbyFlashRest) {
            setActiveFlashDeal(nearbyFlashRest);
            setShownFlashDeals(prev => new Set([...prev, nearbyFlashRest.id]));
        }
    }, [coords, simulatedLocation, restaurants, activeFlashDeal, shownFlashDeals]);

    return (
        <div className="dashboard-page auth-page-global-bg">
            <div className="bg-mesh"></div>
            
            <div className="dashboard-layout-elite animate-fade-in">
                <main className="dashboard-container">
                    {/* Elite Navigation Terminal */}
                    <div className="search-row-pro">
                        <div className="nav-terminal-frame">
                            <form className="route-search-bar-unified glass-modern" onSubmit={handleRouteSearch}>
                                <div className="search-field">
                                    <MapPin className="search-field-icon source" size={18} />
                                    <div className="search-field-content">
                                        <label>ORIGIN</label>
                                            <input 
                                                type="text" 
                                                placeholder="Detecting starting hub..." 
                                                value={searchQuery.source}
                                                onChange={(e) => { setSearchQuery({ ...searchQuery, source: e.target.value }); setShowSourceSuggestions(true); }}
                                                onFocus={() => setShowSourceSuggestions(true)}
                                                onBlur={() => setTimeout(() => setShowSourceSuggestions(false), 200)}
                                            />
                                            {showSourceSuggestions && filteredSourceCities.length > 0 && (
                                                <div className="terminal-autocomplete glass-modern">
                                                    <div className="autocomplete-header">POPULAR HUBS</div>
                                                    {filteredSourceCities.map(city => (
                                                        <div key={city} className="terminal-suggestion" onMouseDown={() => { setSearchQuery({ ...searchQuery, source: city }); setShowSourceSuggestions(false); }}>
                                                            <MapPin size={12} className="source-icon" /> <span>{city}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="terminal-divider">
                                        <Navigation size={14} className="terminal-pulse" />
                                    </div>

                                    <div className="search-field">
                                        <MapPin className="search-field-icon destination" size={18} />
                                        <div className="search-field-content">
                                            <label>DESTINATION</label>
                                            <input 
                                                type="text" 
                                                placeholder="Awaiting target coordinates..." 
                                                value={searchQuery.destination}
                                                onChange={(e) => { setSearchQuery({ ...searchQuery, destination: e.target.value }); setShowDestSuggestions(true); }}
                                                onFocus={() => setShowDestSuggestions(true)}
                                                onBlur={() => setTimeout(() => setShowDestSuggestions(false), 200)}
                                            />
                                            {showDestSuggestions && filteredDestCities.length > 0 && (
                                                <div className="terminal-autocomplete glass-modern">
                                                    <div className="autocomplete-header">TARGET COORDINATES</div>
                                                    {filteredDestCities.map(city => (
                                                        <div key={city} className="terminal-suggestion" onMouseDown={() => { setSearchQuery({ ...searchQuery, destination: city }); setShowDestSuggestions(false); }}>
                                                            <Navigation size={12} className="dest-icon" /> <span>{city}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                <button type="submit" className="terminal-submit-btn">
                                    <Search size={18} />
                                    <span>Sync Route</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Elite Capsule Filters */}
                    <div className="filter-shelf-elite">
                        <button 
                            className={`location-hub-pill ${coords ? 'active' : ''}`}
                            onClick={handleToggleLocation}
                        >
                            <Compass size={16} className={coords ? 'animate-spin-slow' : ''} />
                            <span>{coords ? 'Hyper-Local Active' : 'Scan Nearby'}</span>
                            {coords && <div className="hub-pulse-dot"></div>}
                        </button>

                        <div className="technical-divider-vertical"></div>

                        <div className="filter-capsule-group">
                            {['All', 'Indian', 'Fast Food'].map(cat => (
                                <button 
                                    key={cat}
                                    className={`filter-capsule ${activeCategory === cat ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat === 'All' ? 'Cuisine' : cat}
                                </button>
                            ))}
                            
                            <div className="filter-capsule-secondary">
                                <span className="capsule-label">Price Range</span>
                                <div className="capsule-options">
                                    <button className="option-btn">Budget</button>
                                    <button className="option-btn">Premium</button>
                                </div>
                            </div>

                            <button className="filter-capsule top-rated">
                                <Star size={14} fill="currentColor" />
                                <span>Top Rated</span>
                            </button>

                            {routeSourceCoords && routeDestCoords && (
                                <button 
                                    className={`filter-capsule simulation-toggle ${isSimulating ? 'active' : ''}`}
                                    onClick={handleSimulationToggle}
                                >
                                    <Navigation size={14} className={isSimulating ? 'animate-pulse' : ''} />
                                    <span>{isSimulating ? 'Live Simulation' : 'Start Simulation'}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {isMobile && mobileView === 'list' && (
                        <div className="mobile-section-header animate-fade-in">
                            <h2 className="glow-text-orange">Top Rated Near You</h2>
                            <p>Handpicked elite restaurants for your journey</p>
                        </div>
                    )}

                    {/* Elite Terminal HUD Split View */}
                    <div className={`dashboard-split-view technical-hub-frame ${isMobile ? `mobile-${mobileView}` : ''}`}>
                        <div className="hud-corner top-left"></div>
                        <div className="hud-corner top-right"></div>
                        <div className="hud-corner bottom-left"></div>
                        <div className="hud-corner bottom-right"></div>
                        
                        <div className="restaurant-grid-container scroll-pro">
                            {/* Neural Recommendations Engine UI */}
                            {recommendations.length > 0 && (
                                <section className="neural-recs-section animate-slide-up">
                                    <div className="neural-header">
                                        <div className="ai-badge glass-modern">
                                            <Brain size={14} className="brain-pulse" />
                                            <span>NEURAL ENGINE ACTIVE</span>
                                        </div>
                                        <div className="neural-title">
                                            <h3>Recommended <span className="gradient-text">For You</span></h3>
                                            <p>AI-driven selections based on your highway journey</p>
                                        </div>
                                        <Sparkles size={20} className="sparkle-anim" />
                                    </div>
                                    <div className="recs-horizontal-scroll">
                                        {recommendations.map((item, idx) => (
                                            <div key={item.menuItemId} className="rec-card-mini glass-modern hover-glow">
                                                <div className="rec-img-wrapper">
                                                    <img src={item.imageUrl || fallbackImages[idx % fallbackImages.length]} alt={item.name} />
                                                    <div className="rec-category-tag">{item.category}</div>
                                                </div>
                                                <div className="rec-info">
                                                    <div className="rec-name-row">
                                                        <h4>{item.name}</h4>
                                                        <div className="rec-veg-indicator">
                                                            <div className={`veg-dot ${item.isVeg ? 'veg' : 'non-veg'}`}></div>
                                                        </div>
                                                    </div>
                                                    <p className="rec-res">{item.restaurantName}</p>
                                                    <div className="rec-footer">
                                                        <span className="rec-price">₹{item.price}</span>
                                                        <div className="rec-rating">
                                                            <Star size={10} fill="var(--accent-orange)" />
                                                            <span>{item.rating}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    className="rec-add-btn"
                                                    onClick={() => {
                                                        const normalizedItem = {
                                                            id: item.menuItemId || item.id,
                                                            name: item.name,
                                                            price: item.price,
                                                            image: item.imageUrl,
                                                            category: item.category
                                                        };
                                                        addToCart(normalizedItem, item.restaurantId || 'unknown', item.restaurantName);
                                                    }}
                                                >
                                                    <Zap size={14} />
                                                    <span>QUICK ADD</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

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
                                onMapClick={handleMapClick}
                                isSimulating={isSimulating}
                                simulatedLocation={simulatedLocation}
                                setSimulatedLocation={setSimulatedLocation}
                            />
                        </div>
                    </div>
                </main>
            </div>

            {isMobile && (
                <button 
                    className="mobile-view-toggle glass"
                    onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}
                >
                    {mobileView === 'list' ? (
                        <>
                            <MapPin size={20} />
                            <span>View Map</span>
                        </>
                    ) : (
                        <>
                            <LayoutGrid size={20} />
                            <span>View List</span>
                        </>
                    )}
                </button>
            )}


            {/* Overlays */}
            {activeFlashDeal && (
                <FlashDealOverlay 
                    restaurant={activeFlashDeal}
                    onClose={() => setActiveFlashDeal(null)}
                    onAction={(id) => {
                        console.log("Claiming deal for", id);
                        setActiveFlashDeal(null);
                        // Navigate to restaurant menu or show toast
                    }}
                />
            )}

            {showDriveMode && (
                <DriveModeOverlay 
                    onClose={() => setShowDriveMode(false)}
                    onSearch={getLocation}
                    orderStatus="Your order from Royal Dhaba is being prepared. ETA: 12 minutes."
                />
            )}
        </div>
    );
};

export default Dashboard;
