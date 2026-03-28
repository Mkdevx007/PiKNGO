import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Plus, Search, Filter, 
    Trash2, Edit3, Save, X, Utensils,
    ImageIcon, CheckCircle
} from 'lucide-react';
import { restaurantApi, menuApi } from '../services/api';
import './ManageMenu.css';

const ManageMenu = () => {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        imageUrl: '',
        veg: true,
        available: true
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
            console.log("Restaurant Data:", resData.data);
            console.log("Menu Items:", menuData.data);
            setRestaurant(resData.data);
            setMenuItems(menuData.data || []);
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            console.log("Fetch cycle complete");
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
                price: parseFloat(formData.price),
                restaurantId: restaurantId
            };

            if (editingItem) {
                await menuApi.updateItem(restaurantId, editingItem.id, dataToSubmit);
            } else {
                await menuApi.addItem(restaurantId, dataToSubmit);
            }
            
            setShowForm(false);
            setEditingItem(null);
            resetForm();
            fetchData();
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await menuApi.deleteItem(restaurantId, itemId);
                fetchData();
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price.toString(),
            category: item.category,
            imageUrl: item.imageUrl || '',
            veg: item.veg,
            available: item.available
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            imageUrl: '',
            veg: true,
            available: true
        });
    };

    if (loading) return <div className="manage-page loading-state">Synchronizing Menu...</div>;

    return (
        <div className="manage-page manage-menu-page animate-fade-in">
            <div className="container">
                <header className="manage-header">
                    <div className="header-left">
                        <button className="back-btn glass" onClick={() => navigate('/admin/restaurants')}>
                            <ChevronLeft size={20} />
                            <span>Back to Restaurants</span>
                        </button>
                        <div className="header-titles">
                            <h1>Manage <span className="gradient-text">Menu</span></h1>
                            <p>{restaurant?.resturantName || 'Restaurant'} • {menuItems.length} Items</p>
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
                        <button className="btn-primary-glow" onClick={() => { setEditingItem(null); resetForm(); setShowForm(true); }}>
                            <Plus size={20} />
                            <span>Add New Item</span>
                        </button>
                    </div>
                </header>

                <div className="menu-stats-row">
                    <div className="stat-card glass-card">
                        <Utensils className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-value">{menuItems.length}</span>
                            <span className="stat-label">Total Items</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <CheckCircle className="stat-icon success" />
                        <div className="stat-info">
                            <span className="stat-value">{menuItems.filter(i => i.available).length}</span>
                            <span className="stat-label">Available</span>
                        </div>
                    </div>
                    <div className="filter-pill-row scroll-x">
                        {['All', ...new Set(menuItems.map(i => i.category))].map(cat => (
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

                <div className="menu-items-table glass-card">
                    <div className="table-header">
                        <div className="col-info">Item Info</div>
                        <div className="col-cat">Category</div>
                        <div className="col-price">Price</div>
                        <div className="col-status">Status</div>
                        <div className="col-actions">Actions</div>
                    </div>
                    <div className="table-body">
                        {menuItems.filter(item => {
                            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
                            const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
                            return matchesSearch && matchesCat;
                        }).length === 0 ? (
                            <div className="empty-table">No menu items found matching your filters.</div>
                        ) : (
                            menuItems
                                .filter(item => {
                                    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
                                    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
                                    return matchesSearch && matchesCat;
                                })
                                .map(item => (
                                    <div key={item.id} className="table-row animate-slide-in">
                                    <div className="col-info">
                                        <div className="item-thumb">
                                            <img src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=100'} alt="" />
                                            {item.veg ? <span className="veg-badge veg"></span> : <span className="veg-badge non-veg"></span>}
                                        </div>
                                        <div className="item-meta">
                                            <strong>{item.name}</strong>
                                            <p>{item.description || 'No description provided.'}</p>
                                        </div>
                                    </div>
                                    <div className="col-cat">
                                        <span className="tag-pill">{item.category}</span>
                                    </div>
                                    <div className="col-price">
                                        <span className="price-tag">₹{item.price}</span>
                                    </div>
                                    <div className="col-status">
                                        <span className={`status-dot ${item.available ? 'active' : 'inactive'}`}></span>
                                        {item.available ? 'Available' : 'Sold Out'}
                                    </div>
                                    <div className="col-actions">
                                        <button className="btn-icon-glass" onClick={() => handleEdit(item)}><Edit3 size={16} /></button>
                                        <button className="btn-icon-glass delete" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Slide-over Form Overlay */}
            {showForm && (
                <div className="form-overlay" onClick={() => setShowForm(false)}>
                    <div className="form-panel wider animate-slide-left" onClick={e => e.stopPropagation()}>
                        <div className="panel-header">
                            <div>
                                <h2>{editingItem ? 'Edit' : 'Add'} <span className="gradient-text">Menu Item</span></h2>
                                <p className="subtitle">{restaurant?.resturantName}</p>
                            </div>
                            <button className="close-btn" onClick={() => setShowForm(false)}><X size={24} /></button>
                        </div>

                        <form className="admin-form" onSubmit={handleSubmit}>
                            <div className="form-section">
                                <h4>Item Details</h4>
                                <div className="input-field">
                                    <label>Item Name</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        required
                                        placeholder="e.g. Paneer Butter Masala"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="input-grid">
                                    <div className="input-field">
                                        <label>Price (₹)</label>
                                        <input 
                                            type="number" 
                                            name="price"
                                            required
                                            placeholder="299"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Category</label>
                                        <input 
                                            type="text" 
                                            name="category"
                                            required
                                            placeholder="e.g. Main Course"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="input-field">
                                    <label>Description</label>
                                    <textarea 
                                        name="description"
                                        rows="3"
                                        placeholder="Brief description of the dish..."
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Media & Status</h4>
                                <div className="input-field">
                                    <label>Image URL</label>
                                    <div className="url-input-wrapper">
                                        <ImageIcon size={18} />
                                        <input 
                                            type="text" 
                                            name="imageUrl"
                                            placeholder="https://images.unsplash.com/..."
                                            value={formData.imageUrl}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="checkbox-row mt-1">
                                    <label className="toggle-label">
                                        <input 
                                            type="checkbox" 
                                            name="veg"
                                            checked={formData.veg}
                                            onChange={handleInputChange}
                                        />
                                        <span className="toggle-design"></span>
                                        <span>Pure Vegetarian</span>
                                    </label>
                                    <label className="toggle-label">
                                        <input 
                                            type="checkbox" 
                                            name="available"
                                            checked={formData.available}
                                            onChange={handleInputChange}
                                        />
                                        <span className="toggle-design"></span>
                                        <span>Available in Stocks</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : (editingItem ? 'Update Item' : 'Add to Menu')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMenu;
