import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { Phone, Lock, ArrowRight, ShieldCheck, Mail, User, Calendar, MapPin, LogIn, Star, Shield, Github, Apple as AppleIcon, ChevronLeft } from 'lucide-react';
import { authApi } from '../services/api';
import Logo from '../components/Logo/Logo.jsx';
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

    // Determine initial state based on path
    const [isFlipped, setIsFlipped] = useState(location.pathname === '/register');
    const [showForgot, setShowForgot] = useState(false);

    // Login States
    const [loginMethod, setLoginMethod] = useState('otp');
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginOtpCode, setLoginOtpCode] = useState('');
    const [loginStep, setLoginStep] = useState(1);
    const [forgotEmail, setForgotEmail] = useState('');

    // Register States
    const [registerData, setRegisterData] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: '', dob: '', address: '', password: '', confirmPassword: ''
    });

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
        const newPath = isFlipped ? '/login' : '/register';
        navigate(newPath);
    };

    // --- Login Handlers ---
    const handleLoginInitial = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (loginMethod === 'otp') {
            try {
                await authApi.sendOtp(loginIdentifier);
                setLoginStep(2);
                setOtpTimer(30);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to send OTP.');
            } finally { setLoading(false); }
        } else {
            try {
                const response = await authApi.loginWithPassword({ identifier: loginIdentifier, password: loginPassword });
                completeAuth(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Login failed.');
            } finally { setLoading(false); }
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            setSuccess('Reset link sent to your email!');
            setTimeout(() => setShowForgot(false), 2000);
        } catch (err) {
            setError('Failed to send reset link.');
        } finally { setLoading(false); }
    };

    const [otpTimer, setOtpTimer] = useState(0);

    useEffect(() => {
        let timer;
        if (otpTimer > 0) {
            timer = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [otpTimer]);

    const handleSendOtpAgain = async () => {
        if (otpTimer > 0) return;
        setLoading(true);
        try {
            await authApi.sendOtp(loginIdentifier);
            setOtpTimer(30);
            setSuccess('OTP resent successfully!');
        } catch (err) {
            setError('Failed to resend OTP.');
        } finally { setLoading(false); }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await authApi.verifyOtp({ phoneNumber: loginIdentifier, otpCode: loginOtpCode });
            completeAuth(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP.');
        } finally { setLoading(false); }
    };

    const completeAuth = (data) => {
        if (onLogin) onLogin(data);
        navigate('/');
    };

    // --- Register Handlers ---
    const handleRegister = async (e) => {
        e.preventDefault();
        if (registerData.password !== registerData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await authApi.register({ ...registerData });
            setSuccess('Registration successful! Switching to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page theme-aurora">
            <NavLink to="/" className="back-home-btn glass">
                <ChevronLeft size={20} />
                <span>Back to Home</span>
            </NavLink>
            <div className="bg-mesh"></div>
            <div className="bg-vignette"></div>
            <div className="bg-aurora">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>
            <div className="bg-particles"></div>

            <div className={`auth-split-container ${isFlipped ? 'flipped' : ''} ${showForgot ? 'show-forgot' : ''}`}>
                {/* Visual Side */}
                <div className="auth-visual-side">
                    <img
                        src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2070&auto=format&fit=crop"
                        alt="Elite Highway Travel"
                        className="auth-hero-img"
                    />
                    <div className="auth-visual-overlay"></div>
                    <div className="auth-brand-content">
                        <div className="auth-logo-badge glass">
                            <Logo size={40} />
                        </div>
                        <h2>Elite Travel <br /><span>Exceptional Taste</span></h2>
                        <p>Experience the finest highway dining on your next journey.</p>

                        <div className="benefits-list">
                            {benefits.map((b, i) => (
                                <div key={i} className="benefit-item animate-fade-in-up" style={{ animationDelay: `${0.5 + i * 0.2}s` }}>
                                    <span className="benefit-icon">{b.icon}</span>
                                    <span>{b.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="auth-form-side">
                    <div className="auth-flip-inner">
                        {/* FRONT: Login Form */}
                        <div className="auth-card-front">
                            <div className="auth-card-content">
                                {showForgot ? (
                                    <>
                                        <h2 className="auth-title">Reset Password</h2>
                                        <p className="auth-subtitle">Enter email to receive reset link</p>
                                        {error && <div className="error-message">{error}</div>}
                                        {success && <div className="success-message">{success}</div>}
                                        <form className="auth-form" onSubmit={handleForgotSubmit}>
                                            <div className="form-group">
                                                <label>Email Address</label>
                                                <div className="input-wrapper">
                                                    <Mail size={18} className="input-icon" />
                                                    <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                                                </div>
                                            </div>
                                            <button type="submit" className="btn-primary w-full" disabled={loading}>
                                                {loading ? 'Sending...' : 'Send Reset Link'}
                                            </button>
                                            <button type="button" className="btn-text w-full mt-4" onClick={() => setShowForgot(false)}>Back to Login</button>
                                        </form>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="auth-title">{loginStep === 1 ? 'Welcome Back' : 'Verify OTP'}</h2>
                                        {loginStep === 2 && <p className="auth-subtitle">{`Code sent to ${loginIdentifier}`}</p>}
                                        {loginStep === 1 && (
                                            <div className="method-toggle">
                                                <button className={loginMethod === 'otp' ? 'active' : ''} onClick={() => setLoginMethod('otp')}>OTP</button>
                                                <button className={loginMethod === 'password' ? 'active' : ''} onClick={() => setLoginMethod('password')}>Password</button>
                                            </div>
                                        )}
                                        {error && !isFlipped && <div className="error-message">{error}</div>}
                                        <form className="auth-form" onSubmit={loginStep === 1 ? handleLoginInitial : handleVerifyOtp}>
                                            {loginStep === 1 ? (
                                                <>
                                                    <div className="form-group" style={{ animationDelay: '0.1s' }}>
                                                        <label>{loginMethod === 'otp' ? 'Phone' : 'Email/Phone'}</label>
                                                        <div className="input-wrapper">
                                                            {loginMethod === 'otp' ? <Phone size={18} className="input-icon" /> : <Mail size={18} className="input-icon" />}
                                                            <input type="text" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} required />
                                                        </div>
                                                    </div>
                                                    {loginMethod === 'password' && (
                                                        <div className="form-group" style={{ animationDelay: '0.2s' }}>
                                                            <div className="flex justify-between items-center">
                                                                <label>Password</label>
                                                                <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); setShowForgot(true) }}>Forgot?</a>
                                                            </div>
                                                            <div className="input-wrapper">
                                                                <Lock size={18} className="input-icon" />
                                                                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="form-group" style={{ animationDelay: '0.1s' }}>
                                                    <div className="flex justify-between items-center">
                                                        <label>Verification Code</label>
                                                        <button
                                                            type="button"
                                                            className={`btn-text text-sm ${otpTimer > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            onClick={handleSendOtpAgain}
                                                            disabled={otpTimer > 0 || loading}
                                                        >
                                                            {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                                                        </button>
                                                    </div>
                                                    <div className="input-wrapper">
                                                        <ShieldCheck size={18} className="input-icon" />
                                                        <input type="text" maxLength={6} placeholder="000000" value={loginOtpCode} onChange={(e) => setLoginOtpCode(e.target.value)} required />
                                                    </div>
                                                </div>
                                            )}
                                            <button type="submit" className="btn-primary w-full" style={{ animationDelay: '0.3s' }} disabled={loading}>
                                                {loading ? 'Wait...' : (loginStep === 1 ? 'Login' : 'Verify')} <ArrowRight size={18} />
                                            </button>
                                        </form>
                                        <SocialLogins />
                                        <p className="auth-footer">New here? <a href="#" onClick={toggleAuth}>Sign Up Now</a></p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* BACK: Register Form */}
                        <div className="auth-card-back">
                            <div className="auth-card-content">
                                <h2 className="auth-title">Create Account</h2>
                                {error && isFlipped && <div className="error-message">{error}</div>}
                                {success && <div className="success-message">{success}</div>}
                                <form className="auth-form grid-2" onSubmit={handleRegister}>
                                    <div className="form-group" style={{ animationDelay: '0.1s' }}>
                                        <label>First Name</label>
                                        <div className="input-wrapper">
                                            <User size={18} className="input-icon" />
                                            <input type="text" value={registerData.firstName} onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ animationDelay: '0.15s' }}>
                                        <label>Last Name</label>
                                        <div className="input-wrapper">
                                            <User size={18} className="input-icon" />
                                            <input type="text" value={registerData.lastName} onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ animationDelay: '0.2s' }}>
                                        <label>Email Address</label>
                                        <div className="input-wrapper">
                                            <Mail size={18} className="input-icon" />
                                            <input type="email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ animationDelay: '0.25s' }}>
                                        <label>Mobile Number</label>
                                        <div className="input-wrapper">
                                            <Phone size={18} className="input-icon" />
                                            <input type="tel" value={registerData.phoneNumber} onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ animationDelay: '0.3s' }}>
                                        <label>Date of Birth</label>
                                        <div className="input-wrapper">
                                            <Calendar size={18} className="input-icon" />
                                            <input type="date" value={registerData.dob} onChange={(e) => setRegisterData({ ...registerData, dob: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ animationDelay: '0.35s' }}>
                                        <label>Address</label>
                                        <div className="input-wrapper">
                                            <MapPin size={18} className="input-icon" />
                                            <input type="text" placeholder="City, State" value={registerData.address} onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ animationDelay: '0.4s' }}>
                                        <label>Password</label>
                                        <div className="input-wrapper">
                                            <Lock size={18} className="input-icon" />
                                            <input type="password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ animationDelay: '0.45s' }}>
                                        <label>Confirm Password</label>
                                        <div className="input-wrapper">
                                            <Lock size={18} className="input-icon" />
                                            <input type="password" value={registerData.confirmPassword} onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} required />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-primary w-full span-2" style={{ animationDelay: '0.5s' }} disabled={loading}>
                                        {loading ? 'Creating...' : 'Sign Up Now'}
                                    </button>
                                </form>
                                <SocialLogins />
                                <p className="auth-footer">Member? <a href="#" onClick={toggleAuth}>Login Here</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
