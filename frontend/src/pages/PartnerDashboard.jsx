import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Utensils, ShoppingBag, 
    Settings, Star, Clock, MapPin, 
    Power, Activity, TrendingUp, DollarSign
} from 'lucide-react';
import { restaurantApi, orderApi } from '../services/api';
import './PartnerDashboard.css';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/Common/Skeleton';
import ManageMenu from './ManageMenu'; // Reuse for now

const PartnerDashboard = () => {
    const { showToast } = useToast();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalOrders: 0,
        revenue: 0,
        avgRating: 4.5
    });

    useEffect(() => {
        fetchPartnerData();
    }, []);

    const fetchPartnerData = async () => {
        setLoading(true);
        try {
            const res = await restaurantApi.getMyRestaurant();
            setRestaurant(res);
            
            // Fetch stats if available (simulated for now)
            setStats({
                totalOrders: 24,
                revenue: 12450,
                avgRating: res.rating || 4.5
            });
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
                    <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                        <Settings size={18} /> Settings
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className={`status-switch ${restaurant.isActive ? 'online' : 'offline'}`} onClick={handleToggleStatus}>
                        <Power size={14} />
                        <span>{restaurant.isActive ? 'ONLINE' : 'OFFLINE'}</span>
                    </div>
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
                                <DollarSign size={24} className="text-green" />
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
                        </div>
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div className="menu-management-section">
                        {/* We reuse ManageMenu but it needs the restaurantId passed in */}
                        <ManageMenu partnerMode={true} restaurantId={restaurant.id} />
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="orders-section glass-modern">
                        <h3>Active Transmissions</h3>
                        <p className="opacity-50">Filterable order view coming soon...</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PartnerDashboard;
