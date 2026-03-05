import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight, ShieldCheck, Mail, LogIn } from 'lucide-react';
import { authApi } from '../services/api';
import Logo from '../components/Logo/Logo';
import './Auth.css';

const LoginScreen = ({ onLogin }) => {
    const [method, setMethod] = useState('otp'); // 'otp' or 'password'
    const [identifier, setIdentifier] = useState(''); // Email or Phone
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [step, setStep] = useState(1); // 1: Input, 2: OTP Verification
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleInitialSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (method === 'otp') {
            try {
                await authApi.sendOtp(identifier);
                setStep(2);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to send OTP. Please check your phone number.');
            } finally {
                setLoading(false);
            }
        } else {
            try {
                const response = await authApi.loginWithPassword({
                    identifier,
                    password
                });
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('phone', response.data.phoneNumber);
                if (onLogin) onLogin(response.data.phoneNumber);
                navigate('/');
            } catch (err) {
                setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await authApi.verifyOtp({ phoneNumber: identifier, otpCode });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('phone', response.data.phoneNumber);
            if (onLogin) onLogin(response.data.phoneNumber);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-split-container">
                <div className="auth-visual-side animate-fade-in-left">
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
                        <p>Experience the finest highway dining on your next journey. Order ahead, skip the wait.</p>
                    </div>
                </div>

                <div className="auth-form-side">
                    <div className="auth-card glass-card animate-fade-in">
                        <h2 className="auth-title">
                            {step === 1 ? 'Welcome Back' : 'Verify OTP'}
                        </h2>
                        <p className="auth-subtitle">
                            {step === 1
                                ? 'Access your PikNGo account'
                                : `Enter the code sent to ${identifier}`}
                        </p>

                        {step === 1 && (
                            <div className="method-toggle">
                                <button
                                    className={method === 'otp' ? 'active' : ''}
                                    onClick={() => { setMethod('otp'); setError(''); }}
                                >
                                    OTP Login
                                </button>
                                <button
                                    className={method === 'password' ? 'active' : ''}
                                    onClick={() => { setMethod('password'); setError(''); }}
                                >
                                    Password
                                </button>
                            </div>
                        )}

                        {error && <div className="error-message">{error}</div>}

                        <form className="auth-form" onSubmit={step === 1 ? handleInitialSubmit : handleVerifyOtp}>
                            {step === 1 ? (
                                <>
                                    <div className="form-group">
                                        <label>{method === 'otp' ? 'Phone Number' : 'Email or Phone'}</label>
                                        <div className="input-wrapper">
                                            {method === 'otp' ? <Phone size={18} className="input-icon" /> : <Mail size={18} className="input-icon" />}
                                            <input
                                                type={method === 'otp' ? 'tel' : 'text'}
                                                placeholder={method === 'otp' ? '+91 9876543210' : 'email@example.com'}
                                                value={identifier}
                                                onChange={(e) => setIdentifier(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {method === 'password' && (
                                        <div className="form-group">
                                            <label>Password</label>
                                            <div className="input-wrapper">
                                                <Lock size={18} className="input-icon" />
                                                <input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="form-group">
                                    <label>Verification Code</label>
                                    <div className="input-wrapper">
                                        <ShieldCheck size={18} className="input-icon" />
                                        <input
                                            type="text"
                                            placeholder="6-digit code"
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="btn-primary w-full" disabled={loading}>
                                {loading ? 'Processing...' : (step === 1 ? (method === 'otp' ? 'Get OTP' : 'Login') : 'Verify & Login')}
                                {!loading && <ArrowRight size={18} style={{ marginLeft: '8px' }} />}
                            </button>

                            {step === 2 && (
                                <button
                                    type="button"
                                    className="btn-secondary w-full"
                                    onClick={() => setStep(1)}
                                    style={{ marginTop: '10px' }}
                                >
                                    Edit {method === 'otp' ? 'Phone' : 'Identifier'}
                                </button>
                            )}
                        </form>

                        <p className="auth-footer">
                            Don't have an account? <NavLink to="/register">Sign Up Now</NavLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
