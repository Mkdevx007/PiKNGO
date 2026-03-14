import React, { useState, useEffect } from 'react';
import { Phone, Lock, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { authApi } from '../../services/api';

const LoginForm = ({ onLogin, onError, loading, setLoading, onForgot }) => {
    const [loginMethod, setLoginMethod] = useState('otp');
    const [otpMethod, setOtpMethod] = useState('phone');
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginOtpCode, setLoginOtpCode] = useState('');
    const [loginStep, setLoginStep] = useState(1);
    const [otpTimer, setOtpTimer] = useState(0);

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
        onError('');
        if (loginMethod === 'otp') {
            try {
                if (otpMethod === 'phone') {
                    await authApi.sendOtp(loginIdentifier);
                } else {
                    await authApi.sendEmailOtp(loginIdentifier);
                }
                setLoginStep(2);
                setOtpTimer(30);
            } catch (err) {
                onError(err.response?.data?.message || 'Failed to send OTP.');
            } finally { setLoading(false); }
        } else {
            try {
                const response = await authApi.loginWithPassword({ identifier: loginIdentifier, password: loginPassword });
                onLogin(response.data);
            } catch (err) {
                onError(err.response?.data?.message || 'Login failed.');
            } finally { setLoading(false); }
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        onError('');
        try {
            const payload = otpMethod === 'phone'
                ? { phoneNumber: loginIdentifier, otpCode: loginOtpCode }
                : { email: loginIdentifier, otpCode: loginOtpCode };
            const response = await authApi.verifyOtp(payload);
            onLogin(response.data);
        } catch (err) {
            onError(err.response?.data?.message || 'Invalid OTP.');
        } finally { setLoading(false); }
    };

    const handleSendOtpAgain = async () => {
        if (otpTimer > 0) return;
        setLoading(true);
        try {
            if (otpMethod === 'phone') {
                await authApi.sendOtp(loginIdentifier);
            } else {
                await authApi.sendEmailOtp(loginIdentifier);
            }
            setOtpTimer(30);
        } catch (err) {
            onError('Failed to resend OTP.');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-card-content">
            <h2 className="auth-title">{loginStep === 1 ? 'Welcome Back' : 'Verify OTP'}</h2>
            {loginStep === 2 && <p className="auth-subtitle">{`Code sent to ${loginIdentifier}`}</p>}
            {loginStep === 1 && (
                <>
                    <div className="method-toggle">
                        <button className={loginMethod === 'otp' ? 'active' : ''} onClick={() => { setLoginMethod('otp'); setLoginIdentifier(''); onError(''); }}>OTP</button>
                        <button className={loginMethod === 'password' ? 'active' : ''} onClick={() => { setLoginMethod('password'); setLoginIdentifier(''); onError(''); }}>Password</button>
                    </div>
                    {loginMethod === 'otp' && (
                        <div className="sub-method-toggle">
                            <button className={otpMethod === 'phone' ? 'active' : ''} onClick={() => { setOtpMethod('phone'); setLoginIdentifier(''); }}>Phone</button>
                            <button className={otpMethod === 'email' ? 'active' : ''} onClick={() => { setOtpMethod('email'); setLoginIdentifier(''); }}>Email</button>
                        </div>
                    )}
                </>
            )}

            <form className="auth-form" onSubmit={loginStep === 1 ? handleLoginInitial : handleVerifyOtp}>
                {loginStep === 1 ? (
                    <div className="animate-slide-in">
                        <div className="form-group">
                            <label>{loginMethod === 'password' ? 'Email/Phone' : (otpMethod === 'phone' ? 'Phone' : 'Email')}</label>
                            <div className="input-wrapper">
                                {loginMethod === 'password' ? <Mail size={18} className="input-icon" /> : (otpMethod === 'phone' ? <Phone size={18} className="input-icon" /> : <Mail size={18} className="input-icon" />)}
                                {loginMethod === 'otp' && otpMethod === 'phone' ? (
                                    <input
                                        type="text"
                                        value={loginIdentifier}
                                        onChange={(e) => setLoginIdentifier(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="10 digit number"
                                        required
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={loginIdentifier}
                                        onChange={(e) => setLoginIdentifier(e.target.value)}
                                        placeholder={otpMethod === 'email' ? 'name@example.com' : ''}
                                        required
                                    />
                                )}
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
                                    <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
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
