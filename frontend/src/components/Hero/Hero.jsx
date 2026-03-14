import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Navigation, ArrowRight } from 'lucide-react';
import './Hero.css';

const Hero = ({ source, destination, setSource, setDestination, onSearch }) => {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(e);
    };

    return (
        <section className="hero">
            {/* Floating Decorative Elements */}
            <div className="floating-elements">
                <div className="float-item food-1">
                    <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&auto=format&fit=crop" alt="Burger" />
                </div>
                <div className="float-item food-2">
                    <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop" alt="Salad" />
                </div>
                <div className="float-item pin-1">
                    <MapPin size={40} />
                </div>
                <div className="float-item nav-1">
                    <Navigation size={32} />
                </div>
            </div>

            <div className="hero-visuals">
                <div className="hero-image-container">
                    <img
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
                        alt="High-end Highway Travel"
                        className="hero-main-image"
                    />
                    <div className="hero-overlay-gradient"></div>
                </div>
            </div>

            <div className="hero-content animate-fade-in">

                <h1 className="hero-title">
                    Fuel Your Journey with <br />
                    <span className="gradient-text italic">Premium </span>
                    Food on the Go
                </h1>
                <p className="hero-subtitle">
                    Discover top-rated highway rest crops. From local delicacies to global cuisines,
                    order ahead and enjoy a seamless pickup on your route.
                </p>

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
                                    onChange={(e) => setSource(e.target.value)}
                                />
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
                                    onChange={(e) => setDestination(e.target.value)}
                                />
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
            </div>
        </section>
    );
};

export default Hero;
