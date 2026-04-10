import React, { useState, useEffect } from 'react';
import { User, Phone, Lock, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { authApi } from '../../services/api';

import { useToast } from '../../context/ToastContext';
import { useForm } from '../../hooks/useForm';

const LoginForm = ({ onLogin, onForgot }) => {
    const { showToast } = useToast();
    const [loginMethod, setLoginMethod] = useState('otp');
    const [loginStep, setLoginStep] = useState(1);
    const [otpTimer, setOtpTimer] = useState(0);
    const [loading, setLoading] = useState(false);

    const { values, handleChange, resetForm } = useForm({
        identifier: '',
        password: '',
        otpCode: ''
    });

    useEffect(() => {
        let timer;
        if (otpTimer > 0) {
            timer = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [otpTimer]);

    const handleLoginInitial = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (loginMethod === 'otp') {
            try {
                const isEmail = values.identifier.includes('@');
                if (isEmail) {
                    await authApi.sendEmailOtp(values.identifier);
                } else {
                    await authApi.sendOtp(values.identifier);
                }
                setLoginStep(2);
                setOtpTimer(30);
                showToast(`OTP sent to ${values.identifier}`, 'info');
            } catch (err) {
                showToast(err.message || 'Failed to send OTP', 'error');
            } finally { setLoading(false); }
        } else {
            try {
                const response = await authApi.loginWithPassword({ 
                    identifier: values.identifier, 
                    password: values.password 
                });
                showToast('Login successful! Welcome back.', 'success');
                onLogin(response);
            } catch (err) {
                showToast(err.message || 'Invalid credentials', 'error');
            } finally { setLoading(false); }
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const isEmail = values.identifier.includes('@');
            const payload = isEmail 
                ? { email: values.identifier, otpCode: values.otpCode }
                : { phoneNumber: values.identifier, otpCode: values.otpCode };
                
            const response = await authApi.verifyOtp(payload);
            showToast('Verification successful', 'success');
            onLogin(response);
        } catch (err) {
            showToast(err.message || 'Invalid verification code', 'error');
        } finally { setLoading(false); }
    };

    const handleSendOtpAgain = async () => {
        if (otpTimer > 0) return;
        setLoading(true);
        try {
            const isEmail = values.identifier.includes('@');
            if (isEmail) {
                await authApi.sendEmailOtp(values.identifier);
            } else {
                await authApi.sendOtp(values.identifier);
            }
            setOtpTimer(45);
            showToast('New code dispatched', 'success');
        } catch (err) {
            showToast('Failed to resend code', 'error');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-card-content">
            <h2 className="auth-title">{loginStep === 1 ? 'Welcome Back' : 'Verify OTP'}</h2>
            {loginStep === 2 && <p className="auth-subtitle">{`Code sent to ${values.identifier}`}</p>}
            {loginStep === 1 && (
                <>
                    <div className="segmented-control">
                        <div 
                            className="segmented-indicator" 
                            style={{ transform: loginMethod === 'password' ? 'translateX(100%)' : 'translateX(0)' }}
                        ></div>
                        <button 
                            type="button" 
                            className={loginMethod === 'otp' ? 'active' : ''} 
                            onClick={() => { setLoginMethod('otp'); resetForm(); }}
                        >
                            OTP
                        </button>
                        <button 
                            type="button" 
                            className={loginMethod === 'password' ? 'active' : ''} 
                            onClick={() => { setLoginMethod('password'); resetForm(); }}
                        >
                            Password
                        </button>
                    </div>
                </>
            )}

            <form className="auth-form" onSubmit={loginStep === 1 ? handleLoginInitial : handleVerifyOtp}>
                {loginStep === 1 ? (
                    <div className="animate-slide-in">
                        <div className="form-group">
                            <label>Email or Phone Number</label>
                            <div className="input-wrapper">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    name="identifier"
                                    value={values.identifier}
                                    onChange={handleChange}
                                    placeholder={loginMethod === 'otp' ? 'Email or Mobile' : 'Email or Phone'}
                                    required
                                />
                            </div>
                        </div>
                        {loginMethod === 'password' && (
                            <div className="form-group">
                                <div className="flex justify-between items-center">
                                    <label>Password</label>
                                    <a href="#" className="forgot-link text-sm" onClick={(e) => { e.preventDefault(); onForgot?.(); }}>Forgot Password?</a>
                                </div>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input 
                                        type="password" 
                                        name="password"
                                        value={values.password} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="animate-slide-in">
                        <div className="form-group">
                            <div className="flex justify-between items-center">
                                <label>Verification Code</label>
                                <button
                                    type="button"
                                    className={`otp-resend-link-elite ${otpTimer > 0 ? 'disabled' : 'active'}`}
                                    onClick={handleSendOtpAgain}
                                    disabled={otpTimer > 0 || loading}
                                >
                                    {otpTimer > 0 ? (
                                        <span className="timer-text-elite">Resend in <span className="seconds">{otpTimer}s</span></span>
                                    ) : (
                                        <span className="resend-text-elite">Resend OTP</span>
                                    )}
                                </button>
                            </div>
                            <div className="input-wrapper">
                                <ShieldCheck size={18} className="input-icon" />
                                <input 
                                    type="text" 
                                    name="otpCode"
                                    maxLength={6} 
                                    placeholder="000000" 
                                    value={values.otpCode} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                        </div>
                    </div>
                )}
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                    {loading ? 'Wait...' : (loginStep === 1 ? 'Login' : 'Verify')} <ArrowRight size={18} />
                </button>
            </form>
        </div>
    );
};

export default LoginForm;
