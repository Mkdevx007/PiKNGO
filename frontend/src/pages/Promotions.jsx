import React, { useState, useEffect } from 'react';
import { 
    Tag, Plus, Percent, Clock, 
    Trash2, Edit, CheckCircle, Gift,
    Image as ImageIcon, X
} from 'lucide-react';
import { adminSettingsApi } from '../services/api';
import './Promotions.css';

import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/Common/Skeleton';

const Promotions = () => {
    const { showToast } = useToast();
    const [promos, setPromos] = useState([]);
    const [viewMode, setViewMode] = useState('list');
    const [editingPromo, setEditingPromo] = useState(null);
    const [formData, setFormData] = useState({
        code: '', discount: '', type: 'Flat', active: true, expiry: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const res = await adminSettingsApi.getPromotions();
            const data = res || [];
            if (Array.isArray(data)) {
                setPromos(data.map(p => ({
                    id: p.id,
                    code: p.promoCode,
                    discount: p.title,
                    type: 'Flat',
                    active: p.isActive !== undefined ? p.isActive : p.active,
                    expiry: p.expiryDate
                })));
            }
        } catch (error) {
            console.error("Failed to fetch promotions", error);
            showToast('Failed to load campaigns', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePromo = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this promotion?');
        if (!confirmDelete) return;

        try {
            await adminSettingsApi.deletePromotion(id);
            setPromos(prev => prev.filter(p => p.id !== id));
            showToast('Promotion deleted successfully', 'success');
        } catch (e) {
            showToast('Error deleting promotion', 'error');
        }
    };

    const handleToggleStatus = async (id) => {
        const promoToToggle = promos.find(p => p.id === id);
        if(!promoToToggle) return;
        
        const newStatus = !promoToToggle.active;
        try {
            const updatedData = {
                title: promoToToggle.discount,
                promoCode: promoToToggle.code,
                discountPercentage: parseFloat(promoToToggle.discount) || 10,
                expiryDate: promoToToggle.expiry,
                active: newStatus
            };
            await adminSettingsApi.updatePromotion(id, updatedData);
            setPromos(prev => prev.map(p => p.id === id ? { ...p, active: newStatus } : p));
            showToast(`Campaign is now ${newStatus ? 'Active' : 'Inactive'}`, 'info');
        } catch (e) {
            showToast('Error updating status', 'error');
        }
    };

    const handleEditPromo = (promo) => {
        setEditingPromo(promo);
        setFormData({ code: promo.code, discount: promo.discount, type: promo.type, active: promo.active, expiry: promo.expiry });
        setViewMode('form');
    };

    const handleCreatePromo = () => {
        setEditingPromo(null);
        setFormData({ code: '', discount: '', type: 'Flat', active: true, expiry: '' });
        setViewMode('form');
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        const apiPayload = {
            title: formData.discount, 
            promoCode: formData.code.toUpperCase(),
            discountPercentage: parseFloat(formData.discount) || 15.0,
            expiryDate: formData.expiry,
            active: formData.active
        };

        try {
            if (editingPromo) {
                await adminSettingsApi.updatePromotion(editingPromo.id, apiPayload);
                showToast(`Campaign ${formData.code} updated`, 'success');
            } else {
                await adminSettingsApi.createPromotion(apiPayload);
                showToast(`Campaign ${formData.code} launched!`, 'success');
            }
            fetchPromotions();
            setViewMode('list');
        } catch (e) {
            showToast('Failed to save promotion', 'error');
            console.error(e);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleActionPlaceholder = (feature) => {
        showToast(`${feature} will be available soon`, 'info');
    };

    return (
        <div className="promotions-page animate-fade-in">
            <div className="container">


                {viewMode === 'list' ? (
                    <>
                        <header className="promotions-header elite-header-card">
                            <div className="header-left">
                                <span className="elite-h-accent">MARKETING PROTOCOLS // CAMPAIGN ENGINE</span>
                                <h1>Platform <span className="gradient-text">Promotions</span></h1>
                                <p>Orchestrate network growth and seasonal incentives</p>
                            </div>
                            <button className="btn-primary-glow" onClick={handleCreatePromo}>
                                <Plus size={18} />
                                <span>Create Campaign</span>
                            </button>
                        </header>

                        <div className="promo-stats-grid">
                            <div className="promo-stat glass-card orange elite-entrance" style={{ animationDelay: '0.1s' }}>
                                <div className="stat-icon"><Tag size={20} /></div>
                                <div className="stat-data">
                                    <span className="label">Active Offers</span>
                                    <h3>8 Total</h3>
                                </div>
                            </div>
                            <div className="promo-stat glass-card blue elite-entrance" style={{ animationDelay: '0.2s' }}>
                                <div className="stat-icon"><Gift size={20} /></div>
                                <div className="stat-data">
                                    <span className="label">Total Redeemed</span>
                                    <h3>1.2k+</h3>
                                </div>
                            </div>
                            <div className="promo-stat glass-card green elite-entrance" style={{ animationDelay: '0.3s' }}>
                                <div className="stat-icon"><Percent size={20} /></div>
                                <div className="stat-data">
                                    <span className="label">AVG Conversion</span>
                                    <h3>14.5%</h3>
                                </div>
                            </div>
                        </div>

                        <div className="promotions-list">
                            <div className="list-header glass-card">
                                <h3>Available Campaigns</h3>
                                <div className="list-actions">
                                    <button className="btn-text">View Archives</button>
                                </div>
                            </div>

                            <div className="promo-grid">
                                {loading ? (
                                    <>
                                        <CardSkeleton />
                                        <CardSkeleton />
                                        <CardSkeleton />
                                    </>
                                ) : promos.map((promo, idx) => (
                                    <div key={promo.id} className="promo-card glass-card animate-scale-in" style={{ animationDelay: `${0.2 + (idx * 0.1)}s` }}>
                                        <div className="promo-card-top">
                                            <div className="promo-code glass">
                                                <Tag size={12} className="text-orange" />
                                                <span style={{ letterSpacing: '1px' }}>{promo.code}</span>
                                            </div>
                                            <div 
                                                className={`status-badge ${promo.active ? 'active' : 'expired'}`}
                                                onClick={() => handleToggleStatus(promo.id)}
                                                style={{ cursor: 'pointer' }}
                                                title="Click to toggle status"
                                            >
                                                <span className="status-dot"></span>
                                                {promo.active ? 'Active' : 'Expired'}
                                            </div>
                                        </div>
                                        
                                        <div className="promo-card-content">
                                            <div className="discount-value gradient-text">{promo.discount}</div>
                                            <div className="discount-label">Minimum order value ₹200 apply</div>
                                            <div className="promo-meta">
                                                <div className="meta-item"><Clock size={12} className="text-orange" /> Expiry: {promo.expiry}</div>
                                                <div className="meta-item"><CheckCircle size={12} className="text-green-500" /> 450 Uses Left</div>
                                            </div>
                                        </div>

                                        <div className="promo-card-actions">
                                            <button className="btn-icon-glass" onClick={(e) => { e.stopPropagation(); handleEditPromo(promo); }}><Edit size={16} /></button>
                                            <button className="btn-icon-glass delete-promo" onClick={(e) => { e.stopPropagation(); handleDeletePromo(promo.id); }}><Trash2 size={16} /></button>
                                            <button className="btn-primary-small view-analytics-btn" onClick={(e) => { e.stopPropagation(); handleActionPlaceholder('Analytics Chart'); }}>View Analytics</button>
                                        </div>
                                    </div>
                                ))}
                                
                                <button className="add-promo-card glass-card animate-scale-in" style={{ animationDelay: `${0.2 + (promos.length * 0.1)}s` }} onClick={handleCreatePromo}>
                                    <div className="add-icon">+</div>
                                    <span>Create New Offer</span>
                                    <p>Launch a new marketing campaign</p>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="form-page-container animate-fade-in">
                        <header className="panel-header">
                            <div>
                                <h2>{editingPromo ? 'Edit' : 'Create'} <span className="gradient-text">Campaign</span></h2>
                                <p className="subtitle">Configure your promotional offer</p>
                            </div>
                            <button className="btn-icon-glass" onClick={() => { setViewMode('list'); setEditingPromo(null); }}><X size={24} /></button>
                        </header>
                        
                        <form onSubmit={handleFormSubmit} className="admin-form">
                            <div className="form-main-grid">
                                <div className="form-section glass">
                                    <h4><Tag size={14} /> Campaign Details</h4>
                                    <div className="input-field">
                                        <label>Promo Code</label>
                                        <input type="text" name="code" required value={formData.code} onChange={handleInputChange} placeholder="e.g. SUMMER50" style={{ textTransform: 'uppercase', letterSpacing: '1px' }} />
                                    </div>
                                    
                                    <div className="input-grid">
                                        <div className="input-field">
                                            <label>Discount Value</label>
                                            <input type="text" name="discount" required value={formData.discount} onChange={handleInputChange} placeholder="e.g. 50% OFF" />
                                        </div>
                                        <div className="input-field">
                                            <label>Discount Type</label>
                                            <select name="type" value={formData.type} onChange={handleInputChange}>
                                                <option value="Flat">Flat Percentage</option>
                                                <option value="Fixed">Fixed Amount</option>
                                                <option value="FreeShipping">Free Delivery</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="input-grid">
                                        <div className="input-field">
                                            <label>Expiry Date</label>
                                            <input type="date" name="expiry" required value={formData.expiry} onChange={handleInputChange} />
                                        </div>
                                        <div className="input-field">
                                            <label>Active Status</label>
                                            <div className="checkbox-wrapper" style={{ marginTop: '0.8rem' }}>
                                                <input type="checkbox" name="active" checked={formData.active} onChange={handleInputChange} />
                                                <span>Enable Campaign</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="form-actions">
                                <button type="button" className="btn-glass" onClick={() => { setViewMode('list'); setEditingPromo(null); }}>Cancel</button>
                                <button type="submit" className="btn-primary">
                                    {editingPromo ? 'Update Campaign' : 'Launch Campaign'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Promotions;
