import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantApi, menuApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { ChevronLeft, Star, Clock, Search, Filter, ArrowRight, ShoppingCart, Loader2 } from 'lucide-react';
import './MenuPage.css';



const MenuPage = () => {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const { cartItems, addToCart, updateQuantity } = useCart();
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const resResponse = await restaurantApi.getById(restaurantId);
                setRestaurant(resResponse);
                try {
                    const menuResponse = await menuApi.getMenu(restaurantId);
                    setMenuItems(menuResponse || []);
                } catch (menuErr) {
                    setMenuItems([]);
                }
            } catch (err) {
                setRestaurant(null);
            } finally {
                setLoading(false);
            }
        };

        if (restaurantId) fetchDetails();
        window.scrollTo(0, 0);
    }, [restaurantId]);

    const categories = ['All', ...new Set((menuItems || []).map(item => item?.itemCategory || item?.category).filter(Boolean))];
    const filteredMenu = selectedCategory === 'All'
        ? menuItems
        : menuItems.filter(item => (item.itemCategory || item.category) === selectedCategory);

    const getQtyInCart = (itemId) => {
        const item = cartItems.find(i => i.id === itemId);
        return item ? item.quantity : 0;
    };

    const handleAddToCart = (item) => {
        const normalizedItem = {
            id: item.id || item._id,
            name: item.itemName || item.item_name || item.name,
            price: item.itemPrice || item.price,
            image: item.itemImageUrl || item.image,
            category: item.itemCategory || item.category
        };
        addToCart(normalizedItem, restaurant.id || restaurant._id, restaurant.restaurantName);
    };

    if (loading) return (
        <div className="menu-page">
            <div className="loading-state">
                <Loader2 className="spinner" size={48} color="var(--accent-orange)" />
                <p className="rest-cat-elite" style={{marginTop: '1.5rem'}}>Synchronizing Menu Repositories...</p>
            </div>
        </div>
    );

    if (!restaurant) return <div className="loading-state">Establishment not found.</div>;

    return (
        <div className="menu-page">
            <div className="menu-hero" style={{ backgroundImage: `url(${restaurant.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1500'})` }}>
                <div className="hero-overlay"></div>
                <div className="container hero-content-wrapper">
                    <button className="back-btn-elite animate-fade-in" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} />
                        <span>Back to Route</span>
                    </button>
                    <div className="rest-header-elite animate-fade-in">
                        <div className="rest-pill-elite">
                            <span className="rest-cat-elite">{restaurant.category || 'Premium Dining'}</span>
                            <div className="rest-meta-elite">
                                <Star size={16} fill="currentColor" />
                                <span>{restaurant.rating}</span>
                                <span style={{opacity: 0.3}}>|</span>
                                <Clock size={16} />
                                <span>{restaurant.deliveryTime}</span>
                            </div>
                        </div>
                        <h1 className="rest-name-elite">{restaurant.restaurantName}</h1>
                        <p className="rest-tag-elite">{restaurant.address || 'Authentic flavors served fresh for your highway journey.'}</p>
                    </div>
                </div>
            </div>

            <div className="menu-content container">
                <div className="menu-layout">
                    <aside className="menu-sidebar">
                        <div className="sidebar-card-elite animate-fade-in-left">
                            <h3>Menu Index</h3>
                            <div className="category-list">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`cat-item-elite ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        <span>{cat}</span>
                                        <ArrowRight size={16} style={{ opacity: selectedCategory === cat ? 1 : 0 }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="sidebar-card-elite promo-card animate-fade-in-left" style={{ animationDelay: '0.1s', background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(2, 6, 23, 1) 100%)' }}>
                            <div className="promo-badge" style={{margin: '0 0 1.5rem'}}>OFFER</div>
                            <h4 style={{fontSize: '2.2rem', color: 'var(--accent-orange)', fontWeight: 950}}>20% OFF</h4>
                            <p style={{fontSize: '0.9rem', opacity: 0.7}}>Unlock elite savings on orders above ₹800.</p>
                        </div>
                    </aside>

                    <main className="menu-main">
                        <div className="menu-top-bar-elite animate-fade-in">
                            <div className="search-module-elite">
                                <Search size={20} style={{ opacity: 0.4 }} />
                                <input type="text" placeholder="Filter menu items..." />
                            </div>
                            <button className="filter-btn"><Filter size={18} /> <span>Refine</span></button>
                        </div>

                        <div className="menu-grid-elite">
                            {filteredMenu?.map((item, index) => {
                                const qty = getQtyInCart(item.id || item._id);
                                return (
                                    <div
                                        key={item.id || item._id}
                                        className="elite-menu-card animate-fade-in-up"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className="elite-img-box">
                                            <img 
                                                src={item.itemImageUrl || item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500'} 
                                                alt={item.itemName} 
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=501';
                                                    e.target.onerror = null; // Prevent infinite loops
                                                }}
                                            />
                                            {(item.isVeg || item.veg) && (
                                                <div className="radiant-badge badge-veg" style={{position: 'absolute', top: '1rem', left: '1rem'}}>VEG</div>
                                            )}
                                        </div>
                                        
                                        <div className="elite-item-info">
                                            <div className="elite-item-header">
                                                <h3 className="elite-item-title">{item.itemName || item.name}</h3>
                                                <div className="signature-price-elite">₹{item.itemPrice || item.price}</div>
                                            </div>
                                            <p className="elite-item-desc">{item.itemDescription || item.description || 'A masterpiece of culinary art prepared specifically for of your highway journey.'}</p>
                                            
                                            <div className="elite-card-actions">
                                                {qty > 0 ? (
                                                    <div className="qty-stepper-elite">
                                                        <button className="qty-btn" onClick={() => updateQuantity(item.id || item._id, qty - 1)}>-</button>
                                                        <span className="qty-count">{qty}</span>
                                                        <button className="qty-btn" onClick={() => updateQuantity(item.id || item._id, qty + 1)}>+</button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        className="elite-order-btn"
                                                        onClick={() => handleAddToCart(item)}
                                                    >
                                                        <ShoppingCart size={18} />
                                                        <span>Add to Tray</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MenuPage;
