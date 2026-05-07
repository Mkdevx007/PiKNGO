import React, { useState } from 'react';
import { Mail, User, Phone, MapPin, Lock, ArrowRight, ChevronLeft, Eye, EyeOff, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api';

import { useToast } from '../../context/ToastContext';
import { useForm } from '../../hooks/useForm';

const RegisterForm = ({ onSuccess }) => {
    const { showToast } = useToast();
    const [regStep, setRegStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { values, handleChange } = useForm({
        firstName: '', lastName: '', email: '', phoneNumber: '', 
        addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
        password: '', confirmPassword: ''
    });

    const handleRegister = async (e) => {
        e.preventDefault();

        if (regStep === 1) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(values.email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            // Strict 10-digit phone validation
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(values.phoneNumber)) {
                showToast('Enter a valid 10-digit mobile number starting with 6-9', 'error');
                return;
            }
            setRegStep(2);
            return;
        }

        if (regStep === 2) {
            if (!values.addressLine1 || !values.city || !values.state || !values.pincode) {
                showToast('Please fill in all required address fields', 'error');
                return;
            }
            if (values.pincode.length !== 6) {
                showToast('Pincode must be exactly 6 digits', 'error');
                return;
            }
            setRegStep(3);
            return;
        }

        // Strict Password Validation: Min 8 chars, 1 upper, 1 special
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!passwordRegex.test(values.password)) {
            showToast('Password must be 8+ chars with 1 uppercase & 1 special character', 'error');
            return;
        }

        if (values.password !== values.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        setLoading(true);
        try {
            const { confirmPassword, ...backendData } = values;
            await authApi.register(backendData);
            showToast('Account created! Please login to continue.', 'success');
            onSuccess();
        } catch (err) {
            showToast(err.message || 'Registration failed', 'error');
        } finally { setLoading(false); }
    };

    const prevStep = (e) => {
        e.preventDefault();
        setRegStep(prev => prev - 1);
    };

    return (
        <div className="auth-card-content">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">
                {regStep === 1 && 'Step 1: Personal Details'}
                {regStep === 2 && 'Step 2: Address Details'}
                {regStep === 3 && 'Step 3: Account Security'}
            </p>

            <form className="auth-form" onSubmit={handleRegister}>
                {regStep === 1 && (
                    <div className="step-content animate-slide-in">
                    <div className="grid-2">
                        <div className="form-group">
                            <label>First Name</label>
                            <div className="input-wrapper">
                                <User size={18} className="input-icon" />
                                <input type="text" name="firstName" placeholder="John" value={values.firstName} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <div className="input-wrapper">
                                <User size={18} className="input-icon" />
                                <input type="text" name="lastName" placeholder="Doe" value={values.lastName} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input type="email" name="email" placeholder="john@example.com" value={values.email} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Mobile Number</label>
                        <div className="input-wrapper">
                            <Phone size={18} className="input-icon" />
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={values.phoneNumber}
                                onChange={handleChange}
                                placeholder="10 digit number"
                                required
                            />
                        </div>
                    </div>
                    </div>
                )}

                {regStep === 2 && (
                    <div className="step-content animate-slide-in">
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Street Address</label>
                            <div className="input-wrapper">
                                <MapPin size={18} className="input-icon" />
                                <input type="text" name="addressLine1" placeholder="House No, Street" value={values.addressLine1} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Area / Landmark</label>
                            <div className="input-wrapper no-icon">
                                <input type="text" name="addressLine2" placeholder="Society, Area" value={values.addressLine2} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>City</label>
                            <div className="input-wrapper no-icon">
                                <input type="text" name="city" placeholder="City" value={values.city} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>State</label>
                            <div className="input-wrapper no-icon">
                                <input type="text" name="state" placeholder="State" value={values.state} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Pincode</label>
                        <div className="input-wrapper no-icon">
                            <input type="text" name="pincode" placeholder="6 Digits" value={values.pincode} onChange={handleChange} required />
                        </div>
                    </div>
                    </div>
                )}

                {regStep === 3 && (
                    <div className="step-content animate-slide-in">
                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" value={values.password} onChange={handleChange} required />
                                <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Confirm</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="••••••••" value={values.confirmPassword} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>
                )}

                <div className="form-actions multi-step">
                    {regStep > 1 && (
                        <button type="button" className="btn-secondary flex-1" onClick={prevStep} disabled={loading}>
                            <ChevronLeft size={18} />
                        </button>
                    )}
                    <button type="submit" className="btn-primary w-full" disabled={loading}>
                        {loading ? 'Processing...' : (regStep < 3 ? 'Next Step' : 'Create Account')}
                        {regStep < 3 && <ArrowRight size={18} />}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;
