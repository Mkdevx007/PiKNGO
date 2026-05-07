import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    PlusCircle, Search, Filter, 
    MapPin, Star, Clock, Image as ImageIcon,
    X, Edit3, ClipboardList, Utensils
} from 'lucide-react';
import { restaurantApi, orderApi } from '../services/api';
import MapPicker from '../components/MapPicker/MapPicker';
import './ManageRestaurants.css';

import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/Common/Skeleton';

const ManageRestaurants = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [editingRes, setEditingRes] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    
    const [formData, setFormData] = useState({
        restaurantName: '',
        address: '',
        latitude: 18.5204,
        longitude: 73.8567,
        category: 'Indian',
        rating: 4.5,
        deliveryTime: '30',
        image: '',
        isActive: true
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const res = await restaurantApi.getAllAdmin();
            const data = res;
            if (data) {
                const arr = Array.isArray(data) ? data : (data.content || []);
                const normalized = arr.map(r => ({
                    ...r,
                    isActive: r.isActive !== undefined ? r.isActive : r.active
                }));
                setRestaurants(normalized);
            }
        } catch (err) {
            console.error("Failed to fetch restaurants:", err);
            showToast('Failed to load restaurants', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
        }));
    };

    const handleLocationChange = (lat, lng) => {
        setFormData(prev => ({
            ...prev,
            latitude: parseFloat(lat.toFixed(6)),
            longitude: parseFloat(lng.toFixed(6))
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation: Ensure coordinates are set (not at default Pune location if creating new)
        if (!formData.latitude || !formData.longitude || (formData.latitude === 18.5204 && formData.longitude === 73.8567 && !editingRes)) {
            showToast('Please pick a specific location on the map', 'warning');
            return;
        }

        setSubmitting(true);
        try {
            const dataToSave = {
                restaurantName: formData.restaurantName,
                address: formData.address,
                latitude: formData.latitude,
                longitude: formData.longitude,
                category: formData.category,
                rating: parseFloat(formData.rating),
                deliveryTime: formData.deliveryTime.toString(),
                imageUrl: formData.image,
                isActive: formData.isActive
            };

            if (editingRes) {
                await restaurantApi.update(editingRes.id, dataToSave);
                showToast(`${formData.restaurantName} updated successfully`, 'success');
            } else {
                await restaurantApi.create(dataToSave);
                showToast(`${formData.restaurantName} added to the network`, 'success');
            }
            setViewMode('list');
            setEditingRes(null);
            fetchRestaurants();
        } catch (err) {
            console.error("Failed to save restaurant:", err);
            showToast('Error saving restaurant data', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (res) => {
        try {
            const currentStatus = res.isActive !== false;
            const updatedData = {
                restaurantName: res.restaurantName,
                address: res.address,
                latitude: res.latitude,
                longitude: res.longitude,
                isActive: !currentStatus,
                category: res.category,
                rating: res.rating,
                deliveryTime: res.deliveryTime,
                imageUrl: res.imageUrl || res.image
            };
            await restaurantApi.update(res.id, updatedData);
            setRestaurants(prev => prev.map(r => r.id === res.id ? { ...r, isActive: !currentStatus } : r));
            showToast(`${res.restaurantName} is now ${!currentStatus ? 'Active' : 'Inactive'}`, 'info');
        } catch (err) {
            console.error("Failed to toggle status:", err);
            showToast('Failed to update status', 'error');
        }
    };

    const filteredRestaurants = restaurants.filter(r => {
        const matchesSearch = (r.restaurantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (r.address || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const isActuallyActive = r.isActive !== false;
        const matchesStatus = statusFilter === 'All' || 
                             (statusFilter === 'Active' && isActuallyActive) || 
                             (statusFilter === 'Inactive' && !isActuallyActive);
        
        return matchesSearch && matchesStatus;
    });


    return (
        <div className="manage-page animate-fade-in">
            <div className="container">
                {viewMode === 'list' ? (
                    <>
                        <header className="manage-header elite-header-card">
                            <div className="header-left">
                                <span className="elite-h-accent">NODE REGISTRY // NETWORK STATUS</span>
                                <h1>Manage <span className="gradient-text">Restaurants</span></h1>
                                <p>Surveillance and configuration of partner nodes</p>
                            </div>
                            <button className="btn-primary-glow" onClick={() => setViewMode('form')}>
                                <PlusCircle size={20} className="btn-icon-pulse" />
                                <span>Add New Restaurant</span>
                            </button>
                        </header>

                        <div className="manage-controls glass-card">
                            <div className="search-wrapper">
                                <Search size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search by name or location..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <button className={`filter-pill ${statusFilter === 'All' ? 'active' : ''}`} onClick={() => setStatusFilter('All')}>All</button>
                                <button className={`filter-pill ${statusFilter === 'Active' ? 'active' : ''}`} onClick={() => setStatusFilter('Active')}>Active</button>
                                <button className={`filter-pill ${statusFilter === 'Inactive' ? 'active' : ''}`} onClick={() => setStatusFilter('Inactive')}>Inactive</button>
                                <div className="divider"></div>
                                <button className="btn-icon-glass"><Filter size={18} /></button>
                            </div>
                        </div>

                        <div className="restaurants-grid">
                            {loading ? (
                                <div className="loading-grid">
                                    {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
                                </div>
                            ) : (
                                filteredRestaurants.map((res) => (
                                    <div key={res.id} className="res-admin-card glass-card animate-scale-in">
                                        <div className="card-banner">
                                            <img src={res.imageUrl || res.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1470'} alt={res.restaurantName} />
                                            <div className="card-overlay"></div>
                                            <div 
                                                className={`status-pill ${res.isActive !== false ? 'active' : 'inactive'}`}
                                                onClick={(e) => { e.stopPropagation(); handleToggleStatus(res); }}
                                                style={{ cursor: 'pointer' }}
                                                title="Click to toggle status"
                                            >
                                                <span className="elite-status-dot active"></span>
                                                {res.isActive !== false ? 'LIVE' : 'OFFLINE'}
                                            </div>
                                            <div className="card-rating-chip">
                                                <Star size={12} fill="currentColor" />
                                                <span>{res.rating || '4.5'}</span>
                                            </div>
                                            {(!res.latitude || !res.longitude) && (
                                                <div className="location-warning-badge">
                                                    MISSING GPS
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-body">
                                            <div className="card-title-row">
                                                <h3>{res.restaurantName}</h3>
                                                <div className="category-tag">{res.category || 'General'}</div>
                                            </div>
                                            
                                            <div className="res-details">
                                                <div className="detail-item">
                                                    <MapPin size={14} />
                                                    <span>{res.address?.substring(0, 35)}{res.address?.length > 35 ? '...' : ''}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <Clock size={14} />
                                                    <span>{res.deliveryTime || '30-40'} min</span>
                                                </div>
                                            </div>

                                            <div className="card-actions-grid">
                                                <button className="action-btn menu" onClick={() => navigate(`/admin/menu/${res.id}`)}>
                                                    <Utensils size={16} />
                                                    <span>Menu</span>
                                                </button>
                                                <button className="action-btn edit" onClick={() => {
                                                    setEditingRes(res);
                                                    setFormData({
                                                        restaurantName: res.restaurantName || '',
                                                        address: res.address || '',
                                                        category: res.category || 'Indian',
                                                        rating: (res.rating || '4.5').toString(),
                                                        deliveryTime: res.deliveryTime || '30',
                                                        image: res.imageUrl || res.image || '',
                                                        isActive: res.isActive !== false,
                                                        latitude: res.latitude || 18.5204,
                                                        longitude: res.longitude || 73.8567
                                                    });
                                                    setViewMode('form');
                                                }}>
                                                    <Edit3 size={16} />
                                                    <span>Edit</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="form-page-container animate-fade-in">
                        <header className="panel-header">
                            <div>
                                <h2>{editingRes ? 'Edit' : 'Add New'} <span className="gradient-text">Restaurant</span></h2>
                                <p className="subtitle">Fill in the details to {editingRes ? 'update' : 'register'} the restaurant</p>
                            </div>
                            <button className="btn-icon-glass" onClick={() => { setViewMode('list'); setEditingRes(null); }}><X size={24} /></button>
                        </header>
                        
                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="form-main-grid two-cols">
                                <div className="form-column">
                                    <div className="form-section glass">
                                        <h4><Utensils size={14} /> Basic Information</h4>
                                        <div className="input-field">
                                            <label>Restaurant Name</label>
                                            <input 
                                                type="text" name="restaurantName" required 
                                                value={formData.restaurantName} onChange={handleInputChange}
                                                placeholder="e.g. Royal Punjab Express"
                                            />
                                        </div>
                                        <div className="input-grid">
                                            <div className="input-field">
                                                <label>Category</label>
                                                <select name="category" value={formData.category} onChange={handleInputChange}>
                                                    <option value="Indian">Indian</option>
                                                    <option value="Fast Food">Fast Food</option>
                                                    <option value="Chinese">Chinese</option>
                                                    <option value="Italian">Italian</option>
                                                    <option value="Street Food">Street Food</option>
                                                </select>
                                            </div>
                                            <div className="input-field">
                                                <label>Rating</label>
                                                <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-section glass">
                                        <h4><Star size={14} /> Metrics & Media</h4>
                                        <div className="input-grid">
                                            <div className="input-field">
                                                <label>Delivery (min)</label>
                                                <input type="number" name="deliveryTime" value={formData.deliveryTime} onChange={handleInputChange} />
                                            </div>
                                            <div className="input-field">
                                                <label>Active Status</label>
                                                <div className="checkbox-wrapper">
                                                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                                                    <span>Online / Visible</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="input-field">
                                            <label>Image URL</label>
                                            <div className="url-input-wrapper">
                                                <ImageIcon size={14} />
                                                <input type="text" name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-column">
                                    <div className="form-section glass">
                                        <h4><MapPin size={14} /> Location Details</h4>
                                        <div className="input-field">
                                            <label>Full Address</label>
                                            <textarea 
                                                name="address" required rows="2"
                                                value={formData.address} onChange={handleInputChange}
                                                placeholder="Complete address..."
                                            ></textarea>
                                        </div>
                                        <MapPicker lat={formData.latitude} lng={formData.longitude} onLocationChange={handleLocationChange} />
                                    </div>
                                    {formData.image && (
                                        <div className="form-section glass">
                                            <div className="form-image-preview">
                                                <img src={formData.image} alt="Preview" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-glass" onClick={() => { setViewMode('list'); setEditingRes(null); }}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : (editingRes ? 'Update Restaurant' : 'Save Restaurant')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageRestaurants;
