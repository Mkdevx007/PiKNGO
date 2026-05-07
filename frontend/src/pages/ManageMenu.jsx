import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Plus, Search, Filter, 
    Trash2, Edit3, Save, X, Utensils,
    ImageIcon, CheckCircle
} from 'lucide-react';
import { restaurantApi, menuApi } from '../services/api';
import './ManageMenu.css';

import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/Common/Skeleton';
import SafeImage from '../components/Common/SafeImage';

const ManageMenu = () => {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [formData, setFormData] = useState({
        itemName: '',
        itemDescription: '',
        itemPrice: '',
        itemCategory: '',
        itemImageUrl: '',
        isVeg: true,
        isAvailable: true
    });

    useEffect(() => {
        fetchData();
    }, [restaurantId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resData, menuData] = await Promise.all([
                restaurantApi.getById(restaurantId),
                menuApi.getMenu(restaurantId)
            ]);
            
            setRestaurant(resData);
            setMenuItems(menuData || []);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            showToast('Failed to load menu data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const dataToSubmit = {
                ...formData,
                itemPrice: parseFloat(formData.itemPrice),
                restaurantId: restaurantId
            };

            if (editingItem) {
                await menuApi.updateItem(restaurantId, editingItem.id, dataToSubmit);
                showToast(`${formData.itemName} updated`, 'success');
            } else {
                await menuApi.addItem(restaurantId, dataToSubmit);
                showToast(`${formData.itemName} added to menu`, 'success');
            }
            
            setEditingItem(null);
            resetForm();
            fetchData();
        } catch (err) {
            console.error("Save failed:", err);
            showToast('Failed to save menu item', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await menuApi.deleteItem(restaurantId, itemId);
                showToast('Item deleted', 'info');
                fetchData();
            } catch (err) {
                console.error("Delete failed:", err);
                showToast('Failed to delete item', 'error');
            }
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            itemName: item.itemName,
            itemDescription: item.itemDescription,
            itemPrice: item.itemPrice.toString(),
            itemCategory: item.itemCategory,
            itemImageUrl: item.itemImageUrl || '',
            isVeg: item.isVeg,
            isAvailable: item.isAvailable
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({
            itemName: '',
            itemDescription: '',
            itemPrice: '',
            itemCategory: '',
            itemImageUrl: '',
            isVeg: true,
            isAvailable: true
        });
    };

    return (
        <div className="manage-page manage-menu-page animate-fade-in">
            <div className="container">
                <header className="manage-header elite-header-card">
                    <div className="header-left">
                        <button className="back-btn glass-pill" onClick={() => navigate('/admin/restaurants')}>
                            <ChevronLeft size={20} />
                            <span>NODE REGISTRY</span>
                        </button>
                        <div className="header-titles">
                            <span className="elite-h-accent">CATALOG IDENTIFIER // {restaurant?.restaurantName?.toUpperCase()}</span>
                            <h1>Manage <span className="gradient-text">Menu</span></h1>
                            <p>{menuItems.length} Registered Transmission Nodes</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="search-box glass">
                            <Search size={16} />
                            <input 
                                type="text" 
                                placeholder="Search menu..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <div className="menu-management-content">
                    {/* Left Column: Form */}
                    <div className="management-side-panel animate-slide-right">
                        <div className="glass-card form-container-card">
                            <div className="panel-header-mini">
                                <h3>{editingItem ? 'Edit' : 'Add'} <span className="gradient-text">Item</span></h3>
                                {editingItem && (
                                    <button className="btn-icon-glass sm" onClick={() => { setEditingItem(null); resetForm(); }}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            <form className="admin-form-compact" onSubmit={handleSubmit}>
                                <div className="form-section-mini">
                                    <div className="input-field">
                                        <label>Dish Name</label>
                                        <input 
                                            type="text" name="itemName" required placeholder="e.g. Paneer Tikka"
                                            value={formData.itemName} onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="input-grid">
                                        <div className="input-field">
                                            <label>Price (₹)</label>
                                            <input type="number" name="itemPrice" required placeholder="299" value={formData.itemPrice} onChange={handleInputChange} />
                                        </div>
                                        <div className="input-field">
                                            <label>Category</label>
                                            <input type="text" name="itemCategory" required placeholder="Main Course" value={formData.itemCategory} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="input-field">
                                        <label>Description</label>
                                        <textarea name="itemDescription" rows="2" placeholder="Brief info..." value={formData.itemDescription} onChange={handleInputChange}></textarea>
                                    </div>
                                    <div className="input-field">
                                        <label>Image URL</label>
                                        <div className="url-input-mini">
                                            <ImageIcon size={14} />
                                            <input type="text" name="itemImageUrl" placeholder="https://..." value={formData.itemImageUrl} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="toggle-group-mini">
                                        <label className="toggle-label-mini" htmlFor="isVeg">
                                            <input 
                                                type="checkbox" 
                                                id="isVeg"
                                                name="isVeg" 
                                                checked={formData.isVeg} 
                                                onChange={handleInputChange} 
                                            />
                                            <span className="toggle-design"></span>
                                            <span>Veg</span>
                                        </label>
                                        <label className="toggle-label-mini" htmlFor="isAvailable">
                                            <input 
                                                type="checkbox" 
                                                id="isAvailable"
                                                name="isAvailable" 
                                                checked={formData.isAvailable} 
                                                onChange={handleInputChange} 
                                            />
                                            <span className="toggle-design"></span>
                                            <span>Instock</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="form-actions-compact">
                                    <button type="submit" className="btn-primary-glow full-width" disabled={submitting}>
                                        {submitting ? 'Saving...' : (editingItem ? 'Update Item' : 'Add to Menu')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: List & Stats */}
                    <div className="management-main-panel">
                        <div className="menu-stats-row-compact">
                            <div className="stat-card-mini glass-card">
                                <Utensils size={16} />
                                <span>{menuItems.length} Items Total</span>
                            </div>
                            <div className="stat-card-mini glass-card success">
                                <CheckCircle size={16} />
                                <span>{menuItems.filter(i => i.isAvailable).length} Available</span>
                            </div>
                            <div className="filter-pill-row scroll-x">
                                {['All', ...new Set(menuItems.map(i => i.itemCategory))].map(cat => (
                                    <button 
                                        key={cat}
                                        className={`filter-pill ${categoryFilter === cat ? 'active' : ''}`}
                                        onClick={() => setCategoryFilter(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="table-responsive-wrapper">
                            <div className="menu-items-table glass-card animate-fade-in">
                                <div className="table-header">
                                    <div className="col-info">Item Info</div>
                                    <div className="col-cat">Category</div>
                                    <div className="col-price">Price</div>
                                    <div className="col-status">Status</div>
                                    <div className="col-actions">Actions</div>
                                </div>
                                <div className="table-body">
                                    {loading ? (
                                        <TableSkeleton rows={8} />
                                    ) : menuItems.filter(item => {
                                        const matchesSearch = (item.itemName || '').toLowerCase().includes(searchTerm.toLowerCase());
                                        const matchesCat = categoryFilter === 'All' || item.itemCategory === categoryFilter;
                                        return matchesSearch && matchesCat;
                                    }).length === 0 ? (
                                        <div className="empty-table">No menu items found.</div>
                                    ) : (
                                        menuItems
                                            .filter(item => {
                                                const matchesSearch = (item.itemName || '').toLowerCase().includes(searchTerm.toLowerCase());
                                                const matchesCat = categoryFilter === 'All' || item.itemCategory === categoryFilter;
                                                return matchesSearch && matchesCat;
                                            })
                                            .map(item => (
                                                <div key={item.id} className="table-row animate-slide-in">
                                                    <div className="col-info">
                                                        <div className="item-thumb">
                                                            <SafeImage src={item.itemImageUrl} alt={item.itemName} className="thumb-img" />
                                                            {item.isVeg ? <span className="veg-badge veg"></span> : <span className="veg-badge non-veg"></span>}
                                                        </div>
                                                        <div className="item-meta">
                                                            <strong>{item.itemName}</strong>
                                                            <p title={item.itemDescription}>{item.itemDescription || 'No description'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-cat">
                                                        <span className="tag-pill">{item.itemCategory}</span>
                                                    </div>
                                                    <div className="col-price">
                                                        <span className="price-tag">₹{item.itemPrice}</span>
                                                    </div>
                                                    <div className="col-status">
                                                        <span className={`elite-status-dot ${item.isAvailable ? 'active' : 'inactive'}`}></span>
                                                        <span className="monospace-data">{item.isAvailable ? 'AVAILABLE' : 'OFFLINE'}</span>
                                                    </div>
                                                    <div className="col-actions">
                                                        <button className="btn-icon-glass sm" onClick={() => handleEdit(item)}><Edit3 size={14} /></button>
                                                        <button className="btn-icon-glass sm delete" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Overlay removed as it is now integrated into the page */}
        </div>
    );
};

export default ManageMenu;
