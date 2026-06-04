import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { addressApi, orderApi, paymentApi, promotionApi } from '../services/api';
import AddressModal from '../components/AddressModal/AddressModal.jsx';
import { 
    ChevronLeft, Trash2, CreditCard, ShieldCheck, X,
    MapPin, Plus, CheckCircle2, Wallet, Smartphone, Banknote,
    AlertTriangle, Loader2, Search, Navigation, QrCode, Scan,
    Minus, Plus as PlusIcon, Trash2 as TrashIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const { showToast } = useToast();
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [serviceType, setServiceType] = useState('delivery'); // 'delivery' or 'pickup'
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isVerifyingQR, setIsVerifyingQR] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoLoading, setPromoLoading] = useState(false);

    const [cardDetails, setCardDetails] = useState({
        number: '', expiry: '', cvc: '', name: ''
    });
    const [upiApp, setUpiApp] = useState('');
    const [upiId, setUpiId] = useState('');
    const [isVerifyingUPI, setIsVerifyingUPI] = useState(false);

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

        if (paymentMethod === 'upi') {
            if (!upiId.trim()) {
                showToast("Please enter your UPI ID.", "error");
                return;
            }
            if (!upiId.includes('@')) {
                showToast("Please enter a valid UPI ID (e.g. username@bank).", "error");
                return;
            }
            
            setIsVerifyingUPI(true);
            setTimeout(() => {
                setIsVerifyingUPI(false);
                finalizeOrder();
            }, 3500);
            return;
        }

        setIsProcessing(true);
        try {
            const response = await paymentApi.createOrder(finalTotal);
            const orderData = response.data || response;

            // Handle MOCK MODE (if key is placeholder or status is MOCK_MODE)
            if (orderData.keyId === 'rzp_test_placeholder' || orderData.status === 'MOCK_MODE') {
                showToast("Test Mode: Simulating secure transaction...", "info");
                
                // Add a small delay for realism
                setTimeout(async () => {
                    try {
                        const verifyPayload = {
                            razorpayOrderId: orderData.razorpayOrderId,
                            razorpayPaymentId: "pay_mock_" + Math.random().toString(36).substring(7),
                            razorpaySignature: "sig_mock_" + Math.random().toString(36).substring(7)
                        };
                        
                        await paymentApi.verifyPayment(verifyPayload);
                        await finalizeOrder();
                    } catch (err) {
                        showToast("Mock payment verification failed.", "error");
                        setIsProcessing(false);
                    }
                }, 2000);
                return;
            }
            
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
                theme: { color: "#ff6b00" },
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


    const handleVerifyQR = () => {
        setIsVerifyingQR(true);
        // Simulate a 3-second secure verification step to match real-world trust
        setTimeout(() => {
            setIsVerifyingQR(false);
            finalizeOrder();
        }, 3200);
    };

    const handleSuffixClick = (suffix) => {
        let base = upiId.split('@')[0];
        if (!base) base = 'username';
        setUpiId(base + suffix);
    };

    const handleAppSuffix = (defaultSuffix) => {
        let base = upiId.split('@')[0];
        setUpiId((base || '') + defaultSuffix);
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
            promoCode: appliedPromo ? appliedPromo.code : null,
            discountAmount: discount || 0,
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

    const handleUpdateQuantity = (item, amount) => {
        const newQty = item.quantity + amount;
        if (newQty <= 0) {
            removeFromCart(item.id || item._id);
        } else {
            updateQuantity(item.id || item._id, newQty);
        }
    };

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        try {
            const promo = await promotionApi.validate(promoCode.trim());
            if (promo && promo.discountPercentage) {
                if (promo.minOrderAmount && total < promo.minOrderAmount) {
                    showToast(`Minimum order ₹${promo.minOrderAmount} required for this promo`, 'error');
                } else {
                    setAppliedPromo(promo);
                    showToast(`🎉 Promo applied! ${promo.discountPercentage}% off`, 'success');
                }
            } else {
                showToast('Invalid or expired promo code', 'error');
            }
        } catch (err) {
            showToast(err.message || 'Promo code not found', 'error');
        } finally {
            setPromoLoading(false);
        }
    };

    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const flatFee = serviceType === 'pickup' ? 0 : 45;
    const discount = appliedPromo
        ? Math.min(
            (total * appliedPromo.discountPercentage) / 100,
            appliedPromo.maxDiscountAmount || Infinity
          )
        : 0;
    const finalTotal = Math.max(0, total + flatFee - discount);

    if (!isSuccess && (!cartItems || cartItems.length === 0)) {
        return (
            <div className="checkout-page empty-checkout-hub animate-fade-in">
                <div className="bg-mesh"></div>
                <div className="checkout-container">
                    <div className="elite-empty-card glass-modern">
                        <div className="empty-radar-glow">
                            <Plus size={40} className="pulse-icon" />
                        </div>
                        <h2>Your Cart is <span className="gradient-text">Empty</span></h2>
                        <p>Deploy your hunger signals and discover nearby restaurant hubs to proceed.</p>
                        <button className="btn-solid-orange" onClick={() => navigate('/dashboard')}>
                            <Search size={18} />
                            <span>Scan Restaurants</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="checkout-page success-terminal-overlay animate-fade-in">
                <div className="bg-mesh"></div>
                <div className="success-terminal-content">
                    <div className="terminal-radiant-glow">
                        <CheckCircle2 size={80} color="#10b981" className="radiant-icon" />
                    </div>
                    <h1>Order <span className="gradient-text">Transmitted!</span></h1>
                    <div className="terminal-status-badge">COMMAND RECEIVED • NH-44 HUB</div>
                    <p>Your culinary request has been synced with the restaurant terminal. Redirecting to tracking station...</p>
                    <div className="terminal-progress-conduit">
                        <div className="conduit-fill"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page elite-terminal-layout animate-fade-in">
            <div className="bg-mesh"></div>
            
            {isProcessing && (
                <div className="processing-terminal-overlay">
                    <div className="terminal-loader-hub">
                        <div className="loader-ring-elite"></div>
                        <div className="loader-info">
                            <h3>Authorizing Vault Access</h3>
                            <p>Connecting to Secure Payment Network...</p>
                        </div>
                    </div>
                </div>
            )}

            {isVerifyingQR && (
                <div className="processing-terminal-overlay verifying-qr">
                    <div className="terminal-loader-hub">
                        <div className="loader-ring-elite pulse"></div>
                        <div className="loader-info">
                            <h3>Verifying Transaction</h3>
                            <p>Confirming transaction from your UPI app...</p>
                        </div>
                    </div>
                </div>
            )}

            {isVerifyingUPI && (
                <div className="processing-terminal-overlay verifying-upi">
                    <div className="terminal-loader-hub">
                        <div className="loader-ring-elite pulse"></div>
                        <div className="loader-info">
                            <h3>UPI Request Sent</h3>
                            <p>Please open your UPI app to approve the payment request for <strong>₹{finalTotal}</strong> sent to <strong>{upiId}</strong>.</p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="checkout-container">
                <header className="terminal-header elite-entrance">
                    <div className="h-group header-title-centered">
                        <h1>Terminal <span className="gradient-text">Checkout</span></h1>
                        <div className="security-status"><ShieldCheck size={14} /> 256-BIT ENCRYPTED</div>
                    </div>
                    <button className="terminal-close-btn" onClick={() => navigate('/')} title="Exit Terminal">
                        <X size={20} />
                    </button>
                </header>

                <div className="terminal-grid">
                    <div className="terminal-main-deck">
                        {/* 0. Route Intel Toggle */}
                        <section className="terminal-section route-intel elite-entrance">
                            <div className="section-title-hud">
                                <Navigation size={18} />
                                <span>ROUTE INTELLIGENCE</span>
                            </div>
                            <div className="terminal-toggle-hub glass-modern">
                                <div 
                                    className="toggle-glider" 
                                    style={{ transform: `translateX(${serviceType === 'delivery' ? '0%' : '100%'})` }}
                                ></div>
                                <button 
                                    className={`toggle-node ${serviceType === 'delivery' ? 'active' : ''}`}
                                    onClick={() => setServiceType('delivery')}
                                >
                                    <MapPin size={20} />
                                    <span>DOORSTEP HUB</span>
                                </button>
                                <button 
                                    className={`toggle-node ${serviceType === 'pickup' ? 'active' : ''}`}
                                    onClick={() => setServiceType('pickup')}
                                >
                                    <Smartphone size={20} />
                                    <span>SELF TERMINAL</span>
                                </button>
                            </div>
                        </section>

                        {/* 1. Target Destination Section */}
                        {serviceType === 'delivery' ? (
                            <section className="terminal-section destination-vault glass-modern elite-entrance" style={{animationDelay: '0.1s'}}>
                                <div className="section-header-hud">
                                    <MapPin size={22} className="accent-icon" />
                                    <h3>Target Destination</h3>
                                </div>
                                <div className="address-intel-list">
                                    {addresses.map((addr) => (
                                        <div 
                                            key={addr.id} 
                                            className={`address-node glass-modern ${selectedAddress?.id === addr.id ? 'active' : ''}`}
                                            onClick={() => setSelectedAddress(addr)}
                                        >
                                            <div className="node-indicator"></div>
                                            <div className="node-content">
                                                <p className="addr-main">{addr.addressLine1}</p>
                                                <p className="addr-sub">{addr.city}, {addr.state} • {addr.pincode}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <button 
                                        className="add-node-btn glass-pill"
                                        onClick={() => setIsAddressModalOpen(true)}
                                    >
                                        <Plus size={16} /> DEPLOY NEW HUB
                                    </button>
                                </div>
                            </section>
                        ) : (
                            <section className="terminal-section pickup-hub glass-modern elite-entrance" style={{animationDelay: '0.1s'}}>
                                <div className="pickup-intel-card">
                                    <div className="intel-visual">🏪</div>
                                    <div className="intel-data">
                                        <h3>Terminal Handover</h3>
                                        <p>Intercept your order at the restaurant hub. Zero delivery overhead synced.</p>
                                        <div className="intel-ref glass-modern">
                                            <strong>{cartItems[0]?.restaurantName}</strong>
                                            <span>Hub location is pinned on your dashboard.</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* 2. Secure Vault Section */}
                        <section className="terminal-section secure-vault glass-modern elite-entrance" style={{animationDelay: '0.2s'}}>
                            <div className="section-header-hud">
                                <CreditCard size={22} className="accent-icon" />
                                <h3>Secure Vault Access</h3>
                            </div>
                            
                            <div className="vault-method-hub">
                                <button 
                                    className={`vault-node glass-modern ${paymentMethod === 'card' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    <CreditCard size={20} />
                                    <span>CRYPTO/CARD</span>
                                </button>
                                <button 
                                    className={`vault-node glass-modern ${paymentMethod === 'upi' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('upi')}
                                >
                                    <Smartphone size={20} />
                                    <span>DIGITAL UPI</span>
                                </button>
                                <button 
                                    className={`vault-node glass-modern ${paymentMethod === 'upi_qr' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('upi_qr')}
                                >
                                    <Scan size={20} />
                                    <span>TERMINAL SCAN</span>
                                </button>
                                <button 
                                    className={`vault-node glass-modern ${paymentMethod === 'cash' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('cash')}
                                >
                                    <Banknote size={20} />
                                    <span>CASH TERMINAL</span>
                                </button>
                            </div>

                            {paymentMethod === 'card' && (
                                <div className="vault-input-arena animate-fade-in">
                                    <div className="tech-input-group">
                                        <label>VAULT IDENTIFIER (CARD NUMBER)</label>
                                        <input 
                                            type="text" 
                                            placeholder="0000 0000 0000 0000" 
                                            value={cardDetails.number}
                                            onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                                        />
                                    </div>
                                    <div className="tech-input-row">
                                        <div className="tech-input-group">
                                            <label>EXPIRY</label>
                                            <input type="text" placeholder="MM/YY" />
                                        </div>
                                        <div className="tech-input-group">
                                            <label>AUTH CODE (CVC)</label>
                                            <input type="password" placeholder="***" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'upi' && (
                                <div className="vault-input-arena upi-input-arena animate-fade-in">
                                    <div className="upi-apps-grid">
                                        <button 
                                            className={`upi-app-btn glass-pill ${upiApp === 'gpay' ? 'active' : ''}`}
                                            onClick={() => { setUpiApp('gpay'); handleAppSuffix('@okaxis'); }}
                                            type="button"
                                        >
                                            <img 
                                                src="/gpay.svg" 
                                                alt="GPay Logo" 
                                                className="upi-icon-img" 
                                            />
                                            <span>GPay</span>
                                        </button>
                                        <button 
                                            className={`upi-app-btn glass-pill ${upiApp === 'phonepe' ? 'active' : ''}`}
                                            onClick={() => { setUpiApp('phonepe'); handleAppSuffix('@ybl'); }}
                                            type="button"
                                        >
                                            <img 
                                                src="/phonepe.svg" 
                                                alt="PhonePe Logo" 
                                                className="upi-icon-img" 
                                            />
                                            <span>PhonePe</span>
                                        </button>
                                        <button 
                                            className={`upi-app-btn glass-pill ${upiApp === 'paytm' ? 'active' : ''}`}
                                            onClick={() => { setUpiApp('paytm'); handleAppSuffix('@paytm'); }}
                                            type="button"
                                        >
                                            <img 
                                                src="/paytm.svg" 
                                                alt="Paytm Logo" 
                                                className="upi-icon-img" 
                                            />
                                            <span>Paytm</span>
                                        </button>
                                        <button 
                                            className={`upi-app-btn glass-pill ${upiApp === 'bhim' ? 'active' : ''}`}
                                            onClick={() => { setUpiApp('bhim'); handleAppSuffix('@upi'); }}
                                            type="button"
                                        >
                                            <img 
                                                src="/bhim.svg" 
                                                alt="BHIM Logo" 
                                                className="upi-icon-img" 
                                            />
                                            <span>BHIM</span>
                                        </button>
                                    </div>

                                    <div className="tech-input-group">
                                        <label>ENTER UPI ID (VPA)</label>
                                        <input 
                                            type="text" 
                                            placeholder="username@bank" 
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                        />
                                    </div>

                                    <div className="upi-suffix-suggestions">
                                        {['@okaxis', '@ybl', '@paytm', '@apl', '@okicici'].map((suffix) => (
                                            <button 
                                                key={suffix}
                                                className="suffix-btn glass-pill"
                                                onClick={() => handleSuffixClick(suffix)}
                                                type="button"
                                            >
                                                {suffix}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'upi_qr' && (
                                <div className="qr-terminal-arena animate-fade-in">
                                    <div className="qr-terminal-card glass-modern">
                                        <div className="qr-header">
                                            <Scan size={18} />
                                            <span>DYNAMIC UPI TERMINAL</span>
                                        </div>
                                        <div className="qr-code-wrapper">
                                            <div className="qr-scanner-line"></div>
                                            <QRCodeSVG 
                                                value={`upi://pay?pa=7019248015@fam&pn=PikNGo&am=${finalTotal}&cu=INR&tn=PikNGo%20Order`}
                                                size={180}
                                                level="H"
                                                includeMargin={true}
                                                bgColor="transparent"
                                                fgColor="#0f172a" /* High contrast for scannability */
                                            />
                                        </div>
                                        <div className="qr-footer">
                                            <p className="vpa-display">7019248015@fam</p>
                                            <p className="qr-hint">Scan with GPay, PhonePe, or any UPI app</p>
                                        </div>
                                    </div>
                                    <button 
                                        className={`verify-scan-btn glass-pill ${isVerifyingQR ? 'verifying' : ''}`}
                                        onClick={handleVerifyQR}
                                        disabled={isVerifyingQR || isProcessing}
                                    >
                                        {isVerifyingQR ? (
                                            <>
                                                <div className="mini-loader-white-elite"></div>
                                                <span>VERIFYING SECURELY...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={16} /> 
                                                <span>I'VE COMPLETED THE PAYMENT</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="terminal-sidebar">
                        <section className="terminal-invoice glass-modern elite-entrance" style={{animationDelay: '0.3s'}}>
                            <div className="invoice-header">
                                <ShieldCheck size={18} className="accent-icon" />
                                <h3>Terminal Invoice</h3>
                            </div>
                            
                            <div className="invoice-items-hub">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="invoice-item animate-slide-in">
                                        <div className="item-info">
                                            <div className="invoice-qty-controls glass-pill">
                                                <button 
                                                    className="qty-btn" 
                                                    onClick={() => handleUpdateQuantity(item, -1)}
                                                >
                                                    {item.quantity === 1 ? <TrashIcon size={12} className="trash-mini" /> : <Minus size={12} />}
                                                </button>
                                                <span className="qty-val">{item.quantity}</span>
                                                <button 
                                                    className="qty-btn" 
                                                    onClick={() => handleUpdateQuantity(item, 1)}
                                                >
                                                    <PlusIcon size={12} />
                                                </button>
                                            </div>
                                            <span className="name">{item.name}</span>
                                        </div>
                                        <span className="price">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="invoice-calculus">
                                <div className="calc-row">
                                    <span>Subtotal</span>
                                    <span>₹{total}</span>
                                </div>
                                <div className="calc-row">
                                    <span>Handover/Logistics</span>
                                    <span className="accent-text">₹{flatFee}</span>
                                </div>

                                {/* Promo Code Section */}
                                <div className="promo-section">
                                    {appliedPromo ? (
                                        <div className="promo-applied-badge">
                                            <span>🎉 {appliedPromo.code} ({appliedPromo.discountPercentage}% off)</span>
                                            <button onClick={() => { setAppliedPromo(null); setPromoCode(''); }}>✕</button>
                                        </div>
                                    ) : (
                                        <div className="promo-input-row">
                                            <input
                                                type="text"
                                                className="promo-input"
                                                placeholder="Promo code..."
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                                            />
                                            <button className="promo-apply-btn" onClick={handleApplyPromo} disabled={promoLoading}>
                                                {promoLoading ? '...' : 'APPLY'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {discount > 0 && (
                                    <div className="calc-row discount-row">
                                        <span>Promo Discount</span>
                                        <span className="discount-val">-₹{discount.toFixed(0)}</span>
                                    </div>
                                )}

                                <div className="calc-divider"></div>
                                <div className="calc-row grand-total">
                                    <span>Total</span>
                                    <span className="total-val">₹{finalTotal}</span>
                                </div>
                            </div>
                            
                            <button 
                                className={`terminal-pay-btn btn-solid-orange ${isProcessing ? 'loading' : ''}`} 
                                onClick={handlePlaceOrder}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="mini-loader-white-elite"></div>
                                        <span>PROCESSING SECURELY...</span>
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={20} />
                                        <span>AUTHORIZE PAYMENT • ₹{finalTotal}</span>
                                    </>
                                )}
                            </button>
                            
                            <div className="terminal-trust-footer">
                                <div className="trust-node"><ShieldCheck size={12} /> SECURE VAULT</div>
                                <div className="trust-node"><ShieldCheck size={12} /> PCI COMPLIANT</div>
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
