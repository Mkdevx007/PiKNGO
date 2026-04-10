import React from 'react';
import { X, Package, MapPin, CreditCard, Clock, CheckCircle2, ChevronRight, Truck, Smartphone } from 'lucide-react';
import './OrderDetailsModal.css';

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    const getStatusSteps = (status) => {
        const allSteps = ['PENDING', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];
        const currentIndex = allSteps.indexOf(status?.toUpperCase());
        
        return allSteps.map((step, index) => ({
            label: step.replace(/_/g, ' '),
            isCompleted: index < currentIndex,
            isCurrent: index === currentIndex,
            isPending: index > currentIndex
        }));
    };

    const steps = getStatusSteps(order.status);

    return (
        <div className="modal-overlay animate-fade-in">
            <div className="order-details-modal glass-card animate-scale-in">
                <header className="modal-header">
                    <div className="header-title">
                        <Package size={24} className="text-amber" />
                        <h2>Order <span className="gradient-text">Details</span></h2>
                        <span className="order-id">#{order.id.substring(0, 8)}</span>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </header>

                <div className="modal-body scrollable">
                    {/* Status Tracking */}
                    <section className="detail-section tracking-section">
                        <h3>Live Tracking</h3>
                        <div className="tracking-timeline">
                            {steps.map((step, idx) => (
                                <div key={idx} className={`timeline-step ${step.isCompleted ? 'completed' : ''} ${step.isCurrent ? 'current' : ''}`}>
                                    <div className="step-indicator">
                                        {step.isCompleted ? <CheckCircle2 size={16} /> : <div className="dot"></div>}
                                    </div>
                                    <div className="step-label">{step.label}</div>
                                    {idx < steps.length - 1 && <div className="step-line"></div>}
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="details-grid">
                        <div className="details-main">
                            {/* Items Section */}
                            <section className="detail-section">
                                <h3>Items Ordered</h3>
                                <div className="items-list-mini">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="mini-item-row">
                                            <div className="item-info">
                                                <span className="qty">{item.quantity}x</span>
                                                <span className="name">{item.itemName}</span>
                                            </div>
                                            <span className="price">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="total-summary-row">
                                    <span>Total Amount</span>
                                    <span className="total-val">₹{order.totalAmount}</span>
                                </div>
                            </section>

                            {/* Restaurant Info */}
                            <section className="detail-section">
                                <h3>Restaurant</h3>
                                <div className="info-card glass">
                                    <div className="info-row">
                                        <div className="info-icon"><Smartphone size={16} /></div>
                                        <div className="info-content">
                                            <label>Name</label>
                                            <p>{order.restaurantName}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <aside className="details-side">
                            {/* Delivery Info */}
                            <section className="detail-section">
                                <h3>{order.isSelfPickup ? 'Pickup Info' : 'Delivery Info'}</h3>
                                <div className="info-card glass">
                                    <div className="info-row">
                                        <div className="info-icon">{order.isSelfPickup ? <Smartphone size={16} /> : <MapPin size={16} />}</div>
                                        <div className="info-content">
                                            <label>{order.isSelfPickup ? 'Type' : 'Address'}</label>
                                            <p>{order.deliveryAddress}</p>
                                        </div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-icon"><Clock size={16} /></div>
                                        <div className="info-content">
                                            <label>Placed On</label>
                                            <p>{new Date(order.createdTs).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Payment Info */}
                            <section className="detail-section">
                                <h3>Payment</h3>
                                <div className="info-card glass">
                                    <div className="info-row">
                                        <div className="info-icon"><CreditCard size={16} /></div>
                                        <div className="info-content">
                                            <label>Method</label>
                                            <p className="uppercase">{order.paymentMethod}</p>
                                        </div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-icon"><CheckCircle2 size={16} color="#10b981" /></div>
                                        <div className="info-content">
                                            <label>Status</label>
                                            <p className="text-success">Payment Captured</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>
                </div>

                <footer className="modal-footer">
                    <button className="btn-primary full" onClick={onClose}>Done</button>
                </footer>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
