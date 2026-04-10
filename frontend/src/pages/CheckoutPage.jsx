import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { addressApi, orderApi, paymentApi } from '../services/api';
import AddressModal from '../components/AddressModal/AddressModal.jsx';
import { 
    ChevronLeft, Trash2, CreditCard, ShieldCheck, 
    MapPin, Plus, CheckCircle2, Wallet, Smartphone, Banknote,
    AlertTriangle, Loader2
} from 'lucide-react';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const { showToast } = useToast();
    const { cartItems: realCartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const cartItems = realCartItems.length > 0 ? realCartItems : [{ id: 1, name: 'Mock Meal', price: 299, quantity: 1, restaurantName: 'Mock Cafe' }];
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [serviceType, setServiceType] = useState('delivery'); // 'delivery' or 'pickup'
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    const [cardDetails, setCardDetails] = useState({
        number: '', expiry: '', cvc: '', name: ''
    });

    useEffect(() => {
        fetchAddresses();
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const fetchAddresses = async () => {
        try {
            const res = await addressApi.getAll();
            const arrRaw = Array.isArray(res) ? res : (res?.content || []);
            const arr = arrRaw.map((addr) => ({
                ...addr,
                id: addr.id || addr._id
            }));
            setAddresses(arr);
            if (arr.length > 0 && !selectedAddress) {
                setSelectedAddress(arr[0]);
            }
        } catch (err) {
            console.error("Failed to fetch addresses:", err);
            if (addresses.length === 0) {
                setAddresses([
                    { id: '1', addressLine1: 'Gawala Express Highway', city: 'Mumbai', state: 'MH', pincode: '400001' }
                ]);
                setSelectedAddress({ id: '1', addressLine1: 'Gawala Express Highway', city: 'Mumbai', state: 'MH', pincode: '400001' });
            }
        }
    };

    const handleSaveAddress = async (newAddress) => {
        try {
            await addressApi.create(newAddress);
            await fetchAddresses(); 
            showToast('Address saved successfully', 'success');
            setIsAddressModalOpen(false);
        } catch (err) {
            showToast('Failed to save address', 'error');
        }
    };

    const handlePlaceOrder = async () => {
        if (serviceType === 'delivery' && !selectedAddress) {
            showToast("Please select a delivery address.", "error");
            return;
        }

        const restaurantId = cartItems[0]?.restaurantId;
        if (!restaurantId) {
            showToast("Error: Restaurant information missing from cart.", "error");
            return;
        }

        if (paymentMethod === 'cash') {
            await finalizeOrder();
            return;
        }

        setIsProcessing(true);
        try {
            const response = await paymentApi.createOrder(finalTotal);
            const orderData = response.data || response; // fallback incase not handled by interceptor
            
            if (!window.Razorpay) {
                showToast("Razorpay failed to load. Check your internet.", "error");
                setIsProcessing(false);
                return;
            }

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: "INR",
                name: "PikNGo",
                description: "Premium Food Delivery",
                image: "https://cdn-icons-png.flaticon.com/512/3448/3448609.png",
                order_id: orderData.razorpayOrderId,
                handler: async function (response) {
                    try {
                        const verifyPayload = {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        };
                        
                        await paymentApi.verifyPayment(verifyPayload);
                        await finalizeOrder();
                    } catch (err) {
                        showToast("Payment verification failed.", "error");
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: "User",
                    email: "user@example.com",
                    contact: "9999999999"
                },
                theme: { color: "#f59e0b" },
                modal: { ondismiss: () => setIsProcessing(false) }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (resp) => {
                showToast(`Payment failed: ${resp.error.description}`, 'error');
                setIsProcessing(false);
            });
            rzp.open();

        } catch (err) {
            showToast("Could not initiate payment. Please check your network.", "error");
            setIsProcessing(false);
        }
    };

    const finalizeOrder = async () => {
        setIsProcessing(true);
        const restaurantId = cartItems[0]?.restaurantId;
        
        const orderRequest = {
            restaurantId: restaurantId,
            totalAmount: finalTotal,
            deliveryAddress: serviceType === 'pickup' ? "SELF_PICKUP" : `${selectedAddress.addressLine1}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.pincode}`,
            isSelfPickup: serviceType === 'pickup',
            paymentMethod: paymentMethod,
            items: cartItems.map(item => ({
                menuItemId: item.id || item._id,
                quantity: item.quantity,
                price: item.price
            }))
        };

        try {
            await orderApi.placeOrder(orderRequest);
            clearCart();
            showToast('Order placed successfully!', 'success');
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/orders');
            }, 3000);
        } catch (err) {
            showToast("Order could not be saved. Please contact support.", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const total = getCartTotal();
    const flatFee = serviceType === 'pickup' ? 0 : 45;
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
                    <p className="redirect-text">Redirecting to Orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page auth-page-global-bg animate-fade-in">
            <div className="bg-mesh"></div>
            {isProcessing && (
                <div className="processing-overlay">
                    <div className="standard-loader">
                        <Loader2 className="animate-spin" size={48} />
                        <p>Processing Secure Payment...</p>
                    </div>
                </div>
            )}
            
            <div className="container">
                <header className="checkout-header animate-slide-up">
                    <button className="back-btn glass" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} />
                        <span>Back</span>
                    </button>
                    <h1>Secure <span className="gradient-text">Checkout</span></h1>
                </header>

                <div className="checkout-grid">
                    <div className="checkout-main">
                        {/* 0. Service Type Toggle */}
                        <section className="service-type-selector animate-slide-up">
                            <div className="toggle-container">
                                <div 
                                    className="toggle-slider" 
                                    style={{ 
                                        transform: `translateX(${serviceType === 'delivery' ? '0%' : '100%'})`,
                                        width: '50%'
                                    }}
                                ></div>
                                <button 
                                    className={`toggle-btn ${serviceType === 'delivery' ? 'active' : ''}`}
                                    onClick={() => setServiceType('delivery')}
                                    type="button"
                                >
                                    <MapPin size={18} />
                                    <div className="btn-text">
                                        <span>Delivery</span>
                                        <small>To Doorstep</small>
                                    </div>
                                </button>
                                <button 
                                    className={`toggle-btn ${serviceType === 'pickup' ? 'active' : ''}`}
                                    onClick={() => setServiceType('pickup')}
                                    type="button"
                                >
                                    <Smartphone size={18} />
                                    <div className="btn-text">
                                        <span>Self-Pickup</span>
                                        <small>Pick it up</small>
                                    </div>
                                </button>
                            </div>
                        </section>

                        {/* 1. Delivery Section (Conditional) */}
                        {serviceType === 'delivery' ? (
                            <section className="checkout-section glass-card animate-fade-in">
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
                                    <button 
                                        className="add-address-btn glass-pill"
                                        onClick={() => setIsAddressModalOpen(true)}
                                    >
                                        <Plus size={16} /> Add New Address
                                    </button>
                                </div>
                            </section>
                        ) : (
                            <section className="checkout-section glass-card animate-fade-in pickup-summary">
                                <div className="pickup-notice">
                                    <div className="notice-icon">🏪</div>
                                    <div className="notice-content">
                                        <h3>Pick up from Restaurant</h3>
                                        <p>You'll save on delivery fees! Please reach the restaurant within 20-30 mins once ready.</p>
                                        <div className="restaurant-mini-card glass">
                                            <strong>{cartItems[0]?.restaurantName}</strong>
                                            <span>Location tracking available in orders.</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

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
                            
                            <div className="trust-badges">
                                <span className="badge">🔒 SSL Encrypted</span>
                                <span className="badge">✓ PCI DSS Compliant</span>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
            
            <AddressModal 
                isOpen={isAddressModalOpen} 
                onClose={() => setIsAddressModalOpen(false)}
                onSave={handleSaveAddress}
            />
        </div>
    );
};

export default CheckoutPage;
