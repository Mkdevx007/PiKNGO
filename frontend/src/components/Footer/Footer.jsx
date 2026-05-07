import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import Logo from '../Logo/Logo';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="global-footer animate-fade-in">
            <div className="container">
                <div className="footer-main">
                    <div className="footer-brand-section">
                        <Logo size={120} />
                        <p className="brand-desc">
                            Redefining highway dining experiences. Discover, pre-order, and enjoy 
                            premium meals from top-rated rest stops across India.
                        </p>
                        <div className="social-links">
                            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram"><Instagram size={18} /></a>
                            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter"><Twitter size={18} /></a>
                            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook"><Facebook size={18} /></a>
                            <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube"><Youtube size={18} /></a>
                        </div>
                    </div>

                    <div className="footer-links-grid">
                        <div className="link-col">
                            <h4>Quick Links</h4>
                            <Link to="/dashboard">Explore Restaurants</Link>
                            <Link to="/trending">Trending Now</Link>
                            <Link to="/about">About PikNGo</Link>
                            <Link to="/profile">My Account</Link>
                        </div>
                        <div className="link-col">
                            <h4>Support</h4>
                            <Link to="/about">Help Center</Link>
                            <Link to="/about">Safety Guidelines</Link>
                            <Link to="/about">Terms of Service</Link>
                            <Link to="/about">Privacy Policy</Link>
                        </div>
                        <div className="link-col contact-col">
                            <h4>Get in Touch</h4>
                            <div className="contact-item">
                                <Mail size={16} />
                                <span>support@pikngo.com</span>
                            </div>
                            <div className="contact-item">
                                <Phone size={16} />
                                <span>+91 98765 43210</span>
                            </div>
                            <div className="contact-item">
                                <MapPin size={16} />
                                <span>Mumbai, Maharashtra, India</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2026 PikNGo Inc. Built with Passion for Travelers.</p>
                    <div className="bottom-badges">
                        <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" />
                        <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" />
                        <img src="https://img.icons8.com/color/48/google-pay.png" alt="GPay" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
