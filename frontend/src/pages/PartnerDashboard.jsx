import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Utensils, ShoppingBag, 
    Settings, Star, Clock, MapPin, 
    Power, Activity, TrendingUp, IndianRupee
} from 'lucide-react';
import { restaurantApi, orderApi } from '../services/api';
import './PartnerDashboard.css';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/Common/Skeleton';
import ManageMenu from './ManageMenu'; // Reuse for now
import PartnerSettings from './PartnerSettings';
import PartnerWallet from './PartnerWallet';

const PartnerDashboard = () => {
    const { showToast } = useToast();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [stats, setStats] = useState({
        totalOrders: 0,
        revenue: 0,
        avgRating: 4.5
    });

    useEffect(() => {
        fetchPartnerData();
    }, []);

    useEffect(() => {
        if (activeTab === 'orders' && restaurant) {
            fetchOrders();
            // Polling for new orders every 30 seconds
            const interval = setInterval(fetchOrders, 30000);
            return () => clearInterval(interval);
        }
    }, [activeTab, restaurant]);

    const fetchOrders = async () => {
        if (!restaurant) return;
        setOrdersLoading(true);
        try {
            const res = await orderApi.getRestaurantOrders(restaurant.id);
            setOrders(res);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await orderApi.updateStatus(orderId, newStatus);
            showToast(`Order status updated to ${newStatus}`, 'success');
            fetchOrders(); // Refresh list
        } catch (err) {
            showToast("Failed to update order status", "error");
        }
    };

    const fetchPartnerData = async () => {
        setLoading(true);
        try {
            const res = await restaurantApi.getMyRestaurant();
            if (res && res.length > 0) {
                const rest = res[0];
                setRestaurant(rest);
                
                // Fetch real analytics
                try {
                    const analytics = await restaurantApi.getAnalytics(rest.id);
                    setStats({
                        totalOrders: analytics.totalOrders,
                        revenue: analytics.totalRevenue,
                        avgRating: analytics.averageRating,
                        topItems: analytics.topItems || []
                    });
                } catch (e) {
                    console.warn("Analytics not available yet:", e);
                }
            }
        } catch (err) {
            console.error("Failed to fetch partner data:", err);
            showToast("Failed to load restaurant profile", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!restaurant) return;
        try {
            const newStatus = !restaurant.isActive;
            const updatedData = { ...restaurant, isActive: newStatus };
            await restaurantApi.update(restaurant.id, updatedData);
            setRestaurant(updatedData);
            showToast(`Restaurant is now ${newStatus ? 'ONLINE' : 'OFFLINE'}`, 'info');
        } catch (err) {
            showToast("Failed to update status", "error");
        }
    };

    if (loading) return <div className="partner-loading"><CardSkeleton /></div>;

    if (!restaurant) return (
        <div className="partner-empty-state glass-modern">
            <h2>Access Restricted</h2>
            <p>Your account is not currently linked to any restaurant hub.</p>
        </div>
    );

    return (
        <div className="partner-dashboard-container animate-fade-in">
            <aside className="partner-sidebar glass-modern">
                <div className="partner-brand">
                    <div className="brand-logo">P</div>
                    <span>Partner Hub</span>
                </div>
                
                <nav className="partner-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                        <LayoutDashboard size={18} /> Overview
                    </button>
                    <button className={activeTab === 'menu' ? 'active' : ''} onClick={() => setActiveTab('menu')}>
                        <Utensils size={18} /> My Menu
                    </button>
                    <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
                        <ShoppingBag size={18} /> Orders
                    </button>
                    <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
                        <Clock size={18} /> History
                    </button>
                    <button className={activeTab === 'wallet' ? 'active' : ''} onClick={() => setActiveTab('wallet')}>
                        <IndianRupee size={18} /> Wallet
                    </button>
                    <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                        <Settings size={18} /> Settings
                    </button>
                </nav>

                <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className={`status-switch ${restaurant.isActive ? 'online' : 'offline'}`} onClick={handleToggleStatus}>
                        <Power size={14} />
                        <span>{restaurant.isActive ? 'ONLINE' : 'OFFLINE'}</span>
                    </div>
                    <button className="status-switch" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)' }} onClick={async () => {
                        try { await import('../services/api').then(m => m.authApi.logout()); } catch (err) {}
                        localStorage.removeItem('phone');
                        localStorage.removeItem('userId');
                        localStorage.removeItem('userRole');
                        window.location.href = '/login';
                    }}>
                        <Power size={14} />
                        <span>LOGOUT</span>
                    </button>
                </div>
            </aside>

            <main className="partner-content">
                <header className="content-header">
                    <div className="header-info">
                        <h1>Welcome back, <span className="gradient-text">{restaurant.restaurantName}</span></h1>
                        <p>Managing terminal {restaurant.id.substring(0, 8)}</p>
                    </div>
                    <div className="header-actions">
                        <div className="live-badge">
                            <Activity size={14} className="animate-pulse" />
                            LIVE FEED ACTIVE
                        </div>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <div className="overview-grid">
                        <div className="stats-strip">
                            <div className="stat-card glass-modern">
                                <TrendingUp size={24} className="text-orange" />
                                <div className="stat-val">{stats.totalOrders}</div>
                                <div className="stat-label">Total Orders</div>
                            </div>
                            <div className="stat-card glass-modern">
                                <IndianRupee size={24} className="text-green" />
                                <div className="stat-val">₹{stats.revenue.toLocaleString()}</div>
                                <div className="stat-label">Total Revenue</div>
                            </div>
                            <div className="stat-card glass-modern">
                                <Star size={24} className="text-amber" />
                                <div className="stat-val">{stats.avgRating}</div>
                                <div className="stat-label">Customer Rating</div>
                            </div>
                        </div>

                        <div className="main-overview-row">
                            <div className="profile-snapshot glass-modern">
                                <h3>Restaurant Profile</h3>
                                <div className="snapshot-body">
                                    <img src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'} alt="" />
                                    <div className="snapshot-details">
                                        <div className="detail"><MapPin size={14} /> {restaurant.address}</div>
                                        <div className="detail"><Utensils size={14} /> {restaurant.category}</div>
                                        <div className="detail"><Clock size={14} /> {restaurant.deliveryTime} mins avg</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="analytics-snapshot glass-modern">
                                <h3>Top Selling Items</h3>
                                <div className="top-items-list">
                                    {stats.topItems && stats.topItems.length > 0 ? stats.topItems.map((item, idx) => (
                                        <div key={idx} className="top-item-row">
                                            <span className="item-name">{item.itemName}</span>
                                            <span className="item-count">{item.count} orders</span>
                                        </div>
                                    )) : (
                                        <div className="empty-stats">No sales data available.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div className="menu-management-section">
                        {/* We reuse ManageMenu but it needs the restaurantId passed in */}
                        <ManageMenu partnerMode={true} restaurantId={restaurant.id} />
                    </div>
                )}

                {activeTab === 'orders' && (() => {
                    const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status));
                    return (
                    <div className="menu-management-section animate-slide-up">
                        <div className="section-header">
                            <h2>Active Transmissions</h2>
                            <button className="btn-icon-glass sm" onClick={fetchOrders} disabled={ordersLoading}>
                                <Activity size={14} className={ordersLoading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                        
                        <div className="orders-list">
                            {activeOrders.length === 0 ? (
                                <div className="empty-orders">
                                    <ShoppingBag size={40} opacity={0.2} />
                                    <p>No active orders in the network.</p>
                                </div>
                            ) : (
                                activeOrders.map(order => (
                                    <div key={order.id} className="partner-order-card glass-modern">
                                        <div className="order-main">
                                            <div className="order-id">#{order.id.substring(0, 8).toUpperCase()}</div>
                                            <div className="order-user-name">{order.userName}</div>
                                            <div className="order-items-list">
                                                {order.items.map(item => (
                                                    <span key={item.id} className="item-pill">
                                                        {item.quantity}x {item.itemName}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="order-meta">
                                            <div className="order-total">₹{order.totalAmount}</div>
                                            <div className={`order-status-badge ${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </div>
                                        </div>
                                        <div className="order-actions">
                                            {order.status === 'PENDING' && (
                                                <button className="btn-action start" onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}>
                                                    START PREPARING
                                                </button>
                                            )}
                                            {order.status === 'PREPARING' && (
                                                <button className="btn-action ready" onClick={() => handleUpdateOrderStatus(order.id, 'READY')}>
                                                    MARK AS READY
                                                </button>
                                            )}
                                            {order.status === 'READY' && (
                                                <div className="waiting-badge">WAITING FOR PICKUP</div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    );
                })}

                {activeTab === 'history' && (() => {
                    const pastOrders = orders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status));
                    return (
                    <div className="menu-management-section animate-slide-up">
                        <div className="section-header">
                            <h2>Order History</h2>
                            <button className="btn-icon-glass sm" onClick={fetchOrders} disabled={ordersLoading}>
                                <Activity size={14} className={ordersLoading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                        
                        <div className="orders-list">
                            {pastOrders.length === 0 ? (
                                <div className="empty-orders">
                                    <Clock size={40} opacity={0.2} />
                                    <p>No past orders found.</p>
                                </div>
                            ) : (
                                pastOrders.map(order => (
                                    <div key={order.id} className="partner-order-card glass-modern" style={{ opacity: 0.8 }}>
                                        <div className="order-main">
                                            <div className="order-id">#{order.id.substring(0, 8).toUpperCase()}</div>
                                            <div className="order-user-name">{order.userName}</div>
                                            <div className="order-items-list">
                                                {order.items.map(item => (
                                                    <span key={item.id} className="item-pill">
                                                        {item.quantity}x {item.itemName}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="order-meta">
                                            <div className="order-total">₹{order.totalAmount}</div>
                                            <div className={`order-status-badge ${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    );
                })}

                {activeTab === 'wallet' && (
                    <PartnerWallet stats={stats} />
                )}

                {activeTab === 'settings' && (
                    <PartnerSettings restaurant={restaurant} onUpdate={setRestaurant} />
                )}
            </main>
        </div>
    );
};

export default PartnerDashboard;
