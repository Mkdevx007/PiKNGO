import React, { useState } from 'react';
import { X, MapPin, Navigation, Home, Briefcase } from 'lucide-react';
import './AddressModal.css';

const AddressModal = ({ isOpen, onClose, onSave }) => {
    const [address, setAddress] = useState({
        addressLine1: '',
        city: '',
        state: '',
        pincode: '',
        type: 'Home' // Home, Work, Other
    });

    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(address);
            onClose();
        } catch (err) {
            console.error("Failed to save address:", err);
            alert("Failed to save address. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay animate-fade-in">
            <div className="address-modal-card glass-card animate-scale-in">
                <header className="modal-header">
                    <div className="header-title">
                        <MapPin size={24} className="text-amber" />
                        <h2>Add New <span className="gradient-text">Address</span></h2>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </header>

                <form onSubmit={handleSubmit} className="address-form">
                    <div className="input-group">
                        <label>Address Line 1</label>
                        <input 
                            type="text" 
                            placeholder="Flat/House No., Building, Area" 
                            required
                            value={address.addressLine1}
                            onChange={(e) => setAddress({...address, addressLine1: e.target.value})}
                        />
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label>City</label>
                            <input 
                                type="text" 
                                placeholder="Mumbai" 
                                required
                                value={address.city}
                                onChange={(e) => setAddress({...address, city: e.target.value})}
                            />
                        </div>
                        <div className="input-group">
                            <label>Pincode</label>
                            <input 
                                type="text" 
                                placeholder="400001" 
                                required
                                value={address.pincode}
                                onChange={(e) => setAddress({...address, pincode: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>State</label>
                        <input 
                            type="text" 
                            placeholder="Maharashtra" 
                            required
                            value={address.state}
                            onChange={(e) => setAddress({...address, state: e.target.value})}
                        />
                    </div>

                    <div className="type-selector">
                        <label>Address Type</label>
                        <div className="type-options">
                            {['Home', 'Work', 'Other'].map(type => (
                                <button 
                                    key={type}
                                    type="button"
                                    className={`type-btn glass ${address.type === type ? 'active' : ''}`}
                                    onClick={() => setAddress({...address, type})}
                                >
                                    {type === 'Home' && <Home size={16} />}
                                    {type === 'Work' && <Briefcase size={16} />}
                                    {type === 'Other' && <Navigation size={16} />}
                                    <span>{type}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <footer className="modal-footer">
                        <button type="button" className="btn-glass" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Address'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default AddressModal;
