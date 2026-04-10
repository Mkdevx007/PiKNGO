import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Loader2, Timer } from 'lucide-react';
import { orderApi } from '../../services/api';
import './ActiveOrderBar.css';

const ActiveOrderBar = () => {
    const [activeOrder, setActiveOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Hide if on orders page already
    const isOrdersPage = location.pathname === '/orders';
    const isLoginPage = location.pathname === '/login' || location.pathname === '/register';

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (isOrdersPage || isLoginPage || !userId) {
            setActiveOrder(null);
            setLoading(false);
            return;
        }

        const fetchActiveOrders = async () => {
            try {
                const orders = await orderApi.getMyOrders();
                // Include all active states from pending to delivery
                const activeStates = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'PICKED_UP'];
                const ongoing = (orders || []).find(o => 
                    activeStates.includes(o.status?.toUpperCase())
                );
                setActiveOrder(ongoing || null);
            } catch (err) {
                console.warn("ActiveOrderBar: Failed to fetch orders");
            } finally {
                setLoading(false);
            }
        };

        fetchActiveOrders();
        const interval = setInterval(fetchActiveOrders, 10000); // Poll every 10s for snappier updates
        return () => clearInterval(interval);
    }, [location.pathname, isOrdersPage, isLoginPage]);

    if (loading || !activeOrder || isOrdersPage || isLoginPage) return null;

    return (
        <div className="active-order-bar-container animate-slide-up">
            <div className="active-order-bar glass-modern">
                <div className="order-info">
                    <div className="pulse-icon">
                        <Timer size={20} className="text-orange" />
                        <span className="pulse-ring"></span>
                    </div>
                    <div className="text-details">
                        <span className="status-label">Ongoing Order #{activeOrder.id?.toString().substring(0,6) || 'TRACK'}</span>
                        <p className="status-text">Status: <strong>{activeOrder.status || 'Active'}</strong></p>
                    </div>
                </div>
                <button className="track-btn" onClick={() => navigate('/orders')}>
                    <span>Track Order</span>
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default ActiveOrderBar;
