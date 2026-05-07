import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Loader2, Timer, Activity, ChevronRight } from 'lucide-react';
import { orderApi } from '../../services/api';
import './ActiveOrderBar.css';

const getProgressWidth = (status) => {
    switch (status?.toUpperCase()) {
        case 'PENDING': return '20%';
        case 'CONFIRMED': return '40%';
        case 'PREPARING': return '60%';
        case 'READY': return '85%';
        case 'DELIVERED': return '100%';
        default: return '10%';
    }
};

const getEstTime = (status) => {
    switch (status?.toUpperCase()) {
        case 'PENDING': return 'Searching Hub...';
        case 'PREPARING': return 'In Extraction...';
        case 'READY': return 'Ready for Pickup';
        default: return 'ETA: 15-20m';
    }
};

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
        <div className="active-order-hud-container animate-slide-up">
            <div className="active-order-hud glass-modern">
                <div className="hud-telemetry-layer"></div>
                <div className="hud-main-content">
                    <div className="hud-status-node">
                        <div className="pulse-icon-elite">
                            <Activity size={20} className="pulse-icon-svg" />
                            <span className="pulse-dot"></span>
                        </div>
                        <div className="hud-intel">
                            <span className="hud-acct">TRANS-LINK ID: #{activeOrder.id?.toString().substring(0,8).toUpperCase()}</span>
                            <p className="hud-status-report">
                                STATUS: <span className="highlight">{activeOrder.status?.replace('_', ' ') || 'ACTIVE'}</span>
                            </p>
                        </div>
                    </div>
                    
                    <div className="hud-progress-module">
                        <div className="hud-progress-track">
                             <div className="hud-progress-fill" style={{ width: getProgressWidth(activeOrder.status) }}></div>
                        </div>
                        <span className="hud-time-est">{getEstTime(activeOrder.status)}</span>
                    </div>

                    <button className="hud-extraction-btn" onClick={() => navigate('/orders')}>
                        <span>VIEW HUD</span>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActiveOrderBar;
