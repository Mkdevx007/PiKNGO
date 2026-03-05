import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Calendar, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { authApi } from '../services/api';
import Logo from '../components/Logo/Logo';
import './Auth.css';

const RegistrationScreen = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dob: '',
        address: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            // Mapping to Backend DTO: firstName, lastName, email, phoneNumber, password, dob, address
            const backendData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                password: formData.password,
                dob: formData.dob,
                address: formData.address
            };

            await authApi.register(backendData);
            setSuccess('Registration successful! Please login.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                        <p>Join the elite community of PikNGo travelers and experience the finest highway dining.</p>
                    </div>
                </div>

                <div className="auth-form-side">
                    <div className="auth-card glass-card animate-fade-in wide">
                        <h2 className="auth-title">Create Account</h2>
                        <p className="auth-subtitle">Join the elite community of PikNGo travelers</p>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <form className="auth-form grid-2" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>First Name</label>
                                <div className="input-wrapper">
                                    <User size={18} className="input-icon" />
                                    <input
                                        name="firstName"
                                        type="text"
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Last Name</label>
                                <div className="input-wrapper">
                                    <User size={18} className="input-icon" />
                                    <input
                                        name="lastName"
                                        type="text"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Mobile Number</label>
                                <div className="input-wrapper">
                                    <Phone size={18} className="input-icon" />
                                    <input
                                        name="phoneNumber"
                                        type="tel"
                                        placeholder="+91 9876543210"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={18} className="input-icon" />
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Date of Birth</label>
                                <div className="input-wrapper">
                                    <Calendar size={18} className="input-icon" />
                                    <input
                                        name="dob"
                                        type="date"
                                        value={formData.dob}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <div className="input-wrapper">
                                    <MapPin size={18} className="input-icon" />
                                    <input
                                        name="address"
                                        type="text"
                                        placeholder="Full Address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Confirm Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary w-full span-2" disabled={loading}>
                                {loading ? 'Creating Account...' : 'Sign Up Now'}
                            </button>
                        </form>

                        <p className="auth-footer">
                            Already a member? <NavLink to="/login">Login Here</NavLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationScreen;
