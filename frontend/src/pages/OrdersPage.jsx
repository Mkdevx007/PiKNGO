import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import { ShoppingBag, Clock, CheckCircle, Package, Timer, MapPin } from 'lucide-react';
import './OrdersPage.css';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await orderApi.getMyOrders();
                setOrders(res.data || []);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return '#f59e0b';
            case 'PREPARING': return '#3b82f6';
            case 'DELIVERED': return '#10b981';
            case 'CANCELLED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    if (loading) return <div className="loading-state">Loading your culinary history...</div>;

    return (
        <div className="orders-page animate-fade-in">
            <div className="container">
                <header className="orders-header">
                    <h1>My <span className="gradient-text">Orders</span></h1>
                    <p>Track and manage your recent meal journeys</p>
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
                            <div key={order.id} className="order-card glass-card animate-scale-in">
                                <div className="order-main">
                                    <div className="order-header">
                                        <div className="res-info">
                                            <h3>{order.restaurantName}</h3>
                                            <p className="order-date">{new Date(order.createdTs).toLocaleDateString()} at {new Date(order.createdTs).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                        </div>
                                        <div className="order-status" style={{ backgroundColor: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status), borderColor: getStatusColor(order.status) }}>
                                            {order.status}
                                        </div>
                                    </div>

                                    <div className="order-items-summary">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="summary-item">
                                                <span>{item.quantity}x {item.itemName}</span>
                                                <span>₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-footer">
                                        <div className="footer-left">
                                            <p className="delivery-loc"><MapPin size={14} /> {order.deliveryAddress}</p>
                                        </div>
                                        <div className="footer-right">
                                            <span className="total-label">Total Paid:</span>
                                            <span className="total-val">₹{order.totalAmount}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="order-actions">
                                    <button className="btn-glass-slim">View Details</button>
                                    <button className="btn-primary-slim">Track Order</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
