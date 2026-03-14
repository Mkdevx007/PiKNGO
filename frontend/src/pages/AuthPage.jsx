import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { ChevronLeft, Star, Shield, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo/Logo.jsx';
import LoginForm from '../components/Auth/LoginForm.jsx';
import RegisterForm from '../components/Auth/RegisterForm.jsx';
import ForgotPasswordForm from '../components/Auth/ForgotPasswordForm.jsx';
import './Auth.css';

const SocialLogins = () => (
    <div className="social-login-container">
        <div className="social-divider"><span>or continue with</span></div>
        <div className="social-buttons">
            <button type="button" className="social-btn glass" aria-label="Login with Google">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '22px' }} />
            </button>
            <button type="button" className="social-btn glass" aria-label="Login with Apple">
                <svg width="22" height="22" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
            </button>
            <button type="button" className="social-btn glass" aria-label="Login with Facebook">
                <svg width="22" height="22" viewBox="0 0 320 512"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" /></svg>
            </button>
        </div>
    </div>
);

const benefits = [
    { icon: <Shield size={18} />, text: "Exclusive Highway Rest Stops" },
    { icon: <ArrowRight size={18} />, text: "Priority Food Ordering" },
    { icon: <Star size={18} />, text: "AI-Powered Trip Planning" },
];

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
                        src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop"
                        alt="Premium Fine Dining Experience"
                        className="auth-hero-img"
                    />
                    <div className="auth-visual-overlay"></div>
                    <div className="auth-brand-content">
                        <div className="logo-container">
                            <Logo size={90} />
                        </div>
                        <h2>Elite Travel <br /><span>Exceptional Taste</span></h2>
                        <div className="benefits-list">
                            {benefits.map((b, i) => (
                                <div key={i} className="benefit-item">
                                    <span className="benefit-icon">{b.icon}</span>
                                    <span>{b.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="auth-form-side">
                    <div className="auth-flip-inner">
                        <div className="auth-card-front">
                            {showForgot ? (
                                <ForgotPasswordForm 
                                    onSuccess={setSuccess} 
                                    onError={setError} 
                                    loading={loading} 
                                    setLoading={setLoading} 
                                    onBack={() => setShowForgot(false)} 
                                />
                            ) : (
                                <div className="auth-card-content">
                                    {error && !isFlipped && <div className="error-message">{error}</div>}
                                    {success && <div className="success-message">{success}</div>}
                                    <LoginForm 
                                        onLogin={completeAuth} 
                                        onError={setError} 
                                        loading={loading} 
                                        setLoading={setLoading} 
                                        onForgot={() => setShowForgot(true)}
                                    />
                                    <SocialLogins />
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
