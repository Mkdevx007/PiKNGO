import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Camera, Edit2, Shield, Trash2, Lock, ShieldCheck } from 'lucide-react';
import { authApi } from '../services/api';
import './Profile.css';

const ProfileScreen = () => {
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({ addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' });

    const fetchProfile = async () => {
        try {
            const response = await authApi.getProfile();
            setUser(response.data);
            fetchAddresses(response.data.id);
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async (userId) => {
        try {
            const response = await authApi.getAddresses(userId);
            setAddresses(response.data);
        } catch (err) {
            console.error('Failed to fetch addresses', err);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            await authApi.addAddress(user.id, newAddress);
            setSuccess('Address added successfully!');
            setShowAddressForm(false);
            setNewAddress({ addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' });
            fetchAddresses(user.id);
        } catch (err) {
            setError('Failed to add address');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            await authApi.deleteAddress(user.id, addressId);
            fetchAddresses(user.id);
        } catch (err) {
            setError('Failed to delete address');
        }
    };

    const handleDeleteAccount = async (soft = true) => {
        const type = soft ? 'soft' : 'permanent';
        if (!window.confirm(`Are you sure you want to ${type} delete your account? This cannot be undone.`)) return;
        try {
            await authApi.deleteProfile(soft);
            localStorage.clear();
            window.location.href = '/login';
        } catch (err) {
            setError('Failed to delete account');
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="loader"></div>
            <p>Loading your elite profile...</p>
        </div>
    );

    return (
        <div className="profile-page">
            <div className="profile-hero">
                <div className="container">
                    <div className="profile-header-card glass animate-fade-in">
                        <div className="profile-avatar-wrapper">
                            <div className="profile-avatar-large">
                                <User size={48} />
                            </div>
                            <button className="edit-avatar-btn"><Camera size={16} /></button>
                        </div>
                        <div className="profile-main-info">
                            <h1 className="user-full-name">{user?.firstName} {user?.lastName}</h1>
                            <p className="user-membership">💎 Elite Member</p>
                        </div>
                        <div className="profile-header-actions">
                            <button className="btn-primary-slim"><Edit2 size={16} /> Edit Profile</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-content container">
                {error && <div className="error-message mb-4">{error}</div>}
                {success && <div className="success-message mb-4">{success}</div>}

                <div className="profile-grid">
                    <div className="profile-card glass animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="card-header">
                            <User size={20} />
                            <h3>Personal Details</h3>
                        </div>
                        <div className="info-list">
                            <div className="info-row">
                                <Mail size={16} />
                                <div className="info-details">
                                    <label>Email Address</label>
                                    <p>{user?.email}</p>
                                </div>
                            </div>
                            <div className="info-row">
                                <Phone size={16} />
                                <div className="info-details">
                                    <label>Phone Number</label>
                                    <p>{user?.phoneNumber}</p>
                                </div>
                            </div>
                            <div className="info-row">
                                <Calendar size={16} />
                                <div className="info-details">
                                    <label>Date of Birth</label>
                                    <p>{user?.dob}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-card glass animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="card-header">
                            <Shield size={20} />
                            <h3>Security & Access</h3>
                        </div>
                        <div className="info-list">
                            <div className="info-row">
                                <Lock size={16} />
                                <div className="info-details">
                                    <label>Password</label>
                                    <p>••••••••••••</p>
                                </div>
                                <button className="btn-text">Change</button>
                            </div>
                            <div className="info-row">
                                <ShieldCheck size={16} />
                                <div className="info-details">
                                    <label>Two-Factor Auth</label>
                                    <p>Enabled</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-card glass animate-fade-in-up span-full" style={{ animationDelay: '0.3s' }}>
                        <div className="card-header">
                            <MapPin size={20} />
                            <h3>Saved Addresses</h3>
                        </div>
                        <div className="address-list">
                            {addresses.length > 0 ? addresses.map(addr => (
                                <div key={addr.id} className="address-box mb-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{addr.addressLine1}</p>
                                        <p className="text-sm text-gray-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                                    </div>
                                    <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )) : <p className="text-gray-500 italic">No addresses saved yet.</p>}
                        </div>

                        {showAddressForm ? (
                            <form onSubmit={handleAddAddress} className="mt-4 grid grid-cols-2 gap-3 glass p-4 rounded-xl">
                                <input className="span-2 bg-transparent border-b border-gray-600 p-2" placeholder="Address Line 1" value={newAddress.addressLine1} onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })} required />
                                <input className="span-2 bg-transparent border-b border-gray-600 p-2" placeholder="Address Line 2 (Optional)" value={newAddress.addressLine2} onChange={e => setNewAddress({ ...newAddress, addressLine2: e.target.value })} />
                                <input className="bg-transparent border-b border-gray-600 p-2" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                                <input className="bg-transparent border-b border-gray-600 p-2" placeholder="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
                                <input className="bg-transparent border-b border-gray-600 p-2" placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} required />
                                <div className="span-2 flex gap-2">
                                    <button type="submit" className="btn-primary-slim">Save</button>
                                    <button type="button" onClick={() => setShowAddressForm(false)} className="btn-secondary-slim">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <button onClick={() => setShowAddressForm(true)} className="btn-secondary-slim" style={{ marginTop: '1.5rem' }}>+ Add New Address</button>
                        )}
                    </div>

                    <div className="profile-card danger-card animate-fade-in-up span-full" style={{ animationDelay: '0.4s' }}>
                        <div className="card-header">
                            <Trash2 size={20} />
                            <h3>Danger Zone</h3>
                        </div>
                        <p>Once you delete your account, there is no going back. Please be certain.</p>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => handleDeleteAccount(true)} className="btn-danger-outline">Soft Delete</button>
                            <button onClick={() => handleDeleteAccount(false)} className="btn-danger">Permanent Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileScreen;
