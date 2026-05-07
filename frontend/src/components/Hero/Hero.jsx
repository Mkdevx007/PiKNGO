import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Navigation, ArrowRight } from 'lucide-react';
import { CITY_COORDS } from '../../utils/geoUtils';
import './Hero.css';

const Hero = ({ source, destination, setSource, setDestination, onSearch }) => {
    const navigate = useNavigate();
    const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
    const [showDestSuggestions, setShowDestSuggestions] = useState(false);

    const cities = Object.keys(CITY_COORDS).map(city => city.charAt(0).toUpperCase() + city.slice(1));

    const filteredSourceCities = cities.filter(city => 
        city.toLowerCase().includes(source.toLowerCase()) && city.toLowerCase() !== source.toLowerCase()
    );

    const filteredDestCities = cities.filter(city => 
        city.toLowerCase().includes(destination.toLowerCase()) && city.toLowerCase() !== destination.toLowerCase()
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(e);
    };

    return (
        <section className="hero">
            {/* ... (floating elements same as before) */}

            <div className="hero-visuals">
                <div className="hero-image-container">
                    <img
                        src="/assets/landing-hero.png"
                        alt="High-end Highway Travel"
                        className="hero-main-image"
                    />
                    <div className="hero-overlay-gradient"></div>
                </div>
            </div>

            <div className="hero-content animate-fade-in center-layout">
                <div className="professional-hud-badge elite-entrance">
                    <span className="status-dot"></span>
                    HUB STATUS: OPTIMIZED • 256-BIT SECURE
                </div>

                <form className="search-wrapper glass animate-fade-in" onSubmit={handleSubmit}>
                    <div className="search-pill">
                        <div className="search-input-group">
                            <MapPin size={18} className="search-icon" />
                            <div className="input-box">
                                <label>Starting From</label>
                                <input 
                                    type="text" 
                                    placeholder="Entry City" 
                                    value={source}
                                    onChange={(e) => { setSource(e.target.value); setShowSourceSuggestions(true); }}
                                    onFocus={() => setShowSourceSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSourceSuggestions(false), 200)}
                                />
                                {showSourceSuggestions && filteredSourceCities.length > 0 && (
                                    <div className="autocomplete-dropdown glass">
                                        {filteredSourceCities.map(city => (
                                            <div key={city} className="suggestion-item" onMouseDown={() => { setSource(city); setShowSourceSuggestions(false); }}>
                                                <MapPin size={14} /> <span>{city}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="search-divider"></div>
                        <div className="search-input-group">
                            <Navigation size={18} className="search-icon" />
                            <div className="input-box">
                                <label>Heading To</label>
                                <input 
                                    type="text" 
                                    placeholder="Destination" 
                                    value={destination}
                                    onChange={(e) => { setDestination(e.target.value); setShowDestSuggestions(true); }}
                                    onFocus={() => setShowDestSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowDestSuggestions(false), 200)}
                                />
                                {showDestSuggestions && filteredDestCities.length > 0 && (
                                    <div className="autocomplete-dropdown glass">
                                        {filteredDestCities.map(city => (
                                            <div key={city} className="suggestion-item" onMouseDown={() => { setDestination(city); setShowDestSuggestions(false); }}>
                                                <Navigation size={14} /> <span>{city}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button type="submit" className="search-action-btn">
                            <Search size={20} />
                            <span>Explore Meals</span>
                        </button>
                    </div>
                </form>

                <div className="hero-features animate-fade-in">
                    <div className="feature-pill">
                        <span>⚡</span> Quick Pickup
                    </div>
                    <div className="feature-pill">
                        <span>🥗</span> Hygienic Meals
                    </div>
                    <div className="feature-pill">
                        <span>📍</span> Route Tracked
                    </div>
                </div>

                <div className="popular-routes animate-fade-in" style={{animationDelay: '0.4s'}}>
                    <span className="routes-label">Active Corridors:</span>
                    <div className="routes-chips">
                        {[
                            {s: 'Delhi', d: 'Jaipur', hubs: 12, status: 'CLEAR'},
                            {s: 'Delhi', d: 'Shimla', hubs: 8, status: 'ACTIVE'},
                            {s: 'Mumbai', d: 'Pune', hubs: 15, status: 'OPTIMIZED'}
                        ].map((route, i) => (
                            <button 
                                key={i} 
                                className="route-chip-hud glass-pill"
                                onClick={() => {
                                    setSource(route.s);
                                    setDestination(route.d);
                                }}
                            >
                                <div className="route-main">
                                    <span className="route-text">{route.s} ➔ {route.d}</span>
                                    <span className={`route-status ${route.status.toLowerCase()}`}>{route.status}</span>
                                </div>
                                <div className="route-stats">
                                    <Navigation size={10} /> {route.hubs} HUBS DETECTED
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
