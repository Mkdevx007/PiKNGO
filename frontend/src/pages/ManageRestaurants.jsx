import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, PlusCircle, Search, Filter, MoreVertical, 
    MapPin, Globe, Star, Clock, Image as ImageIcon,
    ChevronRight, Save, X, Trash2, Edit3, ClipboardList, Store, Utensils
} from 'lucide-react';
import { restaurantApi, orderApi } from '../services/api';
import MapPicker from '../components/MapPicker/MapPicker';
import './ManageRestaurants.css';

const ManageRestaurants = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'form'
    const [editingRes, setEditingRes] = useState(null);
    const [viewingOrdersFor, setViewingOrdersFor] = useState(null);
    const [restaurantOrders, setRestaurantOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('restaurants'); // 'restaurants' or 'orders'
    const [allOrders, setAllOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Inactive'
    
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
            const res = await restaurantApi.getAllAdmin();
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

    const handleLocationChange = (lat, lng) => {
        setFormData(prev => ({
            ...prev,
            latitude: parseFloat(lat.toFixed(6)),
            longitude: parseFloat(lng.toFixed(6))
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
            setViewMode('list');
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

    const handleToggleStatus = async (res) => {
        try {
            const updatedData = {
                restaurantName: res.resturantName || res.name,
                address: res.address,
                latitude: res.latitude,
                longitude: res.longitude,
                isActive: !res.isActive,
                category: res.category,
                rating: res.rating,
                deliveryTime: res.deliveryTime,
                imageUrl: res.imageUrl
            };
            await restaurantApi.update(res.id, updatedData);
            setRestaurants(prev => prev.map(r => r.id === res.id ? { ...r, isActive: !r.isActive } : r));
        } catch (err) {
            console.error("Failed to toggle status:", err);
            alert("Error updating status.");
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await orderApi.updateStatus(orderId, newStatus);
            // Update local state if we are viewing specific restaurant orders
            if (viewingOrdersFor) {
                setRestaurantOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            }
            // Update allOrders state for the general orders tab
            setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Error updating order status.");
        }
    };

    const filteredRestaurants = restaurants.filter(r => {
        const matchesSearch = (r.resturantName || r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (r.address || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || 
                             (statusFilter === 'Active' && r.isActive) || 
                             (statusFilter === 'Inactive' && !r.isActive);
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="manage-page animate-fade-in">
            <div className="container">
                {viewMode === 'list' ? (
                    <>
                        <header className="manage-header">
                            <div className="header-left">
                                <h1>Manage <span className="gradient-text">Restaurants</span></h1>
                                <p>Configure and monitor your restaurant network</p>
                            </div>
                            <button className="btn-primary-glow" onClick={() => setViewMode('form')}>
                                <PlusCircle size={20} className="btn-icon-pulse" />
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
                                        <button 
                                            className={`filter-pill ${statusFilter === 'All' ? 'active' : ''}`}
                                            onClick={() => setStatusFilter('All')}
                                        >All</button>
                                        <button 
                                            className={`filter-pill ${statusFilter === 'Active' ? 'active' : ''}`}
                                            onClick={() => setStatusFilter('Active')}
                                        >Active</button>
                                        <button 
                                            className={`filter-pill ${statusFilter === 'Inactive' ? 'active' : ''}`}
                                            onClick={() => setStatusFilter('Inactive')}
                                        >Inactive</button>
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
                                                    <img src={res.imageUrl || res.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1470'} alt={res.resturantName} />
                                                    <div className="card-overlay"></div>
                                                    <div 
                                                        className={`status-pill ${res.isActive ? 'active' : 'inactive'}`}
                                                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(res); }}
                                                        style={{ cursor: 'pointer' }}
                                                        title="Click to toggle status"
                                                    >
                                                        <span className="dot"></span>
                                                        {res.isActive ? 'Active' : 'Inactive'}
                                                    </div>
                                                    <div className="card-rating-chip">
                                                        <Star size={12} fill="currentColor" />
                                                        <span>{res.rating || '4.5'}</span>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    <div className="card-title-row">
                                                        <h3>{res.resturantName || res.name}</h3>
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
                                                        <button className="action-btn orders" onClick={() => handleViewOrders(res)} title="View Orders">
                                                            <ClipboardList size={16} />
                                                            <span>Orders</span>
                                                        </button>
                                                        <button className="action-btn menu" onClick={() => navigate(`/admin/menu/${res.id}`)} title="Manage Menu">
                                                            <Utensils size={16} />
                                                            <span>Menu</span>
                                                        </button>
                                                        <button className="action-btn edit" onClick={() => {
                                                            setEditingRes(res);
                                                            setFormData({
                                                                restaurantName: res.resturantName || res.name || '',
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
                                                        }} title="Edit Restaurant">
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
                                {/* Column 1: Basic Info */}
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
                                                <label>Avg Price</label>
                                                <input type="number" name="avgPrice" value={formData.avgPrice} onChange={handleInputChange} placeholder="250" />
                                            </div>
                                        </div>
                                        <div className="input-field">
                                            <label>Description</label>
                                            <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} placeholder="Tell us about your restaurant..."></textarea>
                                        </div>
                                    </div>
                                    {/* Metrics & Media merged into Column 1 */}
                                    <div className="form-section glass">
                                        <h4><Star size={14} /> Metrics & Media</h4>
                                        <div className="input-grid">
                                            <div className="input-field">
                                                <label>Rating</label>
                                                <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleInputChange} />
                                            </div>
                                            <div className="input-field">
                                                <label>Delivery (min)</label>
                                                <input type="number" name="deliveryTime" value={formData.deliveryTime} onChange={handleInputChange} />
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
                                    
                                    <div className="sidebar-tip">
                                        <p>Tip: Accurate location and high-quality images help in increasing orders.</p>
                                    </div>
                                </div>

                                {/* Column 2: Location & Map & Preview */}
                                <div className="form-column">
                                    <div className="form-section glass">
                                        <h4><MapPin size={14} /> Location Details</h4>
                                        <div className="input-field">
                                            <label>Full Address</label>
                                            <textarea 
                                                name="address" required rows="2"
                                                value={formData.address} onChange={handleInputChange}
                                                placeholder="Complete address with landmark..."
                                            ></textarea>
                                        </div>
                                        <label className="field-hint">Pick Location on Map</label>
                                        <MapPicker 
                                            lat={formData.latitude} 
                                            lng={formData.longitude} 
                                            onLocationChange={handleLocationChange} 
                                        />
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

                                    {formData.image && (
                                        <div className="form-section glass">
                                            <h4><ImageIcon size={14} /> Image Preview</h4>
                                            <div className="form-image-preview glass">
                                                <img src={formData.image} alt="Restaurant Preview" />
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

            {/* Order View Overlay */}
            {viewingOrdersFor && (
                <div className="form-overlay animate-fade-in">
                    <div className="form-card glass-panel animate-scale-in wider">
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
