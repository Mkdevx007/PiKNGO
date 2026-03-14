import React, { useState } from 'react';
import { Mail, User, Phone, MapPin, Lock, ArrowRight, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../services/api';

const RegisterForm = ({ onSuccess, onError, loading, setLoading }) => {
    const [regStep, setRegStep] = useState(1);
    const [registerData, setRegisterData] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: '', 
        addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
        password: '', confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (regStep === 1) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(registerData.email)) {
                onError('Please enter a valid email address');
                return;
            }
        }

        if (regStep < 3) {
            setRegStep(prev => prev + 1);
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
        setRegStep(prev => Math.max(1, prev - 1));
    };

    const ProgressBar = ({ step }) => (
        <div className="progress-container">
            <div className="progress-bar" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>
    );

    return (
        <div className="auth-card-content">
            <ProgressBar step={regStep} />
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Step {regStep} of 3: {regStep === 1 ? 'Personal Details' : (regStep === 2 ? 'Address Info' : 'Security')}</p>

            <form className="auth-form" onSubmit={handleRegister}>
                {regStep === 1 && (
                    <div className="step-content grid-2 animate-slide-in">
                        <div className="form-group">
                            <label>First Name</label>
                            <div className="input-wrapper">
                                <User size={18} className="input-icon" />
                                <input type="text" placeholder="John" value={registerData.firstName} onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })} required autoFocus />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <div className="input-wrapper">
                                <User size={18} className="input-icon" />
                                <input type="text" placeholder="Doe" value={registerData.lastName} onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-group span-2">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input type="email" placeholder="john@example.com" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-group span-2">
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
                            <label>Address Line 1</label>
                            <div className="input-wrapper">
                                <MapPin size={18} className="input-icon" />
                                <input type="text" placeholder="House No, Street, Area" value={registerData.addressLine1} onChange={(e) => setRegisterData({ ...registerData, addressLine1: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Address Line 2 <span className="text-muted">(Optional)</span></label>
                            <div className="input-wrapper">
                                <MapPin size={18} className="input-icon" />
                                <input type="text" placeholder="Landmark, Near by" value={registerData.addressLine2} onChange={(e) => setRegisterData({ ...registerData, addressLine2: e.target.value })} />
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
                                <label>State</label>
                                <div className="input-wrapper">
                                    <input type="text" placeholder="State" value={registerData.state} onChange={(e) => setRegisterData({ ...registerData, state: e.target.value })} required />
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Pincode</label>
                            <div className="input-wrapper">
                                <input type="text" placeholder="Pincode" value={registerData.pincode} onChange={(e) => setRegisterData({ ...registerData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} required />
                            </div>
                        </div>
                    </div>
                )}

                {regStep === 3 && (
                    <div className="step-content animate-slide-in">
                        <div className="form-group">
                            <label>Create Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} required autoFocus />
                                <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={registerData.confirmPassword} onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} required />
                                <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="form-actions multi-step">
                    {regStep > 1 && (
                        <button type="button" className="btn-secondary flex-1" onClick={prevStep} disabled={loading}>
                            <ChevronLeft size={18} /> Back
                        </button>
                    )}
                    <button type="submit" className="btn-primary flex-2" disabled={loading}>
                        {loading ? <div className="loader"></div> : (regStep === 3 ? 'Complete Registration' : 'Continue')}
                        {regStep < 3 && <ArrowRight size={18} />}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;
