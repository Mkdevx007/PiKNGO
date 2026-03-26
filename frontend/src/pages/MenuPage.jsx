import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantApi, menuApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { ChevronLeft, Star, Clock, Search, Filter, ArrowRight, ShoppingCart } from 'lucide-react';
import './MenuPage.css';



const MenuPage = () => {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                // Fetch restaurant first
                const resResponse = await restaurantApi.getById(restaurantId);
                setRestaurant(resResponse.data);
                
                // Then try to fetch menu items separately to be resilient
                try {
                    const menuResponse = await menuApi.getMenu(restaurantId);
                    setMenuItems(menuResponse.data || []);
                } catch (menuErr) {
                    console.error("Failed to fetch menu items", menuErr);
                    setMenuItems([]);
                }
            } catch (err) {
                console.error("Failed to fetch restaurant details", err);
                setRestaurant(null);
            } finally {
                setLoading(false);
            }
        };

        if (restaurantId) {
            console.log("MenuPage: Fetching details for", restaurantId);
            fetchDetails();
        }
        window.scrollTo(0, 0);
    }, [restaurantId]);

    console.log("MenuPage: State", { restaurant, menuItemsCount: menuItems.length, loading });

    const categories = ['All', ...new Set((menuItems || []).map(item => item?.category).filter(Boolean))];
    const filteredMenu = selectedCategory === 'All'
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory);

    if (loading) return <div className="loading-state">Initializing Premium Experience...</div>;
    if (!restaurant) return <div className="loading-state">Restaurant not found.</div>;

    return (
        <div className="menu-page">
            <div className="menu-hero" style={{ backgroundImage: `url(${restaurant.imageUrl || restaurant.banner || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1500'})` }}>
                <div className="hero-overlay"></div>
                <div className="container hero-content-wrapper">
                    <button className="back-btn glass" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} />
                        <span>Back</span>
                    </button>
                    <div className="rest-header animate-fade-in">
                        <div className="rest-info-pill glass">
                            <span className="rest-cat">{restaurant.category}</span>
                            <div className="rest-stats">
                                <span className="stat"><Star size={14} fill="currentColor" /> {restaurant.rating}</span>
                                <span className="stat-sep">•</span>
                                <span className="stat"><Clock size={14} /> {restaurant.deliveryTime}</span>
                            </div>
                        </div>
                        <h1 className="rest-name">{restaurant.resturantName || restaurant.name || 'Premium Restaurant'}</h1>
                        <p className="rest-tagline">{restaurant.address || 'Serving excellence on your journey since 2012.'}</p>
                    </div>
                </div>
            </div>

            <div className="menu-content container">
                <div className="menu-layout">
                    <aside className="menu-sidebar">
                        <div className="sidebar-card glass animate-fade-in-left">
                            <h3>Categories</h3>
                            <div className="category-list">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`cat-item ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                        {selectedCategory === cat && <ArrowRight size={14} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="sidebar-card promo-card glass animate-fade-in-left" style={{ animationDelay: '0.1s' }}>
                            <div className="promo-badge">Offer</div>
                            <h4>20% OFF</h4>
                            <p>On all orders above ₹800. Use code: <span>ELITE20</span></p>
                        </div>
                    </aside>

                    <main className="menu-main">
                        <div className="menu-top-bar glass">
                            <div className="search-box">
                                <Search size={18} />
                                <input type="text" placeholder="Search for your favorite dish..." />
                            </div>
                            <button className="filter-btn"><Filter size={18} /> <span>Refine</span></button>
                        </div>

                        <div className="menu-grid">
                            {filteredMenu?.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="menu-item-card glass animate-fade-in-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="item-img-wrapper">
                                        <img src={item.imageUrl || item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500'} alt={item.name} />
                                        <div className="item-category-tag">{item.category}</div>
                                    </div>
                                    <div className="item-details">
                                        <div className="item-header">
                                            <div className="name-veg-row">
                                                {item.veg !== undefined && (
                                                    <span className={`veg-indicator ${item.veg ? 'veg' : 'non-veg'}`}></span>
                                                )}
                                                <h4>{item.name}</h4>
                                            </div>
                                            <div className="item-price">₹{item.price}</div>
                                        </div>
                                        <p className="item-desc">{item.desc}</p>
                                        <button 
                                            className="add-to-cart-btn btn-primary-slim"
                                            onClick={() => addToCart(item, restaurant.id, restaurant.resturantName || restaurant.name)}
                                        >
                                            <ShoppingCart size={16} />
                                            <span>Add to Order</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MenuPage;
