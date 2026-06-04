import React, { useState, useEffect } from 'react';
import { 
    Bike, MapPin, Package, Navigation, 
    CheckCircle2, Clock, Map as MapIcon, 
    ChevronRight, Power, Activity, ShoppingBag,
    User, Phone, LogOut, RefreshCw,
    GripVertical, Radio, Wallet, History,
    Sun, Moon, AlertTriangle, Star
} from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { orderApi, authApi, sosApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import OrderChat from '../components/OrderChat/OrderChat';
import RiderMap from '../components/RiderMap/RiderMap';
import EarningsChart from '../components/EarningsChart/EarningsChart';
import './RiderDashboard.css';

const RiderDashboard = () => {
    const { showToast } = useToast();
    const [rider, setRider] = useState(null);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('available'); // 'available', 'active', 'wallet', 'history'
    const [stompClient, setStompClient] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const [currentPos, setCurrentPos] = useState(null);
    const [isDayMode, setIsDayMode] = useState(false);

    // Real history and metrics calculation
    const completedOrders = myOrders.filter(o => o.status === 'DELIVERED');
    const activeTasks = myOrders.filter(o => o.status !== 'DELIVERED');
    const totalEarnings = completedOrders.reduce((sum, order) => sum + (order.totalAmount * 0.1), 0); // Mock 10% commission

    const acceptanceRate = "94%"; // Keep mocked for now
    const onTimeRate = "98%"; // Keep mocked for now


    useEffect(() => {
        fetchRiderProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (rider) {
            fetchOrders();
            const interval = setInterval(fetchOrders, 30000);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rider, activeTab]);

    // WebSocket Setup
    useEffect(() => {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';
        const wsUrl = baseUrl.replace('/api/v1', '') + '/ws-orders';
        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            reconnectDelay: 5000,
            debug: (str) => { console.log(str); }
        });

        client.onConnect = () => {
            setIsLive(true);
            setStompClient(client);
        };

        client.onStompError = () => setIsLive(false);
        client.onWebSocketClose = () => setIsLive(false);

        client.activate();
        return () => client.deactivate();
    }, []);

    // Geolocation Tracking
    useEffect(() => {
        if (!navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setCurrentPos({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                });
            },
            (err) => console.error("Geolocation error:", err),
            { enableHighAccuracy: true }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Broadcast Location to Server
    useEffect(() => {
        if (!isLive || !stompClient || !currentPos || myOrders.length === 0) return;

        const activeOrder = myOrders.find(o => ['PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.status));
        if (activeOrder) {
            stompClient.publish({
                destination: '/app/update-location',
                body: JSON.stringify({
                    orderId: activeOrder.id,
                    latitude: currentPos.latitude,
                    longitude: currentPos.longitude
                })
            });
        }
    }, [currentPos, isLive, stompClient, myOrders]);

    const fetchRiderProfile = async () => {
        try {
            const data = await authApi.getProfile();
            setRider(data);
        } catch (_err) {
            showToast("Failed to fetch rider profile", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            if (activeTab === 'available') {
                const res = await orderApi.getAvailableOrders();
                setAvailableOrders(res || []);
            } else if (activeTab === 'active') {
                const res = await orderApi.getRiderOrders();
                setMyOrders(res || []);
            }
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        }
    };

    const handleClaimOrder = async (orderId) => {
        try {
            await orderApi.claimOrder(orderId);
            showToast("Order claimed successfully!", "success");
            setActiveTab('active');
            fetchOrders();
        } catch (err) {
            showToast(err.message || "Failed to claim order", "error");
        }
    };

    const handleUpdateStatus = async (orderId, status) => {
        try {
            await orderApi.updateStatus(orderId, status);
            showToast(`Order marked as ${status}`, "success");
            fetchOrders();
        } catch (_err) {
            showToast("Failed to update status", "error");
        }
    };

    const handleNavigate = (order) => {
        if (order.deliveryLatitude && order.deliveryLongitude) {
            // Navigate using GPS coordinates
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLatitude},${order.deliveryLongitude}`, '_blank');
        } else {
            // Fallback to address text search
            const query = encodeURIComponent(order.deliveryAddress + ', ' + (order.restaurantName || ''));
            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
        }
    };

    const handleSOS = async () => {
        try {
            const lat = currentPos ? currentPos.latitude : 0.0;
            const lng = currentPos ? currentPos.longitude : 0.0;
            await sosApi.triggerSos(lat, lng);
            showToast("SOS Alert triggered! Support Team is notified.", "error");
        } catch (err) {
            showToast("Failed to trigger SOS from server, falling back to local alert", "error");
            console.error(err);
        }
    };

    if (loading) return (
        <div className="rider-loading">
            <RefreshCw className="animate-spin" size={40} />
            <p>Scanning Network for Transmissions...</p>
        </div>
    );

    return (
        <div className={`rider-dashboard animate-fade-in ${isDayMode ? 'day-mode' : ''}`}>
            <header className="rider-header glass-modern">
                <div className="rider-info">
                    <div className="rider-avatar">
                        <Bike size={24} />
                    </div>
                    <div>
                        <h1>Rider Hub</h1>
                        <p>{rider?.firstName} {rider?.lastName} // {rider?.phoneNumber}</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-theme-toggle" onClick={() => setIsDayMode(!isDayMode)}>
                        {isDayMode ? <Moon size={18}/> : <Sun size={18}/>}
                    </button>
                    <div className={`connection-status ${isLive ? 'live' : 'offline'}`}>
                        <Radio size={14} className={isLive ? 'animate-pulse' : ''} />
                        <span>{isLive ? 'GPS LINK ACTIVE' : 'OFFLINE'}</span>
                    </div>
                    <button className="btn-logout-glass" onClick={() => { authApi.logout(); window.location.href = '/login'; }}>
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            <div className="rider-stats-strip">
                <div className="stat-card glass-modern">
                    <Activity size={20} className="text-orange" />
                    <div className="stat-val">{activeTasks.length}</div>
                    <div className="stat-label">Active Tasks</div>
                </div>
                <div className="stat-card glass-modern">
                    <CheckCircle2 size={20} className="text-blue" />
                    <div className="stat-val">{onTimeRate}</div>
                    <div className="stat-label">On-Time Rate</div>
                </div>
                <div className="stat-card glass-modern">
                    <Star size={20} style={{color: '#eab308'}} />
                    <div className="stat-val">4.9</div>
                    <div className="stat-label">Rating</div>
                </div>
            </div>

            <nav className="rider-tabs glass-modern">
                <button 
                    className={`rider-tab ${activeTab === 'available' ? 'active' : ''}`}
                    onClick={() => setActiveTab('available')}
                >
                    <Package size={16}/> AVAILABLE <span className="count-dot">{availableOrders.length}</span>
                </button>
                <button 
                    className={`rider-tab ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    <Activity size={16}/> MY TASKS <span className="count-dot">{activeTasks.length}</span>
                </button>
                <button 
                    className={`rider-tab ${activeTab === 'wallet' ? 'active' : ''}`}
                    onClick={() => setActiveTab('wallet')}
                >
                    <Wallet size={16}/> WALLET
                </button>
                <button 
                    className={`rider-tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <History size={16}/> HISTORY
                </button>
            </nav>

            <main className="rider-main">
                {activeTab === 'available' && (
                    <div className="order-grid">
                        {availableOrders.length === 0 ? (
                            <div className="empty-state">
                                <ShoppingBag size={48} opacity={0.2} />
                                <p>All clear. No orders waiting for pickup.</p>
                            </div>
                        ) : (
                            availableOrders.map(order => (
                                <div key={order.id} className="rider-order-card glass-modern animate-scale-in">
                                    <div className="order-header">
                                        <span className="order-tag"># {order.id.substring(0,8).toUpperCase()}</span>
                                        <span className="order-price">₹{order.totalAmount}</span>
                                    </div>
                                    <div className="order-body">
                                        <div className="location-step">
                                            <div className="dot-line"></div>
                                            <div className="step">
                                                <MapPin size={14} className="text-orange" />
                                                <div className="info">
                                                    <label>PICKUP</label>
                                                    <p>{order.restaurantName}</p>
                                                </div>
                                            </div>
                                            <div className="step">
                                                <Navigation size={14} className="text-blue" />
                                                <div className="info">
                                                    <label>DELIVER TO</label>
                                                    <p>{order.deliveryAddress}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="btn-claim" onClick={() => handleClaimOrder(order.id)}>
                                        CLAIM ORDER
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'active' && (
                    <div className="order-grid">
                        {myOrders.length === 0 ? (
                            <div className="empty-state">
                                <Activity size={48} opacity={0.2} />
                                <p>You have no active tasks. Claim some orders!</p>
                            </div>
                        ) : (
                            myOrders.map(order => (
                                <div key={order.id} className={`rider-order-card glass-modern active ${order.status.toLowerCase()}`}>
                                    {/* Map Component integrated for active order */}
                                    <RiderMap 
                                        riderPos={currentPos ? [currentPos.latitude, currentPos.longitude] : null}
                                        storePos={(order.restaurantLatitude && order.restaurantLongitude) ? [order.restaurantLatitude, order.restaurantLongitude] : null}
                                        userPos={(order.deliveryLatitude && order.deliveryLongitude) ? [order.deliveryLatitude, order.deliveryLongitude] : null}
                                    />

                                    <div className="order-header">
                                        <span className="status-indicator">{order.status}</span>
                                        <span className="order-tag"># {order.id.substring(0,8).toUpperCase()}</span>
                                    </div>
                                    <div className="order-body">
                                        <div className="customer-info">
                                            <div className="user-icon"><User size={16}/></div>
                                            <div>
                                                <div className="user-name">{order.userName}</div>
                                                <div className="user-phone"><Phone size={12}/> {order.phoneNumber || '9876543210'}</div>
                                            </div>
                                        </div>
                                        <div className="address-box glass">
                                            <MapPin size={16} />
                                            <p>{order.deliveryAddress}</p>
                                        </div>
                                    </div>
                                    <div className="rider-actions">
                                        <button className="btn-status navigate" onClick={() => handleNavigate(order)}>
                                            <Navigation size={16} /> NAVIGATE
                                        </button>
                                        
                                        {order.status === 'PICKED_UP' && (
                                            <button className="btn-status out" onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}>
                                                OUT FOR DELIVERY
                                            </button>
                                        )}
                                        {order.status === 'OUT_FOR_DELIVERY' && (
                                            <button className="btn-status deliver" onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}>
                                                MARK AS DELIVERED
                                            </button>
                                        )}
                                        {order.status === 'DELIVERED' && (
                                            <div className="completed-tag">
                                                <CheckCircle2 size={16} /> COMPLETED
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'wallet' && (
                    <div style={{padding: '0 1.5rem'}}>
                        <div className="wallet-card">
                            <div>
                                <div className="wallet-label">Available Balance</div>
                                <div className="wallet-balance">₹{totalEarnings.toFixed(2)}</div>
                                <p style={{margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem'}}>Based on {completedOrders.length} completed orders</p>
                            </div>
                            <button className="btn-withdraw">WITHDRAW</button>
                        </div>
                        <EarningsChart />
                    </div>
                )}

                {activeTab === 'history' && (
                    <div style={{padding: '0 1.5rem'}}>
                        <div className="history-list">
                            {completedOrders.length === 0 ? (
                                <div className="empty-state">
                                    <p>No delivery history yet.</p>
                                </div>
                            ) : (
                                completedOrders.map((order, i) => (
                                    <div key={order.id} className="history-item">
                                        <div>
                                            <div style={{fontWeight: 800, marginBottom: '4px'}}>{order.deliveryAddress}</div>
                                            <div className="history-date">{new Date(order.createdTs).toLocaleString()} • ID: {order.id.substring(0,8).toUpperCase()}</div>
                                        </div>
                                        <div style={{textAlign: 'right'}}>
                                            <div className="history-price">+₹{(order.totalAmount * 0.1).toFixed(2)}</div>
                                            <div style={{color: '#eab308', fontSize: '0.8rem', fontWeight: '800'}}>★ 5.0</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Floating SOS Button */}
            <button className="btn-sos" onClick={handleSOS} title="Emergency SOS">
                <AlertTriangle size={24} />
            </button>

            {/* Real-time Order Chat */}
            <OrderChat 
                orders={myOrders}
                currentUserId={rider?.id?.toString()}
                currentUserName={rider?.firstName ? `${rider.firstName} ${rider.lastName}` : 'Rider'}
                currentUserRole="DELIVERY_RIDER"
            />
        </div>
    );
};

export default RiderDashboard;
