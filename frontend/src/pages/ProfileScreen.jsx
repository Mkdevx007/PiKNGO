import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Camera, Edit2, Shield, Trash2, Lock, ShieldCheck, Plus, X, Loader2, CheckCircle, AlertCircle, LayoutDashboard, Store, ClipboardList, ArrowUpRight } from 'lucide-react';
import { authApi, addressApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import './Profile.css';

const ProfileScreen = ({ onProfileUpdate }) => {
    const { showToast } = useToast();
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef(null);

    const [editData, setEditData] = useState({ 
        firstName: '', lastName: '', email: '', 
        addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
        profileImageUrl: ''
    });

    const getPhotoUrl = (userId) => {
        if (user?.profileImageUrl) return user.profileImageUrl;
        if (!userId) return '';
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';
        return `${baseUrl}/users/profile/photo/${userId}?t=${new Date().getTime()}`;
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploadingPhoto(true);
        try {
            await authApi.uploadProfilePhoto(formData);
            showToast('Profile photo updated successfully!', 'success');
            const response = await authApi.getProfile();
            setUser(response);
            if (onProfileUpdate) onProfileUpdate(response);
        } catch (err) {
            showToast('Failed to upload photo', 'error');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({ 
        addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', type: 'Home' 
    });

    const fetchProfile = async () => {
        try {
            const response = await authApi.getProfile();
            setUser(response);
            setEditData({
                firstName: response.firstName || '',
                lastName: response.lastName || '',
                email: response.email || '',
                addressLine1: response.addressLine1 || '',
                addressLine2: response.addressLine2 || '',
                city: response.city || '',
                state: response.state || '',
                pincode: response.pincode || '',
                profileImageUrl: response.profileImageUrl || '',
            });
            await fetchAddresses();
        } catch (err) {
            showToast('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const response = await addressApi.getAll();
            const normalized = Array.isArray(response) ? response : (response?.content || []);
            setAddresses(normalized);
        } catch (err) {
            console.error('Failed to fetch addresses:', err);
            setAddresses([]);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authApi.updateProfile(editData);
            setUser(response);
            if (onProfileUpdate) onProfileUpdate(response);
            await fetchAddresses(); 
            showToast('Profile updated successfully!', 'success');
            setIsEditing(false);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addressApi.create(newAddress);
            showToast('Address added successfully!', 'success');
            setShowAddressForm(false);
            setNewAddress({ addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', type: 'Home' });
            await fetchAddresses();
        } catch (err) {
            showToast('Failed to add address', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        // Elite deletion feedback
        try {
            await addressApi.delete(id);
            showToast('Address removed', 'success');
            await fetchAddresses();
        } catch (err) {
            showToast('Failed to delete address', 'error');
        }
    };

    const handleDeleteAccount = async (soft = true) => {
        const type = soft ? 'soft' : 'permanent';
        if (!window.confirm(`Are you sure you want to ${type} delete your account? This cannot be undone.`)) return;
        try {
            await authApi.deleteProfile(soft);
            showToast('Account deleted. Goodbye!', 'info');
            localStorage.clear();
            window.location.href = '/login';
        } catch (err) {
            showToast('Failed to delete account', 'error');
        }
    };

    if (loading && !user) return (
        <div className="checkout-page processing-overlay">
            <div className="loader-ring"></div>
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
                                {uploadingPhoto ? (
                                    <Loader2 size={32} className="animate-spin opacity-50" />
                                ) : user?.profileImageUrl || user?.id ? (
                                    <img 
                                        src={getPhotoUrl(user?.id)} 
                                        alt="Profile" 
                                        className="profile-img-large" 
                                        onError={(e) => {
                                            if (!user?.profileImageUrl) {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }
                                        }}
                                    />
                                ) : null}
                                <User size={48} style={{ display: (user?.profileImageUrl || user?.id) ? 'none' : 'block' }} />
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                accept="image/*" 
                                onChange={handlePhotoUpload} 
                            />
                            <button 
                                className="edit-avatar-btn" 
                                onClick={() => fileInputRef.current.click()}
                                disabled={uploadingPhoto}
                            >
                                {uploadingPhoto ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                            </button>
                        </div>
                        <div className="profile-main-info">
                            <h1 className="user-full-name">{user?.firstName} {user?.lastName}</h1>
                            <p className="user-membership">💎 Elite Member</p>
                        </div>
                        <div className="profile-header-actions">
                            <button
                                className={`btn-primary-slim ${isEditing ? 'active' : ''}`}
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                <Edit2 size={16} /> {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-content container">
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
                        </div>
                    </div>
                    
                    {user?.role === 'ADMIN' && (
                        <div className="profile-card glass admin-card animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                            <div className="card-header">
                                <ShieldCheck size={20} />
                                <h3>Administrative Access</h3>
                            </div>
                            <p className="text-sm opacity-80 mb-6">You are signed in as an administrator. Manage restaurants, users, and platform settings from the command center.</p>
                            <NavLink to="/admin/dashboard" className="admin-dashboard-link">
                                <div className="link-content">
                                    <LayoutDashboard size={20} />
                                    <span>Enter Admin Dashboard</span>
                                </div>
                                <ArrowUpRight size={18} />
                            </NavLink>
                        </div>
                    )}

                    <div className="profile-card glass animate-fade-in-up span-full">
                        <div className="card-header flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                                <MapPin size={20} />
                                <h3>Saved Addresses</h3>
                            </div>
                            <button className="btn-text flex items-center gap-1" onClick={() => setShowAddressForm(!showAddressForm)}>
                                {showAddressForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add New</>}
                            </button>
                        </div>

                        {showAddressForm && (
                            <form onSubmit={handleAddAddress} className="address-form glass mb-4 p-4 animate-slide-in">
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Address Line 1</label>
                                        <input type="text" value={newAddress.addressLine1} onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Address Line 2 (Optional)</label>
                                        <input type="text" value={newAddress.addressLine2} onChange={e => setNewAddress({ ...newAddress, addressLine2: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input type="text" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <input type="text" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Pincode</label>
                                        <input type="text" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Address Type</label>
                                        <select 
                                            value={newAddress.type} 
                                            onChange={e => setNewAddress({ ...newAddress, type: e.target.value })}
                                            className="address-type-select"
                                        >
                                            <option value="Home">Home</option>
                                            <option value="Work">Work</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
                                    {loading ? 'Adding...' : 'Save New Address'}
                                </button>
                            </form>
                        )}

                        <div className="address-list grid-2 mt-4">
                            {addresses.length > 0 ? (
                                addresses.map((addr) => (
                                    <div key={addr._id || addr.id} className="address-item glass animate-fade-in">
                                        <div className="address-content">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold">{addr.addressLine1}</p>
                                                <span className="address-type-tag">{addr.type || 'Home'}</span>
                                            </div>
                                            {addr.addressLine2 && <p className="text-sm opacity-80">{addr.addressLine2}</p>}
                                            <p className="text-sm opacity-80">{addr.city}, {addr.state} - {addr.pincode}</p>
                                        </div>
                                        <div className="address-actions">
                                            <button className="delete-btn" onClick={() => handleDeleteAddress(addr._id || addr.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center opacity-60 py-4 span-full">No saved addresses yet.</p>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="profile-card glass animate-fade-in-up span-full">
                            <div className="card-header">
                                <Edit2 size={20} />
                                <h3>Update Profile Information</h3>
                            </div>
                            <form onSubmit={handleUpdateProfile} className="edit-profile-form">
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input type="text" value={editData.firstName} onChange={e => setEditData({ ...editData, firstName: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input type="text" value={editData.lastName} onChange={e => setEditData({ ...editData, lastName: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} required />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Address Line 1</label>
                                        <input type="text" value={editData.addressLine1} onChange={e => setEditData({ ...editData, addressLine1: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Address Line 2</label>
                                        <input type="text" value={editData.addressLine2} onChange={e => setEditData({ ...editData, addressLine2: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input type="text" value={editData.city} onChange={e => setEditData({ ...editData, city: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <input type="text" value={editData.state} onChange={e => setEditData({ ...editData, state: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Pincode</label>
                                        <input type="text" value={editData.pincode} onChange={e => setEditData({ ...editData, pincode: e.target.value })} />
                                    </div>
                                    <div className="form-group span-full">
                                        <label>Profile Image URL</label>
                                        <input 
                                            type="text" 
                                            placeholder="Paste image URL here"
                                            value={editData.profileImageUrl} 
                                            onChange={e => setEditData({ ...editData, profileImageUrl: e.target.value })} 
                                        />
                                        <p className="text-xs opacity-60 mt-1">Provide a URL for your profile picture (e.g. from Unsplash or a public link)</p>
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
                                    {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="profile-card glass animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="card-header">
                            <MapPin size={20} />
                            <h3>Primary Location</h3>
                        </div>
                        <div className="info-list">
                            <div className="info-row">
                                <MapPin size={16} />
                                <div className="info-details">
                                    <label>Home Address</label>
                                    <p>{user?.addressLine1 ? `${user.addressLine1}, ${user.city}, ${user.state}` : <span className="text-gray-500 italic">Not set</span>}</p>
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
