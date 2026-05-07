import { useNavigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, ClipboardList, Users, CreditCard, Settings, ChevronLeft, Home, Bell, LogOut } from 'lucide-react';
import { authApi, orderApi } from '../../services/api';
import NotificationDropdown from './NotificationDropdown';
import React, { useState, useEffect } from 'react';
import Logo from '../Logo/Logo';
import './AdminSidebar.css';

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const res = await orderApi.getAllOrders();
            const orders = Array.isArray(res.data) ? res.data : (res.data?.content || []);
            const pendingOrders = orders.filter(o => o.status === 'PENDING');
            setNotifications(pendingOrders.slice(0, 10)); // Top 10 latest pending
        } catch (err) {
            console.error("Failed to fetch notification data", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const handleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: <Store size={20} />, label: 'Restaurants', path: '/admin/restaurants' },
        { icon: <ClipboardList size={20} />, label: 'Global Orders', path: '/admin/all-orders' },
        { icon: <Users size={20} />, label: 'User Governance', path: '/admin/users' },
        { icon: <CreditCard size={20} />, label: 'Promotions', path: '/admin/promotions' },
        { icon: <Settings size={20} />, label: 'Global Settings', path: '/admin/settings' },
    ];

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error("Logout failed", err);
        }
        localStorage.removeItem('phone');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        navigate('/'); // Redirect to landing page
        window.location.reload(); // Hard refresh to clear state
    };

    return (
        <aside className={`admin-sidebar glass-modern ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                {!isCollapsed && (
                    <div className="branding">
                        <Logo size={120} />
                        <span className="pro-tag">PRO</span>
                    </div>
                )}
                <button className="collapse-toggle glass-modern" onClick={() => setIsCollapsed(!isCollapsed)}>
                    <ChevronLeft size={16} className={isCollapsed ? 'rotate-180' : ''} />
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item, idx) => (
                    <NavLink 
                        key={idx} 
                        to={item.path} 
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <div className="link-icon-wrapper">{item.icon}</div>
                        {!isCollapsed && <span className="link-label">{item.label}</span>}
                        {isCollapsed && <div className="link-tooltip">{item.label}</div>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="footer-main-action">
                    <NavLink to="/" className="exit-link glass-modern" title="Return to Home">
                        <Home size={18} />
                        {!isCollapsed && <span>Back to Website</span>}
                    </NavLink>
                </div>
                <div className="footer-actions">
                    <button className={`footer-btn glass-modern ${notifications.length > 0 ? 'has-notif' : ''}`} title="Notifications" onClick={handleNotifications}>
                        <Bell size={18} />
                        {notifications.length > 0 && <span className="notification-dot pulse"></span>}
                    </button>
                    <button className="footer-btn glass-modern" title="Logout" onClick={handleLogout}>
                        <LogOut size={18} />
                    </button>
                </div>
                
                {showNotifications && (
                    <NotificationDropdown 
                        notifications={notifications} 
                        onClose={() => setShowNotifications(false)} 
                    />
                )}
            </div>
        </aside>
    );
};

export default AdminSidebar;
