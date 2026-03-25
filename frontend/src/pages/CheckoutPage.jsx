import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { 
    ChevronLeft, Trash2, CreditCard, ShieldCheck, 
    MapPin, Plus, CheckCircle2, Wallet, Smartphone, Banknote
} from 'lucide-react';
import { addressApi } from '../services/api';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [cardDetails, setCardDetails] = useState({
        number: '', expiry: '', cvc: '', name: ''
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const res = await addressApi.getAll();
            setAddresses(res.data || []);
            if (res.data && res.data.length > 0) {
                setSelectedAddress(res.data[0]);
            }
        } catch (err) {
            console.error("Failed to fetch addresses:", err);
            // Fallback for demo if no addresses found
            setAddresses([
                { id: '1', addressLine1: 'Gawala Express Highway', city: 'Mumbai', state: 'MH', pincode: '400001' }
            ]);
            setSelectedAddress({ id: '1', addressLine1: 'Gawala Express Highway', city: 'Mumbai', state: 'MH', pincode: '400001' });
        }
    };

    const handlePlaceOrder = () => {
        if (!selectedAddress) {
            alert("Please select a delivery address.");
            return;
        }
        setIsProcessing(true);
        
        // Mock processing delay
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            setTimeout(() => {
                clearCart();
                navigate('/dashboard');
            }, 3000);
        }, 2500);
    };

    const total = getCartTotal();
    const flatFee = 45;
    const finalTotal = total + flatFee;

    if (cartItems.length === 0 && !isSuccess) {
        return (
            <div className="checkout-page empty-checkout animate-fade-in">
                <div className="container">
                    <div className="glass-card empty-card">
                        <div className="empty-icon-wrapper">
                            <Plus size={40} />
                        </div>
                        <h2>Your cart is empty</h2>
                        <p>Add some delicious meals from our premium selected restaurants to proceed.</p>
                        <button className="btn-primary" onClick={() => navigate('/dashboard')}>Explore Restaurants</button>
                    </div>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="checkout-page success-overlay animate-fade-in">
                <div className="success-content">
                    <div className="success-icon-lottie">
                        <CheckCircle2 size={100} color="#4ade80" strokeWidth={1} />
                    </div>
                    <h1>Order Placed <span className="gradient-text">Successfully!</span></h1>
                    <p>Your meal is being prepared and will be delivered shortly.</p>
                    <div className="success-loader-bar"></div>
                    <p className="redirect-text">Redirecting to Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page animate-fade-in">
            {isProcessing && (
                <div className="processing-overlay">
                    <div className="loader-ring"></div>
                    <p>Processing Secure Payment...</p>
                </div>
            )}
            
            <div className="container">
                <header className="checkout-header">
                    <button className="back-btn glass" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} />
                        <span>Back</span>
                    </button>
                    <h1>Secure <span className="gradient-text">Checkout</span></h1>
                </header>

                <div className="checkout-grid">
                    <div className="checkout-main">
                        {/* 1. Delivery Section */}
                        <section className="checkout-section glass-card">
                            <div className="section-header">
                                <MapPin size={22} className="section-icon" />
                                <h3>Select Delivery Address</h3>
                            </div>
                            <div className="address-list">
                                {addresses.map((addr) => (
                                    <div 
                                        key={addr.id} 
                                        className={`address-item glass ${selectedAddress?.id === addr.id ? 'active' : ''}`}
                                        onClick={() => setSelectedAddress(addr)}
                                    >
                                        <div className="address-radio"></div>
                                        <div className="address-info">
                                            <p className="addr-line">{addr.addressLine1}</p>
                                            <p className="addr-city">{addr.city}, {addr.state} - {addr.pincode}</p>
                                        </div>
                                    </div>
                                ))}
                                <button className="add-address-btn glass-pill">
                                    <Plus size={16} /> Add New Address
                                </button>
                            </div>
                        </section>

                        {/* 2. Payment Section */}
                        <section className="checkout-section glass-card">
                            <div className="section-header">
                                <CreditCard size={22} className="section-icon" />
                                <h3>Payment Method</h3>
                            </div>
                            
                            <div className="payment-methods">
                                <button 
                                    className={`pay-method-btn glass ${paymentMethod === 'card' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    <CreditCard size={20} />
                                    <span>Card</span>
                                </button>
                                <button 
                                    className={`pay-method-btn glass ${paymentMethod === 'upi' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('upi')}
                                >
                                    <Smartphone size={20} />
                                    <span>UPI / GPay</span>
                                </button>
                                <button 
                                    className={`pay-method-btn glass ${paymentMethod === 'cash' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('cash')}
                                >
                                    <Banknote size={20} />
                                    <span>COD</span>
                                </button>
                            </div>

                            {paymentMethod === 'card' && (
                                <div className="card-input-form animate-slide-in">
                                    <div className="input-group">
                                        <label>Card Number</label>
                                        <input 
                                            type="text" 
                                            placeholder="XXXX XXXX XXXX XXXX" 
                                            value={cardDetails.number}
                                            onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                                        />
                                    </div>
                                    <div className="input-row">
                                        <div className="input-group">
                                            <label>Expiry Date</label>
                                            <input 
                                                type="text" 
                                                placeholder="MM/YY" 
                                                value={cardDetails.expiry}
                                                onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>CVC</label>
                                            <input 
                                                type="text" 
                                                placeholder="123" 
                                                value={cardDetails.cvc}
                                                onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* 3. Review Items */}
                        <section className="checkout-section glass-card">
                            <div className="section-header">
                                <ShieldCheck size={22} className="section-icon" />
                                <h3>Order Summary</h3>
                            </div>
                            <div className="checkout-items-list">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="checkout-item">
                                        <div className="item-details">
                                            <p className="item-name">{item.name}</p>
                                            <p className="item-rest">{item.restaurantName}</p>
                                        </div>
                                        <div className="item-qty-price">
                                            <div className="qty-control">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                            </div>
                                            <span className="item-p">₹{item.price * item.quantity}</span>
                                            <button className="del-btn" onClick={() => removeFromCart(item.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="checkout-sidebar">
                        <section className="glass-card bill-details">
                            <h3>Bill Details</h3>
                            <div className="bill-row">
                                <span>Item Total</span>
                                <span>₹{total}</span>
                            </div>
                            <div className="bill-row">
                                <span>Convenience Fee</span>
                                <span className="fee">₹{flatFee}</span>
                            </div>
                            <div className="bill-divider"></div>
                            <div className="bill-row total">
                                <span>Amount Payable</span>
                                <span>₹{finalTotal}</span>
                            </div>
                            
                            <button 
                                className="confirm-pay-btn btn-primary" 
                                onClick={handlePlaceOrder}
                                disabled={isProcessing}
                            >
                                <ShieldCheck size={20} />
                                <span>Place Order • ₹{finalTotal}</span>
                            </button>
                            
                            <p className="secure-text">
                                <ShieldCheck size={14} /> 100% Safe & Secure Payments
                            </p>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
