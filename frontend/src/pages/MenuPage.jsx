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
    'royal-cuisines': {
        name: 'Royal Cuisines',
        rating: 4.9,
        deliveryTime: '25-30 min',
        category: 'Gourmet • Continental',
        banner: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop',
        menu: [
            { id: 101, name: 'Truffle Glazed Burger', price: 450, desc: 'Premium wagyu beef with black truffle aioli and aged cheddar.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000', category: 'Main' },
            { id: 102, name: 'Lobster Bisque', price: 320, desc: 'Creamy Atlantic lobster soup with a hint of cognac.', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1000', category: 'Starters' },
            { id: 103, name: 'Saffron Risotto', price: 480, desc: 'Italian arborio rice cooked with premium Kashmiri saffron.', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=1000', category: 'Main' },
        ]
    },
    'highway-spice': {
        name: 'Highway Spice',
        rating: 4.7,
        deliveryTime: '15-20 min',
        category: 'Indian • Tandoor',
        banner: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=2072&auto=format&fit=crop',
        menu: [
            { id: 201, name: 'Paneer Tikka Platter', price: 280, desc: 'Fresh cottage cheese cubes marinated in spicy yogurt and grilled.', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=1000', category: 'Starters' },
            { id: 202, name: 'Butter Chicken Elite', price: 420, desc: 'Classic murgh makhani with a creamy, velvety tomato gravy.', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b245004?q=80&w=1000', category: 'Main' },
            { id: 203, name: 'Garlic Butter Naan', price: 60, desc: 'Leavened clay oven bread topped with fresh garlic and butter.', image: 'https://images.unsplash.com/photo-1601050638917-3f80fc014923?q=80&w=1000', category: 'Breads' },
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
        const data = restaurantData[restaurantId] || restaurantData['royal-cuisines'];
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
