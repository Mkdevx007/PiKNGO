import React from 'react';
import { 
    Rocket, 
    ShieldCheck, 
    Smartphone, 
    Search, 
    ShoppingBag, 
    Navigation, 
    Users, 
    MapPin, 
    TrendingUp,
    Heart,
    Zap,
    Cpu,
    Database,
    Globe,
    Code
} from 'lucide-react';
import './About.css';

const AboutPage = () => {
    return (
        <div className="about-page animate-fade-in">
            {/* Immersive Hero Section */}
            <section className="about-hero">
                <div className="hero-mesh"></div>
                <div className="container relative h-full flex items-center justify-center">
                    <div className="hero-content-wrapper text-center">
                        <div className="elite-tag mb-4 shadow-orange">Established 2026</div>
                        <h1 className="gradient-text hero-title">Beyond the Journey</h1>
                        <p className="subtitle">
                            We are reimagining highway dining by merging culinary excellence 
                            with seamless technology for the modern traveler.
                        </p>
                    </div>
                </div>
                <div className="hero-scroll-indicator">
                    <div className="mouse"></div>
                </div>
            </section>

            {/* Mission & Stats Section */}
            <section className="about-mission container section-padding">
                <div className="about-card glass-card h-full premium-border">
                    <div className="about-grid">
                        <div className="about-text">
                            <div className="section-label">Our Philosophy</div>
                            <h2 className="title-md">Architecting Moments of <span className="text-highlight">Culinary Joy</span></h2>
                            <p className="p-text">
                                Traveling isn't just about the destination; it's about the moments in between. 
                                At PikNGo, we believe that high-quality, hygienic, and delicious food should be 
                                accessible no matter where the road takes you.
                            </p>
                            <div className="mission-features mt-8">
                                <div className="m-feat-box glass">
                                    <ShieldCheck className="m-icon" size={24} />
                                    <div className="m-feat-content">
                                        <h4>Uncompromising Hygiene</h4>
                                        <p>Every partner is vetted by our health-first protocols.</p>
                                    </div>
                                </div>
                                <div className="m-feat-box glass">
                                    <Zap className="m-icon" size={24} />
                                    <div className="m-feat-content">
                                        <h4>Real-time Infrastructure</h4>
                                        <p>Proprietary systems for zero-latency order tracking.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="about-stats-container">
                            <div className="stat-card glass shadow-premium animate-float">
                                <Users size={32} className="stat-card-icon" />
                                <div className="stat-info">
                                    <h3 className="gradient-text">50k+</h3>
                                    <p>Active Citizens</p>
                                </div>
                            </div>
                            <div className="stat-card glass shadow-premium animate-float-delayed">
                                <MapPin size={32} className="stat-card-icon" />
                                <div className="stat-info">
                                    <h3 className="gradient-text">120+</h3>
                                    <p>Rest Stops</p>
                                </div>
                            </div>
                            <div className="stat-card glass shadow-premium animate-float">
                                <TrendingUp size={32} className="stat-card-icon" />
                                <div className="stat-info">
                                    <h3 className="gradient-text">4.8</h3>
                                    <p>Average Rating</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Technology Section */}
            <section className="tech-section bg-dark-refine">
                <div className="container">
                    <div className="text-center mb-16">
                        <div className="section-label">Technology</div>
                        <h2 className="section-title">Built with <span className="gradient-text">Precision</span></h2>
                    </div>
                    <div className="tech-grid">
                        <div className="tech-item tech-edge">
                            <div className="tech-icon-wrapper">
                                <Cpu size={32} />
                            </div>
                            <h3>Edge Computing</h3>
                            <p>Predictive location-based ordering systems.</p>
                        </div>
                        <div className="tech-item tech-db">
                            <div className="tech-icon-wrapper">
                                <Database size={32} />
                            </div>
                            <h3>Scalable Backend</h3>
                            <p>Enterprise-grade Spring Boot microservices.</p>
                        </div>
                        <div className="tech-item tech-route">
                            <div className="tech-icon-wrapper">
                                <Globe size={32} />
                            </div>
                            <h3>Hyper-Local Routing</h3>
                            <p>MapBox integrated real-time highway mapping.</p>
                        </div>
                        <div className="tech-item tech-stack">
                            <div className="tech-icon-wrapper">
                                <Code size={32} />
                            </div>
                            <h3>Modern Stack</h3>
                            <p>React, Redux, and Tailwind for fluid experiences.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Timeline */}
            <section className="timeline-section section-padding">
                <div className="container">
                    <div className="text-center mb-20">
                        <div className="section-label">The Process</div>
                        <h2 className="section-title">A Seamless <span className="gradient-text">Experience</span></h2>
                    </div>
                    
                    <div className="timeline-grid-premium">
                        <div className="timeline-item-pro timeline-discover glass-card">
                            <div className="step-glow-pro blue"></div>
                            <div className="step-number-pro">01</div>
                            <div className="step-icon-box-pro"><Search size={36} /></div>
                            <h3>Discover</h3>
                            <p>Intelligence-driven restaurant discovery along your exact route.</p>
                        </div>
                        <div className="timeline-connector-pro"></div>
                        <div className="timeline-item-pro timeline-order glass-card">
                            <div className="step-glow-pro orange"></div>
                            <div className="step-number-pro">02</div>
                            <div className="step-icon-box-pro"><ShoppingBag size={36} /></div>
                            <h3>Pre-Order</h3>
                            <p>Custom menus with transparent nutritional and hygiene ratings.</p>
                        </div>
                        <div className="timeline-connector-pro"></div>
                        <div className="timeline-item-pro timeline-pickup glass-card">
                            <div className="step-glow-pro emerald"></div>
                            <div className="step-number-pro">03</div>
                            <div className="step-icon-box-pro"><Navigation size={36} /></div>
                            <h3>Pick & Go</h3>
                            <p>Zero-wait arrival with QR-enabled rapid collection points.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="about-footer-cta container">
                <div className="cta-card-pro glass shadow-float">
                    <div className="cta-mesh"></div>
                    <Heart className="cta-heart-pro" fill="var(--accent-orange)" />
                    <h2>Evolve Your Journey</h2>
                    <p>Join the community of 50,000+ travelers redefined by elite dining.</p>
                    <div className="cta-actions-pro">
                        <button className="btn-primary-pro" onClick={() => window.location.href='/login'}>Get Started Now</button>
                        <button className="btn-secondary-pro" onClick={() => window.location.href='/about'}>Watch Story</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
