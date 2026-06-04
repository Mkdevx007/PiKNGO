import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { restaurantApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const PartnerSettings = ({ restaurant, onUpdate }) => {
    const { showToast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        restaurantName: '',
        address: '',
        category: '',
        deliveryTime: '',
        imageUrl: ''
    });

    useEffect(() => {
        if (restaurant) {
            setFormData({
                restaurantName: restaurant.restaurantName || '',
                address: restaurant.address || '',
                category: restaurant.category || '',
                deliveryTime: restaurant.deliveryTime || '',
                imageUrl: restaurant.imageUrl || ''
            });
        }
    }, [restaurant]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const updatedData = { ...restaurant, ...formData };
            await restaurantApi.update(restaurant.id, updatedData);
            showToast('Restaurant details updated successfully', 'success');
            if (onUpdate) onUpdate(updatedData);
        } catch (err) {
            console.error(err);
            showToast('Failed to update restaurant details', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="partner-settings-section glass-modern animate-slide-up" style={{ padding: '2rem', borderRadius: '15px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '800' }}>Restaurant <span className="gradient-text">Profile</span></h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem', maxWidth: '600px' }}>
                <div className="input-field" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Restaurant Name</label>
                    <input 
                        type="text" name="restaurantName" value={formData.restaurantName} onChange={handleChange} required 
                        style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', outline: 'none' }} 
                    />
                </div>

                <div className="input-field" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Address</label>
                    <textarea 
                        name="address" rows="2" value={formData.address} onChange={handleChange} required 
                        style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', outline: 'none' }} 
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-field" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Category</label>
                        <input 
                            type="text" name="category" placeholder="e.g. North Indian" value={formData.category} onChange={handleChange} required 
                            style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', outline: 'none' }} 
                        />
                    </div>
                    <div className="input-field" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Delivery Time</label>
                        <input 
                            type="text" name="deliveryTime" placeholder="e.g. 30 min" value={formData.deliveryTime} onChange={handleChange} required 
                            style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', outline: 'none' }} 
                        />
                    </div>
                </div>

                <div className="input-field" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Cover Image URL</label>
                    <input 
                        type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} 
                        style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', outline: 'none' }} 
                    />
                </div>

                <button type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--accent-orange, #ff6b00)', color: 'white', padding: '1rem', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', marginTop: '1rem' }}>
                    <Save size={18} />
                    {submitting ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
            </form>
        </div>
    );
};

export default PartnerSettings;
