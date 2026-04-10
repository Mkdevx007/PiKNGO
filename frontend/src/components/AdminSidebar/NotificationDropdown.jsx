import React from 'react';
import { ShoppingBag, Clock, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './NotificationDropdown.css';

const NotificationDropdown = ({ notifications, onClose }) => {
    const navigate = useNavigate();

    const handleItemClick = (orderId) => {
        navigate('/admin/all-orders'); // In a more advanced version, we might filter for the specific order.
        onClose();
    };

    return (
        <div className="notification-dropdown glass-modern animate-fade-in-up">
            <div className="dropdown-header">
                <h3>Notifications</h3>
                <button className="close-btn" onClick={onClose}><X size={16} /></button>
            </div>
            
            <div className="notification-list scroll-y">
                {notifications.length === 0 ? (
                    <div className="empty-state">
                        <ShoppingBag size={32} />
                        <p>No new orders at the moment.</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div 
                            key={notif.id} 
                            className="notification-item"
                            onClick={() => handleItemClick(notif.id)}
                        >
                            <div className="notif-icon primary"><ShoppingBag size={14} /></div>
                            <div className="notif-content">
                                <p className="notif-text">
                                    New order <strong>#{notif.id.substring(0, 6)}</strong> from <strong>{notif.userName}</strong>
                                </p>
                                <span className="notif-time">
                                    <Clock size={10} />
                                    {new Date(notif.createdTs).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <ChevronRight size={14} className="chevron" />
                        </div>
                    ))
                )}
            </div>

            <div className="dropdown-footer" onClick={() => navigate('/admin/all-orders')}>
                View All Orders
            </div>
        </div>
    );
};

export default NotificationDropdown;
