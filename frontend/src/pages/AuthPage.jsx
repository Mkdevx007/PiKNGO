import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { ChevronLeft, Star, Shield, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo/Logo.jsx';
import LoginForm from '../components/Auth/LoginForm.jsx';
import RegisterForm from '../components/Auth/RegisterForm.jsx';
import ForgotPasswordForm from '../components/Auth/ForgotPasswordForm.jsx';
import './Auth.css';



const LOGIN_IMAGE = "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop";
const REGISTER_IMAGE = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop";

const AuthPage = ({ onLogin }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [isFlipped, setIsFlipped] = useState(location.pathname === '/register');
    const [showForgot, setShowForgot] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        setIsFlipped(location.pathname === '/register');
        setError('');
        setSuccess('');
        setShowForgot(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const card = document.querySelector('.auth-split-container');
            if (card) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }
        };
        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const toggleAuth = (e) => {
        e.preventDefault();
        navigate(isFlipped ? '/login' : '/register');
    };

    const completeAuth = (data) => {
        if (onLogin) onLogin(data);
        navigate('/dashboard');
    };

    return (
        <div className="auth-page theme-aurora">
            <NavLink to="/" className="back-home-btn glass">
                <ChevronLeft size={20} />
                <span>Back to Home</span>
            </NavLink>
            <div className="bg-mesh"></div>
            <div className="bg-aurora">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>
            <div className="bg-particles"></div>

            <div className={`auth-split-container ${isFlipped ? 'flipped' : ''} ${showForgot ? 'show-forgot' : ''}`}>
                <div className="auth-visual-side">
                    <img
                        src={isFlipped ? REGISTER_IMAGE : LOGIN_IMAGE}
                        alt="Premium Travel Dining"
                        className="auth-hero-img"
                    />
                    <div className="auth-visual-overlay"></div>
                    <div className="auth-brand-content">
                        <div className="logo-container">
                            <Logo size={80} />
                        </div>
                        <h2>Premium Highway <br /><span>Dining Experience</span></h2>
                        <p>Join the elite community of travelers. Pre-order meals from the best rest stops along your route.</p>
                    </div>
                </div>

                <div className="auth-form-side">
                    <div className="auth-flip-inner">
                        <div className="auth-card-front">
                            {error && !isFlipped && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}
                            
                            {showForgot ? (
                                <ForgotPasswordForm 
                                    onSuccess={setSuccess} 
                                    onError={setError} 
                                    loading={loading} 
                                    setLoading={setLoading} 
                                    onBack={() => { setShowForgot(false); setSuccess(''); setError(''); }} 
                                />
                            ) : (
                                <div className="auth-card-content">
                                    <LoginForm 
                                        onLogin={completeAuth} 
                                        onError={setError} 
                                        loading={loading} 
                                        setLoading={setLoading} 
                                        onForgot={() => { setShowForgot(true); setSuccess(''); setError(''); }}
                                    />
                                    <p className="auth-footer">New here? <a href="#" onClick={toggleAuth}>Sign Up Now</a></p>
                                </div>
                            )}
                        </div>

                        <div className="auth-card-back">
                            <RegisterForm 
                                onSuccess={(msg) => { setSuccess(msg); setTimeout(() => navigate('/login'), 2000); }} 
                                onError={setError} 
                                loading={loading} 
                                setLoading={setLoading} 
                            />
                            {error && isFlipped && <div className="error-message">{error}</div>}
                            {success && isFlipped && <div className="success-message">{success}</div>}
                            <p className="auth-footer">Member? <a href="#" onClick={toggleAuth}>Login Here</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
