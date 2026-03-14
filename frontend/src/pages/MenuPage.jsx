import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Star,
    Clock,
    ChevronLeft,
    ShoppingCart,
    Info,
    Filter,
    Search,
    ArrowRight
} from 'lucide-react';
import './MenuPage.css';

const restaurantData = {
    'highway-king---jaipur': {
        name: 'Highway King - Jaipur',
        rating: 4.8,
        deliveryTime: '20-25 min',
        category: 'North Indian • Mughlai',
        banner: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop',
        menu: [
            { id: 101, name: 'Dal Makhani Elite', price: 320, desc: 'Premium black lentils slow-cooked overnight.', image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?q=80&w=1000', category: 'Main' },
            { id: 102, name: 'Paneer Lababdar', price: 350, desc: 'Creamy cottage cheese in tomato gravy.', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=1000', category: 'Main' },
            { id: 103, name: 'Garlic Naan', price: 60, desc: 'Tandoori bread with garlic and butter.', image: 'https://images.unsplash.com/photo-1601050638917-3f80fc014923?q=80&w=1000', category: 'Breads' },
        ]
    },
    'haldiram---gurgaon': {
        name: 'Haldiram - Gurgaon',
        rating: 4.6,
        deliveryTime: '15-20 min',
        category: 'Indian Snacks • Sweets',
        banner: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=2072&auto=format&fit=crop',
        menu: [
            { id: 201, name: 'Chole Bhature', price: 180, desc: 'Classic spiced chickpeas with fluffy fried bread.', image: 'https://images.unsplash.com/photo-1626132646529-5006375bc85a?q=80&w=1000', category: 'Main' },
            { id: 202, name: 'Raj Kachori', price: 120, desc: 'The king of chaats with yogurt and chutneys.', image: 'https://images.unsplash.com/photo-1601050638917-3f80fc014923?q=80&w=1000', category: 'Starters' },
        ]
    },
    'mcd---behror': {
        name: 'McD - Behror',
        rating: 4.5,
        deliveryTime: '10-15 min',
        category: 'Fast Food • Burgers',
        banner: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop',
        menu: [
            { id: 301, name: 'McVeggie Burger', price: 120, desc: 'Classic veg patty with lettuce and mayo.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000', category: 'Main' },
            { id: 302, name: 'French Fries (L)', price: 95, desc: 'Golden crispy potato fries.', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=1000', category: 'Snacks' },
        ]
    }
};


const MenuPage = () => {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        // Find restaurant by ID or name slug
        const data = restaurantData[restaurantId] || restaurantData['highway-king---jaipur'];

        setRestaurant(data);
        window.scrollTo(0, 0);
    }, [restaurantId]);

    const categories = ['All', ...new Set(restaurant?.menu.map(item => item.category) || [])];
    const filteredMenu = selectedCategory === 'All'
        ? restaurant?.menu
        : restaurant?.menu.filter(item => item.category === selectedCategory);

    if (!restaurant) return <div className="loading-state">Initializing Premium Experience...</div>;

    return (
        <div className="menu-page">
            <div className="menu-hero" style={{ backgroundImage: `url(${restaurant.banner})` }}>
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
                        <h1 className="rest-name">{restaurant.name}</h1>
                        <p className="rest-tagline">Serving excellence on your journey since 2012.</p>
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
                                        <img src={item.image} alt={item.name} />
                                        <div className="item-category-tag">{item.category}</div>
                                    </div>
                                    <div className="item-details">
                                        <div className="item-header">
                                            <h4>{item.name}</h4>
                                            <div className="item-price">₹{item.price}</div>
                                        </div>
                                        <p className="item-desc">{item.desc}</p>
                                        <button className="add-to-cart-btn btn-primary-slim">
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
