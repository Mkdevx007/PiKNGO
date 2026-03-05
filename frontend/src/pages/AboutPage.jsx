import React from 'react';
import './About.css';

const AboutPage = () => {
    return (
        <div className="about-page animate-fade-in">
            <section className="about-hero glass-card">
                <div className="container">
                    <h1 className="gradient-text">About PikNGo</h1>
                    <p className="subtitle">Revolutionizing highway travel dining, one stop at a time.</p>
                </div>
            </section>

            <section className="about-content container">
                <div className="about-grid">
                    <div className="about-text">
                        <h2>Our Mission</h2>
                        <p>
                            Traveling on long highways shouldn't mean compromising on food quality.
                            PikNGo was born from a simple idea: make it easy for travelers to find
                            and pre-order high-quality, hygienic meals from the best rest stops
                            along their route.
                        </p>
                        <p>
                            We partner with top-rated highway restaurants to ensure that your
                            journey is as delicious as it is comfortable. No more waiting,
                            no more confusion—just pick, order, and go.
                        </p>
                    </div>
                    <div className="about-stats glass">
                        <div className="stat-item">
                            <h3>500+</h3>
                            <p>Partner Restaurants</p>
                        </div>
                        <div className="stat-item">
                            <h3>50k+</h3>
                            <p>Happy Travelers</p>
                        </div>
                        <div className="stat-item">
                            <h3>100+</h3>
                            <p>Highway Routes</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="team-section container">
                <h2 className="section-title">Why Choose Us?</h2>
                <div className="features-grid">
                    <div className="feature-item glass-card">
                        <span className="feature-icon">🚀</span>
                        <h3>Efficiency</h3>
                        <p>Save time by ordering your meal before you even reach the rest stop.</p>
                    </div>
                    <div className="feature-item glass-card">
                        <span className="feature-icon">🥗</span>
                        <h3>Quality</h3>
                        <p>We only partner with restaurants that maintain the highest hygiene standards.</p>
                    </div>
                    <div className="feature-item glass-card">
                        <span className="feature-icon">📱</span>
                        <h3>Seamless UI</h3>
                        <p>Our intuitive app makes finding food on the go easier than ever.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
