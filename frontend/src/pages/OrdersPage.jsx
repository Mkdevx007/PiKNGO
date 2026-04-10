import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import { ShoppingBag, Clock, CheckCircle, Package, Timer, MapPin, Activity } from 'lucide-react';
import OrderDetailsModal from '../components/OrderDetailsModal/OrderDetailsModal';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { authApi } from '../services/api';
import './OrdersPage.css';

import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/Common/Skeleton';
import OrderStatusStepper from '../components/OrderStatusStepper/OrderStatusStepper';
import ReviewModal from '../components/ReviewModal/ReviewModal';

const OrdersPage = () => {
    const { showToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [orderToReview, setOrderToReview] = useState(null);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // 1. Get User Profile to have userId for filtering WS messages
                try {
                    const profile = await authApi.getProfile();
                    const profileData = profile.data || profile;
                    const resolvedUserId = profileData?.id || profileData?.userId || profileData?._id;
                    if (resolvedUserId) {
                        localStorage.setItem('userId', String(resolvedUserId));
                    }
                } catch (profileErr) {
                    console.warn("Failed to fetch profile:", profileErr);
                }

                // 2. Fetch Orders
                const res = await orderApi.getMyOrders();
                const normalizedOrders = Array.isArray(res) ? res : (res?.content || []);
                setOrders(normalizedOrders);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
                showToast('Failed to load your orders', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();

        // --- WebSocket Setup ---
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';
        const wsUrl = baseUrl.replace('/api/v1', '') + '/ws-orders';
        const stompClient = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            reconnectDelay: 5000,
            debug: () => {}
        });

        stompClient.onConnect = () => {
            setIsLive(true);
            stompClient.subscribe('/topic/orders', (message) => {
                const updatedOrder = JSON.parse(message.body);
                const currentUserId = localStorage.getItem('userId');

                // Ensure My Orders only tracks this logged-in user's orders.
                if (currentUserId && updatedOrder?.userId && String(updatedOrder.userId) !== String(currentUserId)) {
                    return;
                }
                
                setOrders(prevOrders => {
                    const orderExists = prevOrders.some(o => o.id === updatedOrder.id);
                    if (orderExists) {
                        // Update existing order status
                        return prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                    } else {
                        // If it's a new order for this user (placed from another tab maybe), add it
                        return [updatedOrder, ...prevOrders];
                    }
                });
            });
        };

        stompClient.onStompError = (error) => {
            console.error("WebSocket connection error:", error);
            setIsLive(false);
        };

        stompClient.onWebSocketClose = () => {
            setIsLive(false);
        };

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, []);

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return '#f59e0b';
            case 'PREPARING': return '#3b82f6';
            case 'READY': return '#10b981';
            case 'DELIVERED': return '#059669';
            case 'CANCELLED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    if (loading) return (
        <div className="orders-page animate-fade-in">
            <div className="container">
                <header className="orders-header">
                    <div className="header-title-group">
                        <h1>Track <span className="gradient-text">Orders</span></h1>
                    </div>
                </header>
                <TableSkeleton rows={5} />
            </div>
        </div>
    );

    return (
        <div className="orders-page animate-fade-in">
            <div className="bg-mesh"></div>
            <div className="container dashboard-hub">
                <header className="orders-header">
                    <div className="header-title-group">
                        <h1 className="dash-title-elite">My <span className="gradient-text">Journey</span></h1>
                        <div className={`live-hub-badge ${isLive ? 'active' : 'connecting'}`}>
                            <Activity size={16} />
                            <span>{isLive ? 'Link Established' : 'Establishing Secure Link...'}</span>
                        </div>
                    </div>
                    <p className="dash-subtitle-elite">Synchronizing your recent meal repositories across the network.</p>
                </header>

                {orders.length === 0 ? (
                    <div className="empty-orders glass-card">
                        <ShoppingBag size={60} strokeWidth={1} />
                        <h2>No orders yet</h2>
                        <p>Seems like you haven't explored our premium tastes yet.</p>
                        <button className="btn-primary" onClick={() => window.location.href='/dashboard'}>Order Now</button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order.id} className="order-card animate-scale-in">
                                <div className="order-main">
                                    <div className="order-header">
                                        <div className="res-info">
                                            <h3>{order.restaurantName || 'Elite Dining'}</h3>
                                            <p className="order-date">{order.createdTs ? new Date(order.createdTs).toLocaleDateString() : 'Today'} • {order.createdTs ? new Date(order.createdTs).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}</p>
                                        </div>
                                        <div className="order-status" style={{ 
                                            backgroundColor: `${getStatusColor(order.status)}15`, 
                                            color: getStatusColor(order.status), 
                                            borderColor: `${getStatusColor(order.status)}40` 
                                        }}>
                                            {order.status || 'PROCESSING'}
                                        </div>
                                    </div>
                                    <OrderStatusStepper currentStatus={order.status} />

                                    <div className="order-items-summary">
                                        {(order.items || []).map((item, idx) => (
                                            <div key={item.id || idx} className="summary-item">
                                                <span>{item.quantity}x {item.itemName || 'Item'}</span>
                                                <span>₹{(item.price || 0) * (item.quantity || 1)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-footer">
                                        <div className="footer-left">
                                            <p className="delivery-loc"><MapPin size={14} /> {order.deliveryAddress || 'Pick-up'}</p>
                                        </div>
                                        <div className="footer-right">
                                            <span className="total-label">Total Paid:</span>
                                            <span className="total-val">₹{order.totalAmount || 0}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="order-actions">
                                    <button className="btn-glass-slim" onClick={() => handleViewDetails(order)}>View Details</button>
                                    {order?.status === 'DELIVERED' ? (
                                        <button 
                                            className="btn-primary-slim" 
                                            onClick={() => {
                                                setOrderToReview(order);
                                                setIsReviewModalOpen(true);
                                            }}
                                        >
                                            Rate & Review
                                        </button>
                                    ) : (
                                        <button className="btn-primary-slim" onClick={() => handleViewDetails(order)}>Track Order</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <OrderDetailsModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                order={selectedOrder} 
            />

            <ReviewModal 
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                order={orderToReview}
            />
        </div>
    );
};

export default OrdersPage;
