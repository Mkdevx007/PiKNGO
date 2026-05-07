import React from 'react';
import { 
    X, Package, User, Store, MapPin, 
    CreditCard, Calendar, Clock, ChevronRight,
    Shield, Smartphone, Truck, Info, Activity,
    Hash, ExternalLink, RefreshCw
} from 'lucide-react';
import OrderStatusStepper from '../OrderStatusStepper/OrderStatusStepper';
import './GlobalOrderDetailsModal.css';

const GlobalOrderDetailsModal = ({ isOpen, onClose, order, onUpdateStatus }) => {
    if (!isOpen || !order) return null;

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="tactical-hud-window animate-hud-entry" onClick={e => e.stopPropagation()}>
                {/* Tactical Scanline Effect */}
                <div className="hud-scanline"></div>
                
                {/* Header: Tactical ID & Control */}
                <header className="hud-header">
                    <div className="hud-header-info">
                        <div className="tactical-icon-box">
                            <Shield size={20} />
                        </div>
                        <div className="id-data">
                            <div className="flex items-center gap-2">
                                <span className="label-tactical">ORDER_IDENTIFIER</span>
                                <span className="status-indicator-dot active"></span>
                            </div>
                            <h2 className="order-id-mono">#{order.id?.toUpperCase().substring(0, 18)}<span className="cursor-blink">_</span></h2>
                        </div>
                    </div>
                    <div className="hud-header-actions">
                        <button className="tactical-refresh-btn" title="Re-sync Intel">
                            <RefreshCw size={16} />
                        </button>
                        <button className="hud-close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </header>

                <div className="hud-layout-grid">
                    {/* Left Column: Transmission & Participants */}
                    <div className="hud-col-left">
                        {/* Status Module */}
                        <section className="hud-module status-module">
                            <div className="module-header">
                                <Activity size={14} className="text-orange" />
                                <span>TRANSMISSION_STATUS</span>
                            </div>
                            <div className="status-control-container">
                                <div className="current-status-display">
                                    <span className={`status-text-large ${order.status?.toLowerCase()}`}>
                                        {order.status || 'PROCESSING'}
                                    </span>
                                </div>
                                <select 
                                    className={`tactical-dropdown ${order.status?.toLowerCase()}`}
                                    value={order.status || 'PENDING'}
                                    onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                                >
                                    {['PENDING', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(s => (
                                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        </section>

                        {/* Participants Module */}
                        <section className="hud-module participants-module">
                            <div className="module-header">
                                <Hash size={14} />
                                <span>PARTICIPANT_TELEMETRY</span>
                            </div>
                            <div className="telemetry-grid">
                                <div className="tele-node glass-tactical">
                                    <Store size={16} />
                                    <div className="node-info">
                                        <span className="label-mini">ORIGIN</span>
                                        <div className="flex items-center gap-3">
                                            <p>{order.restaurantName}</p>
                                            <button 
                                                className="tactical-link-btn"
                                                onClick={() => window.location.href = `/restaurant/${order.restaurantId}`}
                                            >
                                                <ExternalLink size={10} />
                                                <span>VIEW_MENU</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="tele-node glass-tactical">
                                    <User size={16} />
                                    <div className="node-info">
                                        <span className="label-mini">RECIPIENT</span>
                                        <p>{order.userName}</p>
                                    </div>
                                </div>
                                <div className="tele-node glass-tactical">
                                    {order.isSelfPickup ? <Smartphone size={16} /> : <Truck size={16} />}
                                    <div className="node-info">
                                        <span className="label-mini">METHOD</span>
                                        <p>{order.isSelfPickup ? 'SELF-EXTRACTION' : 'DELIVERY_NODE'}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Logistics Module */}
                        <section className="hud-module logistics-module">
                            <div className="module-header">
                                <MapPin size={14} />
                                <span>LOGISTICS_COORD</span>
                            </div>
                            <div className="coord-data-card glass-tactical">
                                <p className="address-p">{order.deliveryAddress || 'LOCAL_PICKUP_ZONE'}</p>
                                <button className="map-link-btn">
                                    <ExternalLink size={12} />
                                    <span>MAP_VIEW</span>
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Manifest & Financials */}
                    <div className="hud-col-right">
                        {/* Manifest Module */}
                        <section className="hud-module manifest-module">
                            <div className="module-header">
                                <Package size={14} />
                                <span>ITEMIZED_MANIFEST</span>
                            </div>
                            <div className="tactical-list glass-tactical">
                                {(order.items || []).map((item, idx) => (
                                    <div key={idx} className="tactical-item-row">
                                        <div className="it-data">
                                            <span className="it-qty">[{item.quantity}x]</span>
                                            <span className="it-name">{item.itemName.toUpperCase()}</span>
                                        </div>
                                        <span className="it-price">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Financials Module */}
                        <section className="hud-module financial-module">
                            <div className="module-header">
                                <CreditCard size={14} />
                                <span>FINANCIAL_REPORT</span>
                            </div>
                            <div className="financial-data-grid glass-tactical">
                                <div className="fin-row">
                                    <span>SUBTOTAL</span>
                                    <span>₹{order.totalAmount}</span>
                                </div>
                                <div className="fin-row">
                                    <span>TAX/FEE_NODE</span>
                                    <span>[INCLUDED]</span>
                                </div>
                                <div className="total-terminal-row">
                                    <span className="label-total">VAL_TOTAL</span>
                                    <span className="value-total">₹{order.totalAmount}</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer: Timeline Protocol */}
                <footer className="hud-footer">
                    <div className="timeline-protocol-container">
                        <div className="module-header mb-6">
                            <Clock size={14} />
                            <span>ACTIVE_PROTOCOL_STREAMS</span>
                        </div>
                        <OrderStatusStepper currentStatus={order.status} />
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default GlobalOrderDetailsModal;
