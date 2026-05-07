import React, { useState, useEffect } from 'react';
import { 
    ShoppingBag, Search, Filter, 
    Calendar, CheckCircle, Clock, 
    Store, User, CreditCard, ChevronRight, MapPin,
    Edit2, Check, X, ChevronLeft, Truck, Smartphone
} from 'lucide-react';
import { orderApi } from '../services/api';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './GlobalOrders.css';
import './ManageUsers.css'; // Borrowing pagination and skeleton styles

import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/Common/Skeleton';
import { restaurantApi } from '../services/api';
import GlobalOrderDetailsModal from '../components/Admin/GlobalOrderDetailsModal';

const GlobalOrders = () => {
    const { showToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All'); 
    const [restaurantFilter, setRestaurantFilter] = useState('All');
    const [availableRestaurants, setAvailableRestaurants] = useState([]);
    const [sortBy, setSortBy] = useState('newest'); 
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [tempAddress, setTempAddress] = useState('');
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0
    });
    const [isLive, setIsLive] = useState(false);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    useEffect(() => {
        fetchOrders(pagination.page);
    }, [pagination.page]);

    useEffect(() => {
        fetchRestaurants();

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
                const newOrder = JSON.parse(message.body);
                
                showToast(`New ${newOrder.isSelfPickup ? 'Pickup' : 'Delivery'} Order from ${newOrder.userName} at ${newOrder.restaurantName} (₹${newOrder.totalAmount})`, 'success');
                
                if (pagination.page === 0) {
                    fetchOrders(0, false);
                }
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

    const fetchOrders = async (page, showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const data = await orderApi.getAllOrders(page, pagination.size);
            if (data && data.content) {
                setOrders(data.content);
                setPagination({
                    page: data.number,
                    size: data.size,
                    totalElements: data.totalElements,
                    totalPages: data.totalPages
                });
            }
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            showToast('Failed to load global orders', 'error');
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    const fetchRestaurants = async () => {
        try {
            const res = await restaurantApi.getAll();
            setAvailableRestaurants(res || []);
        } catch (err) {
            console.error("Failed to fetch restaurants:", err);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await orderApi.updateStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
                setSelectedOrderDetails(prev => ({ ...prev, status: newStatus }));
            }
            showToast(`Order #${orderId.substring(0, 6)} updated to ${newStatus}`, 'info');
        } catch (err) {
            console.error("Failed to update status:", err);
            showToast('Failed to update order status', 'error');
        }
    };

    const handleUpdateAddress = async (orderId) => {
        if (!tempAddress.trim()) return;
        try {
            await orderApi.updateAddress(orderId, tempAddress);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryAddress: tempAddress } : o));
            setEditingAddressId(null);
            showToast('Delivery address updated', 'info');
        } catch (err) {
            console.error("Failed to update address:", err);
            showToast('Failed to update address', 'error');
        }
    };

    // Note: Server-side filtering is preferred for large datasets, 
    // but we'll keep client-side for immediate UX feel if the page size is small.
    const filteredOrders = (orders || []).filter(order => {
        if (!order) return false;
        const matchesSearch = (order.restaurantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (order.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             ((order.id || '').toString()).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        const matchesType = typeFilter === 'All' || 
                           (typeFilter === 'Pickup' && order.isSelfPickup) || 
                           (typeFilter === 'Delivery' && !order.isSelfPickup);
        const matchesRestaurant = restaurantFilter === 'All' || order.restaurantName === restaurantFilter;
        return matchesSearch && matchesStatus && matchesType && matchesRestaurant;
    });

    const isOrderUrgent = (order) => {
        if (order.status !== 'PENDING' && order.status !== 'PREPARING') return false;
        const diffInMinutes = (new Date() - new Date(order.createdTs)) / (1000 * 60);
        return diffInMinutes > 20;
    };

    return (
        <div className="global-orders-page animate-fade-in">
            <header className="page-header-row">
                <div className="header-left">
                    <h1>Order <span className="gradient-text">Mission Control</span></h1>
                    <div className="live-status-container">
                        <p>Monitoring {pagination.totalElements} transactions across the network</p>
                        <div className={`live-indicator ${isLive ? 'active' : 'reconnecting'}`}>
                            <div className="ping-circle"></div>
                            <span>{isLive ? 'LIVE' : 'RECONNECTING...'}</span>
                        </div>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="stat-badge glass">
                        <Clock size={14} className="text-orange" />
                        <span>{(orders || []).filter(o => o?.status === 'PENDING').length} Pending on this page</span>
                    </div>
                </div>
            </header>

            <div className="orders-filters glass-card">
                <div className="search-box-large">
                    <Search size={20} />
                    <input 
                        type="text" 
                        placeholder="Search current page results..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-scroll">
                    {['All', 'PENDING', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(status => (
                        <button 
                            key={status}
                            className={`status-pill-filter ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
                <div className="orders-type-segment">
                    <button className={`segment-btn ${typeFilter === 'All' ? 'active' : ''}`} onClick={() => setTypeFilter('All')}>
                        All Types
                    </button>
                    <button className={`segment-btn ${typeFilter === 'Delivery' ? 'active' : ''}`} onClick={() => setTypeFilter('Delivery')}>
                        <Truck size={14} /> Delivery
                    </button>
                    <button className={`segment-btn ${typeFilter === 'Pickup' ? 'active' : ''}`} onClick={() => setTypeFilter('Pickup')}>
                        <Smartphone size={14} /> Pickup
                    </button>
                </div>
                
                <div className="restaurant-filter-box">
                    <Filter size={16} className="text-amber" />
                    <select 
                        className="restaurant-select"
                        value={restaurantFilter}
                        onChange={(e) => setRestaurantFilter(e.target.value)}
                    >
                        <option value="All">All Restaurants</option>
                        {(availableRestaurants || []).map(res => (
                            <option key={res?.id} value={res?.restaurantName}>{res?.restaurantName}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="orders-list-grid">
                {loading ? (
                    <div className="span-full">
                        <TableSkeleton rows={10} />
                    </div>
                ) : (filteredOrders || []).length === 0 ? (
                    <div className="empty-state-missions span-full">
                        <div className="empty-globe">
                            <Search size={40} className="globe-icon" />
                            <div className="radar-sweep"></div>
                        </div>
                        <h3>Network Clear: Zero Active Orders</h3>
                        <p>No transactions match your current surveillance parameters.</p>
                        {(statusFilter !== 'All' || typeFilter !== 'All' || searchTerm) && (
                            <button className="reset-filters-btn" onClick={() => { setStatusFilter('All'); setTypeFilter('All'); setSearchTerm(''); }}>
                                Reset All Filters
                            </button>
                        )}
                    </div>
                ) : (
                    (filteredOrders || []).map(order => (
                        <div 
                            key={order?.id} 
                            className={`order-pro-card glass-card animate-scale-in ${isOrderUrgent(order) ? 'status-urgent' : ''}`}
                            onClick={() => {
                                setSelectedOrderDetails(order);
                                setIsDetailsModalOpen(true);
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            {isOrderUrgent(order) && <div className="urgency-banner">LATE ORDER ACTION REQUIRED</div>}
                            <div className="order-card-header">
                                <div className="flex flex-col">
                                    <span className="order-id-badge">#{order?.id?.substring(0, 8) || 'ORDER'}</span>
                                    <span className="text-[10px] opacity-40 mt-1 font-bold">CLICK FOR INSIGHTS</span>
                                </div>
                                <select 
                                    className={`status-dropdown ${order?.status?.toLowerCase() || 'pending'}`}
                                    value={order?.status || 'PENDING'}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="PREPARING">Preparing</option>
                                    <option value="READY">Ready</option>
                                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                            
                            <div className="order-card-body">
                                <div className="participant-info">
                                    <div className="participant">
                                        <Store size={14} /> 
                                        <strong>{order.restaurantName}</strong>
                                        <button 
                                            className="view-menu-mini-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.location.href = `/restaurant/${order.restaurantId}`;
                                            }}
                                        >
                                            View Menu
                                        </button>
                                    </div>
                                    <div className="participant"><User size={14} /> <span>{order.userName}</span></div>
                                </div>

                                {order.deliveryAddress && !order.isSelfPickup && (
                                    <div className="delivery-row">
                                        <MapPin size={12} />
                                        <p>{order.deliveryAddress}</p>
                                    </div>
                                )}

                                <div className="order-items-mini">
                                    {order.items && order.items.map((it, idx) => (
                                        <div key={idx} className="mini-item">
                                            <span>{it.quantity}x {it.itemName}</span>
                                            <span>₹{it.price * it.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="order-card-footer">
                                <span className="total-label">Total</span>
                                <span className="total-value">₹{order.totalAmount}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {pagination.totalPages > 1 && (
                <div className="pagination-controls glass animate-fade-in mb-8">
                    <button disabled={pagination.page === 0} onClick={() => handlePageChange(pagination.page - 1)} className="page-btn">
                        <ChevronLeft size={18} />
                    </button>
                    <span className="page-info">Page {pagination.page + 1} of {pagination.totalPages}</span>
                    <button disabled={pagination.page === pagination.totalPages - 1} onClick={() => handlePageChange(pagination.page + 1)} className="page-btn">
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}

            <GlobalOrderDetailsModal 
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                order={selectedOrderDetails}
                onUpdateStatus={handleUpdateStatus}
            />
        </div>
    );
};

export default GlobalOrders;
