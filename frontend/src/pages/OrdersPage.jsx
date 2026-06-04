import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import { ShoppingBag, Clock, CheckCircle, Package, Timer, MapPin, Activity, Utensils, Search } from 'lucide-react';
import OrderDetailsModal from '../components/OrderDetailsModal/OrderDetailsModal';
import OrderChat from '../components/OrderChat/OrderChat';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { authApi } from '../services/api';
import './OrdersPage.css';

import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/Common/Skeleton';
import OrderStatusStepper from '../components/OrderStatusStepper/OrderStatusStepper';
import ReviewForm from '../components/Reviews/ReviewForm';

const OrdersPage = () => {
    const { showToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [orderToReview, setOrderToReview] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const [riderLocations, setRiderLocations] = useState({}); // { orderId: { lat, lng } }
    const [stompClient, setStompClient] = useState(null);

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
        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            reconnectDelay: 5000,
            debug: (str) => { console.log(str); }
        });
        setStompClient(client);

        client.onConnect = () => {
            setIsLive(true);
            client.subscribe('/topic/orders', (message) => {
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

        client.onStompError = (error) => {
            console.error("WebSocket connection error:", error);
            setIsLive(false);
        };

        client.onWebSocketClose = () => {
            setIsLive(false);
        };

        client.activate();

        return () => {
            client.deactivate();
        };
    }, []);

    // Effect to subscribe to tracking when orders change or connection established
    useEffect(() => {
        if (!isLive || !stompClient || orders.length === 0) return;

        const subscriptions = [];
        orders.forEach(order => {
            if (['PICKED_UP', 'OUT_FOR_DELIVERY'].includes(order.status)) {
                const sub = stompClient.subscribe(`/topic/order-tracking/${order.id}`, (message) => {
                    const update = JSON.parse(message.body);
                    setRiderLocations(prev => ({
                        ...prev,
                        [update.orderId]: { latitude: update.latitude, longitude: update.longitude }
                    }));
                });
                subscriptions.push(sub);
            }
        });

        return () => {
            subscriptions.forEach(s => s.unsubscribe());
        };
    }, [isLive, stompClient, orders]);

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
                            <div key={order.id} className="order-card-hub glass-modern animate-scale-in">
                                <div className="order-main-content">
                                    <header className="card-header-elite">
                                        <div className="brand-intel">
                                            <div className="hub-logo">
                                                <Utensils size={20} />
                                            </div>
                                            <div className="brand-details">
                                                <h3>{order.restaurantName || 'Elite Dining'}</h3>
                                                <p className="order-id">TRANSMISSION ID: #{order.id?.toString().substring(0, 8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="status-intel">
                                            <div className="status-pill" style={{ 
                                                backgroundColor: `${getStatusColor(order.status)}15`, 
                                                color: getStatusColor(order.status), 
                                                borderColor: `${getStatusColor(order.status)}40` 
                                            }}>
                                                <span className="status-dot" style={{ backgroundColor: getStatusColor(order.status) }}></span>
                                                {order.status || 'PROCESSING'}
                                            </div>
                                            <p className="order-time-stamp">
                                                {order.createdTs ? new Date(order.createdTs).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                                            </p>
                                        </div>
                                    </header>

                                    <div className="tracking-terminal-section">
                                        <OrderStatusStepper currentStatus={order.status} />
                                    </div>

                                    <div className="order-inventory-summary glass-modern">
                                        <div className="summary-header">
                                            <Package size={16} />
                                            <span>ORDER MANIFEST</span>
                                        </div>
                                        <div className="inventory-list">
                                            {(order.items || []).map((item, idx) => (
                                                <div key={item.id || idx} className="inventory-row">
                                                    <span className="item-qty">{item.quantity}x</span>
                                                    <span className="item-name">{item.itemName || 'Item'}</span>
                                                    <span className="item-price">₹{(item.price || 0) * (item.quantity || 1)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="inventory-footer">
                                            <div className="location-intel">
                                                <MapPin size={14} />
                                                <span>{order.deliveryAddress || 'Pick-up'}</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                {order.pointsEarned > 0 && (
                                                    <div className="points-award-pill">
                                                        <span>+{order.pointsEarned} ELITE POINTS</span>
                                                    </div>
                                                )}
                                                <div className="total-intel">
                                                    <span className="label">TOTAL TRANSMITTED:</span>
                                                    <span className="value">₹{order.totalAmount || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <aside className="order-actions-terminal">
                                    <div className="terminal-actions-inner">
                                        <button className="action-node-btn glass-pill" onClick={() => handleViewDetails(order)}>
                                            <Search size={16} />
                                            VIEW DETAILS
                                        </button>
                                        {order?.status === 'DELIVERED' ? (
                                            <button 
                                                className="action-node-primary btn-solid-orange" 
                                                onClick={() => {
                                                    setOrderToReview(order);
                                                    setIsReviewModalOpen(true);
                                                }}
                                            >
                                                <Activity size={16} />
                                                RATE EXPERIENCE
                                            </button>
                                        ) : (
                                            <button className="action-node-primary btn-solid-orange" onClick={() => handleViewDetails(order)}>
                                                <Activity size={16} />
                                                LIVE TRACKING
                                            </button>
                                        )}
                                    </div>
                                </aside>
                            </div>
                        ))}

                    </div>
                )}
            </div>

            <OrderDetailsModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                order={selectedOrder} 
                riderLocation={selectedOrder ? riderLocations[selectedOrder.id] : null}
            />

            {isReviewModalOpen && (
                <ReviewForm 
                    restaurantId={orderToReview?.restaurantId}
                    orderId={orderToReview?.id}
                    onClose={() => setIsReviewModalOpen(false)}
                    onSuccess={() => {
                        // Optional: Refresh orders
                    }}
                />
            )}

            {/* Real-time Order Chat */}
            <OrderChat 
                orders={orders}
                currentUserId={localStorage.getItem('userId')}
                currentUserName={localStorage.getItem('phone')}
                currentUserRole="USER"
            />
        </div>
    );
};

export default OrdersPage;
