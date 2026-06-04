import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, MessageSquare, User, Bike, Store } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './OrderChat.css';

/**
 * OrderChat — Real-time chat between user, rider, and restaurant
 * 
 * Props:
 *   orders: array of active orders to chat about
 *   currentUserId: string — logged in user's ID
 *   currentUserName: string — logged in user's name
 *   currentUserRole: string — USER | DELIVERY_RIDER | RESTAURANT_OWNER
 */
const OrderChat = ({ orders = [], currentUserId, currentUserName, currentUserRole = 'USER' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState({}); // { orderId: [msg, msg, ...] }
    const [inputValue, setInputValue] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    const stompClientRef = useRef(null);
    const subscriptionsRef = useRef({});
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Filter only active orders (not DELIVERED or CANCELLED)
    const activeOrders = orders.filter(o => {
        const status = o.status?.toUpperCase();
        return status && !['DELIVERED', 'CANCELLED'].includes(status);
    });

    // Auto-select first active order
    useEffect(() => {
        if (activeOrders.length > 0 && !selectedOrderId) {
            setSelectedOrderId(activeOrders[0].id);
        }
    }, [activeOrders, selectedOrderId]);

    // WebSocket connection
    useEffect(() => {
        if (activeOrders.length === 0) return;

        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';
        const wsUrl = baseUrl.replace('/api/v1', '') + '/ws-orders';

        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            reconnectDelay: 5000,
            debug: () => {}
        });

        client.onConnect = () => {
            setIsConnected(true);
            stompClientRef.current = client;

            // Subscribe to all active order chat topics
            activeOrders.forEach(order => {
                if (!subscriptionsRef.current[order.id]) {
                    const sub = client.subscribe(`/topic/order-chat/${order.id}`, (message) => {
                        const chatMsg = JSON.parse(message.body);
                        
                        setMessages(prev => ({
                            ...prev,
                            [chatMsg.orderId]: [...(prev[chatMsg.orderId] || []), chatMsg]
                        }));

                        // Increment unread if chat is closed or different order is selected
                        if (!isOpen || selectedOrderId !== chatMsg.orderId) {
                            if (chatMsg.senderId !== currentUserId) {
                                setUnreadCount(prev => prev + 1);
                            }
                        }
                    });
                    subscriptionsRef.current[order.id] = sub;
                }
            });
        };

        client.onStompError = () => setIsConnected(false);
        client.onWebSocketClose = () => setIsConnected(false);
        client.activate();

        return () => {
            Object.values(subscriptionsRef.current).forEach(sub => {
                try { sub.unsubscribe(); } catch(_) {}
            });
            subscriptionsRef.current = {};
            client.deactivate();
            stompClientRef.current = null;
        };
    }, [activeOrders.map(o => o.id).join(',')]); // Re-subscribe when order list changes

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedOrderId]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
            setUnreadCount(0); // Clear unread when opened
        }
    }, [isOpen]);

    const sendMessage = useCallback(() => {
        const text = inputValue.trim();
        if (!text || !selectedOrderId || !stompClientRef.current || !isConnected) return;

        const chatMessage = {
            orderId: selectedOrderId,
            senderId: currentUserId,
            senderName: currentUserName || 'User',
            senderRole: currentUserRole,
            message: text,
            timestamp: Date.now()
        };

        stompClientRef.current.publish({
            destination: '/app/order-chat',
            body: JSON.stringify(chatMessage)
        });

        setInputValue('');
    }, [inputValue, selectedOrderId, currentUserId, currentUserName, currentUserRole, isConnected]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'DELIVERY_RIDER': return <Bike size={10} />;
            case 'RESTAURANT_OWNER': return <Store size={10} />;
            default: return <User size={10} />;
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'DELIVERY_RIDER': return 'RIDER';
            case 'RESTAURANT_OWNER': return 'RESTAURANT';
            default: return 'CUSTOMER';
        }
    };

    const currentMessages = messages[selectedOrderId] || [];
    const selectedOrder = activeOrders.find(o => o.id === selectedOrderId);

    // Don't render if no active orders
    if (activeOrders.length === 0) return null;

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    className={`order-chat-fab ${isOpen ? 'active' : ''}`}
                    onClick={() => setIsOpen(true)}
                    title="Chat with Rider/Restaurant"
                >
                    <MessageCircle size={24} />
                    {unreadCount > 0 && (
                        <span className="chat-fab-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    )}
                </button>
            )}

            {/* Chat Drawer */}
            {isOpen && (
                <div className="order-chat-drawer">
                    {/* Header */}
                    <div className="chat-drawer-header">
                        <div className="chat-header-info">
                            <div className="chat-header-avatar">
                                <MessageSquare size={18} />
                            </div>
                            <div className="chat-header-text">
                                <h4>Order Chat</h4>
                                <div className="chat-header-status">
                                    {isConnected && <span className="chat-live-dot"></span>}
                                    <p>{isConnected ? 'LIVE CONNECTED' : 'CONNECTING...'}</p>
                                </div>
                            </div>
                        </div>
                        <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
                            <X size={16} />
                        </button>
                    </div>

                    {/* Order Selector (if multiple active orders) */}
                    {activeOrders.length > 1 && (
                        <div className="chat-order-selector">
                            {activeOrders.map(order => (
                                <button
                                    key={order.id}
                                    className={`chat-order-pill ${selectedOrderId === order.id ? 'active' : ''}`}
                                    onClick={() => { setSelectedOrderId(order.id); setUnreadCount(0); }}
                                >
                                    #{order.id?.substring(0, 6).toUpperCase()} — {order.restaurantName || 'Order'}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Messages */}
                    <div className="chat-messages-area">
                        {currentMessages.length === 0 ? (
                            <div className="chat-empty-state">
                                <MessageCircle size={40} />
                                <p>Start a conversation about your order</p>
                                <span className="hint">
                                    {selectedOrder?.restaurantName 
                                        ? `Chat about your order from ${selectedOrder.restaurantName}`
                                        : 'Messages will appear here in real-time'
                                    }
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="chat-system-msg">
                                    <span>🔒 Chat for order #{selectedOrderId?.substring(0, 8).toUpperCase()}</span>
                                </div>
                                {currentMessages.map((msg, idx) => {
                                    const isSent = msg.senderId === currentUserId;
                                    return (
                                        <div key={idx} className={`chat-message ${isSent ? 'sent' : 'received'}`}>
                                            {!isSent && (
                                                <div className="msg-sender-info">
                                                    <span className={`msg-role-badge ${msg.senderRole}`}>
                                                        {getRoleIcon(msg.senderRole)} {getRoleLabel(msg.senderRole)}
                                                    </span>
                                                    <span className="msg-sender-name">{msg.senderName}</span>
                                                </div>
                                            )}
                                            <div className="msg-bubble">{msg.message}</div>
                                            <span className="msg-time">{formatTime(msg.timestamp)}</span>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chat-input-area">
                        <input
                            ref={inputRef}
                            className="chat-input"
                            type="text"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            className="chat-send-btn"
                            onClick={sendMessage}
                            disabled={!inputValue.trim() || !isConnected}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrderChat;
