import React, { useState } from 'react';
import { Mail, User, Phone, MapPin, Lock, ArrowRight, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../services/api';

const RegisterForm = ({ onSuccess, onError, loading, setLoading }) => {
    const [regStep, setRegStep] = useState(1);
    const [registerData, setRegisterData] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: '', 
        addressLine1: '', city: '', state: '', pincode: '',
        password: '', confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (regStep === 1) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(registerData.email)) {
                onError('Please enter a valid email address');
                return;
            }
            if (registerData.phoneNumber.length < 10) {
                onError('Please enter a valid 10-digit phone number');
                return;
            }
            setRegStep(2);
            onError('');
            return;
        }

        if (registerData.password !== registerData.confirmPassword) {
            onError('Passwords do not match');
            return;
        }

        setLoading(true);
        onError('');
        try {
            const { confirmPassword, ...backendData } = registerData;
            await authApi.register(backendData);
            onSuccess('Registration successful! Please login.');
        } catch (err) {
            onError(err.response?.data?.message || 'Registration failed.');
        } finally { setLoading(false); }
    };

    const prevStep = (e) => {
        e.preventDefault();
        setRegStep(1);
    };

    return (
        <div className="auth-card-content">
            <div className="progress-container">
                <div className="progress-bar" style={{ width: `${(regStep / 2) * 100}%` }}></div>
            </div>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">{regStep === 1 ? 'Personal & Contact Details' : 'Address & Security'}</p>

            <form className="auth-form" onSubmit={handleRegister}>
                {regStep === 1 && (
                    <div className="step-content animate-slide-in">
                        <div className="grid-2">
                            <div className="form-group">
                                <label>First Name</label>
                                <div className="input-wrapper">
                                    <User size={18} className="input-icon" />
                                    <input type="text" placeholder="John" value={registerData.firstName} onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <div className="input-wrapper">
                                    <User size={18} className="input-icon" />
                                    <input type="text" placeholder="Doe" value={registerData.lastName} onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })} required />
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input type="email" placeholder="john@example.com" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Mobile Number</label>
                            <div className="input-wrapper">
                                <Phone size={18} className="input-icon" />
                                <input
                                    type="tel"
                                    value={registerData.phoneNumber}
                                    onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                    placeholder="10 digit number"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                )}

                {regStep === 2 && (
                    <div className="step-content animate-slide-in">
                        <div className="form-group">
                            <label>Street Address</label>
                            <div className="input-wrapper">
                                <MapPin size={18} className="input-icon" />
                                <input type="text" placeholder="House No, Street" value={registerData.addressLine1} onChange={(e) => setRegisterData({ ...registerData, addressLine1: e.target.value })} required />
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label>City</label>
                                <div className="input-wrapper">
                                    <input type="text" placeholder="City" value={registerData.city} onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Pincode</label>
                                <div className="input-wrapper">
                                    <input type="text" placeholder="6 Digits" value={registerData.pincode} onChange={(e) => setRegisterData({ ...registerData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} required />
                                </div>
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} required />
                                    <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Confirm</label>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={registerData.confirmPassword} onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} required />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="form-actions multi-step">
                    {regStep === 2 && (
                        <button type="button" className="btn-secondary flex-1" onClick={prevStep} disabled={loading}>
                            <ChevronLeft size={18} />
                        </button>
                    )}
                    <button type="submit" className="btn-primary w-full" disabled={loading}>
                        {loading ? 'Processing...' : (regStep === 1 ? 'Next Step' : 'Create Account')}
                        {regStep === 1 && <ArrowRight size={18} />}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;
