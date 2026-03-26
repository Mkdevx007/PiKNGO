import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero/Hero';
import FoodCard from '../components/FoodCard/FoodCard';
import { Truck, Clock, ShieldCheck, Map, MapPin, Loader2 } from 'lucide-react';
import Logo from '../components/Logo/Logo';
import { restaurantApi } from '../services/api';
import { getCoordsForCity } from '../utils/geoUtils';
import './LandingPage.css';

const steps = [
    { id: 1, title: 'Search Route', desc: 'Enter your starting point and destination to find top-rated rest stops.', icon: <Map size={32} /> },
    { id: 2, title: 'Choose Meal', desc: 'Browse curated menus and pre-order your favorite delicacies.', icon: <Clock size={32} /> },
    { id: 3, title: 'Seamless Pickup', desc: 'Arrive at the stop, skip the queue, and grab your fresh meal.', icon: <Truck size={32} /> },
];


const LandingPage = ({ isLoggedIn }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locationStatus, setLocationStatus] = useState('Checking location...');
    const [searchQuery, setSearchQuery] = useState({ source: '', destination: '' });

    useEffect(() => {
        const getLocation = () => {
            if (!navigator.geolocation) {
                setLocationStatus('Geolocation not supported');
                fetchAllRestaurants();
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocationStatus('Showing restaurants near you');
                    fetchNearbyRestaurants(latitude, longitude);
                },
                (error) => {
                    console.log("Geolocation error, falling back to all restaurants", error);
                    setLocationStatus('All Premium Stops');
                    fetchAllRestaurants();
                },
                { timeout: 5000, enableHighAccuracy: false }
            );
        };

        getLocation();
    }, []);

    const fetchAllRestaurants = async () => {
        setLoading(true);
        console.log("Fetching all restaurants...");
        try {
            const response = await restaurantApi.getAll();
            console.log("Response:", response.data);
            setRestaurants(response.data);
            setLocationStatus('All Premium Stops');
        } catch (err) {
            console.error("Fetch All Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchNearbyRestaurants = async (lat, lon) => {
        setLoading(true);
        console.log(`Fetching nearby restaurants for ${lat}, ${lon}...`);
        try {
            const response = await restaurantApi.getNearby(lat, lon);
            console.log("Nearby Response:", response.data);
            setRestaurants(response.data);
        } catch (err) {
            console.error("Nearby Fetch Error:", err);
            fetchAllRestaurants();
        } finally {
            setLoading(false);
        }
    };

    const handleRouteSearch = async (e) => {
        if (e) e.preventDefault();
        
        const src = searchQuery.source.toLowerCase().trim();
        const dest = searchQuery.destination.toLowerCase().trim();

        console.log(`Searching route: ${src} to ${dest}...`);
        if (!src || !dest) {
            alert("Please enter both a Starting City and a Destination to explore meals.");
            return;
        }

        setLoading(true);
        
        // Scroll to results section, slight delay ensures UI paint before scroll
        setTimeout(() => {
            const resultsSection = document.getElementById('restaurant-results');
            if (resultsSection) {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 50);

        try {
            // Get coordinates from our demo mapping
            const srcCoord = getCoordsForCity(searchQuery.source);
            const destCoord = getCoordsForCity(searchQuery.destination);

            console.log(`Using coords: SRC(${srcCoord.lat}, ${srcCoord.lon}), DEST(${destCoord.lat}, ${destCoord.lon})`);

            const response = await restaurantApi.searchByRoute(
                srcCoord.lat, srcCoord.lon, 
                destCoord.lat, destCoord.lon,
                100 // Increased radius to 100km to ensure it catches demo data points
            );
            
            console.log("Search Response:", response.data);
            setRestaurants(response.data);
            setLocationStatus(`Route: ${searchQuery.source} ➔ ${searchQuery.destination}`);
            
            if (response.data.length === 0) {
                console.warn("No restaurants found along this route.");
            }
        } catch (err) {
            console.error("Route Search Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const defaultRestaurantImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1470&auto=format&fit=crop";

    return (
        <div className="landing-page auth-page-global-bg">
            <div className="bg-mesh"></div>
            <div className="bg-vignette"></div>

            <Hero 
                isLoggedIn={isLoggedIn}
                source={searchQuery.source}
                destination={searchQuery.destination}
                setSource={(val) => setSearchQuery(prev => ({ ...prev, source: val }))}
                setDestination={(val) => setSearchQuery(prev => ({ ...prev, destination: val }))}
                onSearch={handleRouteSearch}
            />





            <section className="how-it-works container animate-fade-in">
                <div className="section-header">
                    <h2 className="section-title">Your Highway Meal, <span className="gradient-text">Simplified</span></h2>
                </div>
                <div className="steps-grid">
                    {steps.map((step, index) => (
                        <div key={step.id} className="step-card glass-card">
                            <div className="step-number">0{index + 1}</div>
                            <div className="step-glow"></div>
                            <div className="step-icon-wrapper">{step.icon}</div>
                            <h3>{step.title}</h3>
                            <p>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Removed Stats and Showcase for professional look */}

            <section id="restaurant-results" className="trending-section animate-fade-in">
                <div className="container">
                    <div className="section-header flex-row">
                        <div>
                            <span className="section-badge gold-text">{locationStatus}</span>
                            <h2 className="section-title">Premium <span className="gradient-text">Discovery</span></h2>
                        </div>
                        <button className="landing-btn-secondary glass-button" onClick={fetchAllRestaurants}>
                            View All
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-state">
                            <Loader2 className="spinner" size={48} />
                            <p>Searching for premium spots...</p>
                        </div>
                    ) : (
                        <div className="food-grid">
                            {restaurants.length > 0 ? (
                                restaurants.map((res, index) => (
                                    <FoodCard 
                                        key={res._id || res.id} 
                                        id={res._id || res.id}
                                        name={res.resturantName || res.restaurantName} 
                                        restaurant={res.resturantName || res.restaurantName} 
                                        address={res.address}
                                        price={res.deliveryTime || "$$"} 
                                        rating={res.rating || 0} 
                                        image={res.imageUrl || defaultRestaurantImage}
                                    />

                                ))
                            ) : (
                                <div className="no-results glass-card">
                                    <h3>No spots found</h3>
                                    <p>Try exploring all available restaurants.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>



            <section className="cta-section container">
                <div className="cta-card glass">
                    <div className="cta-content">
                        <h2>Ready for a better journey?</h2>
                        <p>Join thousands of travelers who never settle for mediocre highway food.</p>
                        <div className="cta-actions">
                            <button className="landing-btn-primary">Start Your Journey</button>
                        </div>
                    </div>
                    <div className="cta-visual">
                        <ShieldCheck size={120} className="cta-icon" />
                    </div>
                </div>
            </section>

        <footer className="footer-premium">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <Logo size={64} className="logo-large footer-logo" />
                            <p>
                                Your ultimate companion for highway food discovery.
                                Pre-order meals from the best rest stops along your route.
                            </p>
                        </div>
                        <div className="link-col">
                            <h4>Company</h4>
                            <a href="/about">About Us</a>
                            <a href="#">Contact Us</a>
                        </div>
                        <div className="link-col">
                            <h4>Legal</h4>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2026 PikNGo Inc. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
