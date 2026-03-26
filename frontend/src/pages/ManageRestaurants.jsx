import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, Search, Filter, MoreVertical, 
    MapPin, Globe, Star, Clock, Image as ImageIcon,
    ChevronRight, Save, X, Trash2, Edit3, ClipboardList, Store, Utensils
} from 'lucide-react';
import { restaurantApi, orderApi } from '../services/api';
import './ManageRestaurants.css';

const ManageRestaurants = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingRes, setEditingRes] = useState(null);
    const [viewingOrdersFor, setViewingOrdersFor] = useState(null);
    const [restaurantOrders, setRestaurantOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('restaurants'); // 'restaurants' or 'orders'
    const [allOrders, setAllOrders] = useState([]);
    
    const [formData, setFormData] = useState({
        restaurantName: '',
        address: '',
        latitude: 0,
        longitude: 0,
        category: 'Indian',
        rating: 4.5,
        deliveryTime: '30-40 min',
        imageUrl: '',
        isActive: true
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (activeTab === 'restaurants') {
            fetchRestaurants();
        } else {
            fetchAllOrders();
        }
    }, [activeTab]);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const res = await restaurantApi.getAll();
            setRestaurants(res.data || []);
        } catch (err) {
            console.error("Failed to fetch restaurants:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllOrders = async () => {
        setLoading(true);
        try {
            const res = await orderApi.getAllOrders();
            setAllOrders(res.data || []);
        } catch (err) {
            console.error("Failed to fetch all orders:", err);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingRes) {
                await restaurantApi.update(editingRes.id, formData);
            } else {
                await restaurantApi.create(formData);
            }
            setShowAddForm(false);
            setEditingRes(null);
            setFormData({
                restaurantName: '', address: '', latitude: 0, longitude: 0,
                category: 'Indian', rating: 4.5, deliveryTime: '30-40 min',
                imageUrl: '', isActive: true
            });
            fetchRestaurants();
        } catch (err) {
            console.error("Failed to save restaurant:", err);
            alert("Error saving restaurant. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewOrders = async (restaurant) => {
        setViewingOrdersFor(restaurant);
        setOrdersLoading(true);
        try {
            const res = await orderApi.getRestaurantOrders(restaurant.id);
            setRestaurantOrders(res.data || []);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await orderApi.updateStatus(orderId, newStatus);
            // Update local state
            setRestaurantOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Error updating order status.");
        }
    };

    const filteredRestaurants = restaurants.filter(r => 
        (r.resturantName || r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.address || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="manage-page animate-fade-in">
            <div className="container">
                <header className="manage-header">
                    <div className="header-left">
                        <h1>Manage <span className="gradient-text">Restaurants</span></h1>
                        <p>Configure and monitor your restaurant network</p>
                    </div>
                    <button className="btn-primary-glow" onClick={() => setShowAddForm(true)}>
                        <Plus size={20} />
                        <span>Add New Restaurant</span>
                    </button>
                </header>

                <div className="manage-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'restaurants' ? 'active' : ''}`}
                        onClick={() => setActiveTab('restaurants')}
                    >
                        <Store size={18} />
                        <span>Restaurants</span>
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <ClipboardList size={18} />
                        <span>All Orders</span>
                    </button>
                </div>

                {activeTab === 'restaurants' ? (
                    <>
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
                                <button className="filter-pill active">All</button>
                                <button className="filter-pill">Active</button>
                                <button className="filter-pill">Inactive</button>
                                <div className="divider"></div>
                                <button className="btn-icon-glass"><Filter size={18} /></button>
                            </div>
                        </div>

                        <div className="restaurants-grid">
                            {loading ? (
                                <div className="loading-grid">
                                    {[1, 2, 3].map(i => <div key={i} className="skeleton-card glass animate-pulse"></div>)}
                                </div>
                            ) : (
                                filteredRestaurants.map((res) => (
                                    <div key={res.id} className="res-admin-card glass-card animate-scale-in">
                                        <div className="card-banner">
                                            <img src={res.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1470'} alt={res.resturantName} />
                                            <div className={`status-badge ${res.isActive ? 'active' : 'inactive'}`}>
                                                {res.isActive ? 'Active' : 'Inactive'}
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <div className="card-title-row">
                                                <h3>{res.resturantName || res.name}</h3>
                                                <button className="btn-icon"><MoreVertical size={18} /></button>
                                            </div>
                                            <div className="card-meta">
                                                <span className="meta-item"><Star size={14} fill="currentColor" /> {res.rating || 'N/A'}</span>
                                                <span className="meta-sep">•</span>
                                                <span className="meta-item">{res.category || 'General'}</span>
                                            </div>
                                            <p className="card-addr"><MapPin size={14} /> {res.address}</p>
                                            <div className="card-actions">
                                                <button className="btn-primary-slim" onClick={() => handleViewOrders(res)}>
                                                    <ClipboardList size={14} /> Orders
                                                </button>
                                                <button className="btn-outline-small" onClick={() => navigate(`/admin/menu/${res.id}`)}>
                                                    <Utensils size={14} /> Menu
                                                </button>
                                                <button className="btn-icon-glass" onClick={() => {
                                                    setEditingRes(res);
                                                    setFormData({
                                                        restaurantName: res.resturantName || res.name || '',
                                                        address: res.address || '',
                                                        category: res.category || 'Indian',
                                                        rating: res.rating ? res.rating.toString() : '4.5',
                                                        deliveryTime: res.deliveryTime || '30-40 min',
                                                        imageUrl: res.imageUrl || '',
                                                        isActive: res.isActive !== false
                                                    });
                                                    setShowAddForm(true);
                                                }}>
                                                    <Edit3 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="all-orders-view animate-fade-in">
                        <div className="admin-orders-list grid-2">
                            {loading ? (
                                [1, 2, 4].map(i => <div key={i} className="skeleton-card glass animate-pulse h-40"></div>)
                            ) : allOrders.length === 0 ? (
                                <div className="empty-state span-full">No orders found across all restaurants.</div>
                            ) : (
                                allOrders.map(order => (
                                    <div key={order.id} className="admin-order-item glass-card admin-order-card animate-scale-in">
                                        <div className="order-restaurant-info">
                                            <Store size={14} />
                                            <span className="res-name-badge">{order.restaurantName}</span>
                                        </div>
                                        <div className="order-row-top">
                                            <div className="order-user">
                                                <strong>{order.userName}</strong>
                                                <span className="order-time">{new Date(order.createdTs).toLocaleString()}</span>
                                            </div>
                                            <select 
                                                className={`status-select ${order.status.toLowerCase()}`}
                                                value={order.status}
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="PREPARING">Preparing</option>
                                                <option value="READY">Ready</option>
                                                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                                <option value="DELIVERED">Delivered</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </div>
                                        <div className="order-details-mini">
                                            {order.items.map(it => (
                                                <div key={it.id} className="it-row">{it.quantity}x {it.itemName}</div>
                                            ))}
                                        </div>
                                        <div className="order-row-bottom">
                                            <span className="total-badge">₹{order.totalAmount}</span>
                                            <span className="pay-method">{order.paymentMethod}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Slide-over Form Overlay */}
            {showAddForm && (
                <div className="form-overlay animate-fade-in">
                    <div className="form-panel glass-panel animate-slide-in-right">
                        <div className="panel-header">
                            <h2>{editingRes ? 'Edit' : 'Add New'} <span className="gradient-text">Restaurant</span></h2>
                            <button className="close-btn" onClick={() => { setShowAddForm(false); setEditingRes(null); }}><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="form-section">
                                <h4>Basic Information</h4>
                                <div className="input-field">
                                    <label>Restaurant Name</label>
                                    <input 
                                        type="text" name="restaurantName" required 
                                        value={formData.restaurantName} onChange={handleInputChange}
                                        placeholder="e.g. Royal Punjab Express"
                                    />
                                </div>
                                <div className="input-field">
                                    <label>Category</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange}>
                                        <option value="Indian">Indian</option>
                                        <option value="Fast Food">Fast Food</option>
                                        <option value="Italian">Italian</option>
                                        <option value="Chinese">Chinese</option>
                                        <option value="Continental">Continental</option>
                                        <option value="Bakery">Bakery</option>
                                        <option value="Beverages">Beverages</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Location Details</h4>
                                <div className="input-field">
                                    <label>Full Address</label>
                                    <textarea 
                                        name="address" required rows="2"
                                        value={formData.address} onChange={handleInputChange}
                                        placeholder="Complete address with landmark..."
                                    ></textarea>
                                </div>
                                <div className="input-grid">
                                    <div className="input-field">
                                        <label>Latitude</label>
                                        <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleInputChange} />
                                    </div>
                                    <div className="input-field">
                                        <label>Longitude</label>
                                        <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>Metrics & Media</h4>
                                <div className="input-grid">
                                    <div className="input-field">
                                        <label>Rating</label>
                                        <input type="number" step="0.1" max="5" name="rating" value={formData.rating} onChange={handleInputChange} />
                                    </div>
                                    <div className="input-field">
                                        <label>Delivery Time</label>
                                        <input type="text" name="deliveryTime" value={formData.deliveryTime} onChange={handleInputChange} placeholder="e.g. 25-30 min" />
                                    </div>
                                </div>
                                <div className="input-field">
                                    <label>Banner Image URL</label>
                                    <div className="url-input-wrapper">
                                        <ImageIcon size={18} />
                                        <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://..." />
                                    </div>
                                </div>
                            </div>

                             <div className="form-actions">
                                <button type="button" className="btn-glass" onClick={() => { setShowAddForm(false); setEditingRes(null); }}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : (editingRes ? 'Update Restaurant' : 'Save Restaurant')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Order View Overlay */}
            {viewingOrdersFor && (
                <div className="form-overlay animate-fade-in">
                    <div className="form-panel glass-panel animate-slide-in-right wider">
                        <div className="panel-header">
                            <div>
                                <h2>Orders for <span className="gradient-text">{viewingOrdersFor.resturantName}</span></h2>
                                <p className="subtitle">{restaurantOrders.length} orders found</p>
                            </div>
                            <button className="close-btn" onClick={() => setViewingOrdersFor(null)}><X size={24} /></button>
                        </div>

                        <div className="orders-container">
                            {ordersLoading ? (
                                <div className="loading-state">Fetching orders...</div>
                            ) : restaurantOrders.length === 0 ? (
                                <div className="empty-state">No orders placed yet for this restaurant.</div>
                            ) : (
                                <div className="admin-orders-list">
                                    {restaurantOrders.map(order => (
                                        <div key={order.id} className="admin-order-item glass-card">
                                            <div className="order-row-top">
                                                <div className="order-user">
                                                    <strong>{order.userName}</strong>
                                                    <span className="order-time">{new Date(order.createdTs).toLocaleTimeString()}</span>
                                                </div>
                                                <select 
                                                    className={`status-select ${order.status.toLowerCase()}`}
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="PREPARING">Preparing</option>
                                                    <option value="READY">Ready</option>
                                                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                                    <option value="DELIVERED">Delivered</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                </select>
                                            </div>
                                            <div className="order-details-mini">
                                                {order.items.map(it => (
                                                    <div key={it.id} className="it-row">{it.quantity}x {it.itemName}</div>
                                                ))}
                                            </div>
                                            <div className="order-row-bottom">
                                                <span className="total-badge">₹{order.totalAmount}</span>
                                                <span className="pay-method">{order.paymentMethod}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRestaurants;
