import React from 'react';
import Hero from '../components/Hero/Hero';
import FoodCard from '../components/FoodCard/FoodCard';
import { Truck, Clock, ShieldCheck, Map } from 'lucide-react';
import Logo from '../components/Logo/Logo';
import './LandingPage.css';

const trendingFoods = [
    { id: 1, name: 'Gourmet Truffle Burger', restaurant: 'Royal Cuisines', price: 450, rating: 4.9, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1500&auto=format&fit=crop' },
    { id: 2, name: 'Avocado Zen Bowl', restaurant: 'Green Bliss', price: 380, rating: 4.7, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1500&auto=format&fit=crop' },
    { id: 3, name: 'Premium Mutton Biryani', restaurant: 'Legacy Flavors', price: 520, rating: 4.8, image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1500&auto=format&fit=crop' },
    { id: 4, name: 'Classic Paneer Tikka', restaurant: 'Highway Spice', price: 280, rating: 4.7, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=1500&auto=format&fit=crop' },
];

const steps = [
    { id: 1, title: 'Search Route', desc: 'Enter your starting point and destination to find top-rated rest stops.', icon: <Map size={32} /> },
    { id: 2, title: 'Choose Meal', desc: 'Browse curated menus and pre-order your favorite delicacies.', icon: <Clock size={32} /> },
    { id: 3, title: 'Seamless Pickup', desc: 'Arrive at the stop, skip the queue, and grab your fresh meal.', icon: <Truck size={32} /> },
];

const LandingPage = () => {
    return (
        <div className="landing-page auth-page-global-bg">
            {/* Premium Interactive Background */}
            <div className="bg-mesh"></div>
            <div className="bg-vignette"></div>

            <Hero />

            <section className="how-it-works container animate-fade-in">
                <div className="section-header">
                    <span className="section-badge silver-text">Simple Operations</span>
                    <h2 className="section-title">Your Highway Meal, <span className="gradient-text">Simplified</span></h2>
                    <p className="section-desc">Experience the future of highway dining in three easy steps. No more waiting, no more low-quality food.</p>
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

            <section className="trending-section animate-fade-in">
                <div className="container">
                    <div className="section-header flex-row">
                        <div>
                            <span className="section-badge gold-text">Trending Now</span>
                            <h2 className="section-title">Most Ordered <span className="gradient-text">Delicacies</span></h2>
                        </div>
                        <button className="landing-btn-secondary glass-button">
                            View Full Menu
                        </button>
                    </div>

                    <div className="food-grid">
                        {trendingFoods.map(food => (
                            <FoodCard key={food.id} {...food} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="cta-section container">
                <div className="cta-card glass">
                    <div className="cta-content">
                        <h2>Ready for a better journey?</h2>
                        <p>Join thousands of travelers who never settle for mediocre highway food.</p>
                        <div className="cta-actions">
                            <button className="landing-btn-primary">Start Your Journey</button>
                            <button className="landing-btn-secondary">Download App</button>
                        </div>
                    </div>
                    <div className="cta-visual">
                        <ShieldCheck size={120} className="cta-icon" />
                    </div>
                </div>
            </section>

            <footer className="footer-premium">
                <div className="container footer-grid">
                    <div className="footer-brand">
                        <Logo size={36} className="logo-large" />
                        <p>
                            Your ultimate companion for highway food discovery.
                            Pre-order meals from the best rest stops along your route.
                        </p>
                        <div className="footer-socials">
                            <a href="#" className="social-icon" aria-label="Twitter">𝕏</a>
                            <a href="#" className="social-icon" aria-label="Instagram">📸</a>
                            <a href="#" className="social-icon" aria-label="LinkedIn">in</a>
                        </div>
                    </div>
                    <div className="footer-links-group">
                        <div className="link-col">
                            <h4>Company</h4>
                            <a href="/about">About Us</a>
                            <a href="#">Careers</a>
                            <a href="#">Press</a>
                            <a href="#">Blog</a>
                        </div>
                        <div className="link-col">
                            <h4>Support</h4>
                            <a href="#">Help Center</a>
                            <a href="#">Safety</a>
                            <a href="#">Contact Us</a>
                            <a href="#">Partners</a>
                        </div>
                    </div>
                </div>
                <div className="footer-divider"></div>
                <div className="footer-bottom">
                    <p>&copy; 2026 PikNGo Inc. All rights reserved.</p>
                    <div className="legal-links">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Cookies</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
