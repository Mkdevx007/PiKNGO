import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Clock, Flame, ChevronRight, Filter, Search } from 'lucide-react';

import './TrendingPage.css';

const trendingDishes = [
    {
        id: 1,
        name: 'Dal Makhani Elite',
        restaurant: 'Highway King',
        price: 320,
        rating: 4.8,
        prepTime: '20 min',
        image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?q=80&w=1000',
        tags: ['Must Try', 'Bestseller'],
        category: 'North Indian'
    },
    {
        id: 2,
        name: 'Classic Paneer Tikka',
        restaurant: 'Haldiram',
        price: 280,
        rating: 4.7,
        prepTime: '15 min',
        image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=1000',
        tags: ['Grilled', 'Veg'],
        category: 'Starters'
    },
    {
        id: 3,
        name: 'Tandoori Murgh (Half)',
        restaurant: 'Old Rao Dhaba',
        price: 380,
        rating: 4.9,
        prepTime: '25 min',
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=1000',
        tags: ['Spicy', 'Chef Choice'],
        category: 'Tandoor'
    },
    {
        id: 4,
        name: 'Veg Loaded Burger',
        restaurant: 'McD - Behror',
        price: 180,
        rating: 4.5,
        prepTime: '10 min',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000',
        tags: ['Quick Bite'],
        category: 'Snacks'
    },
    {
        id: 5,
        name: 'Butter Chicken Elite',
        restaurant: 'Highway Spice',
        price: 450,
        rating: 4.9,
        prepTime: '30 min',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b245004?q=80&w=1000',
        tags: ['Premium', 'Bestseller'],
        category: 'Main Course'
    },
    {
        id: 6,
        name: 'Masala Dosa (Ghee)',
        restaurant: 'Vithal Kamat',
        price: 160,
        rating: 4.6,
        prepTime: '12 min',
        image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?q=80&w=1000',
        tags: ['Crispy'],
        category: 'South Indian'
    }
];

const TrendingPage = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Starters', 'Main Course', 'Tandoor', 'North Indian', 'Snacks', 'South Indian'];

    const filteredDishes = selectedCategory === 'All' 
        ? trendingDishes 
        : trendingDishes.filter(dish => dish.category === selectedCategory);

    return (
        <div className="trending-page auth-page-global-bg">
            <div className="bg-mesh"></div>
            <div className="bg-vignette"></div>

            <div className="trending-hero">
                <div className="container hero-content">
                    <div className="hero-badge animate-fade-in">
                        <Flame size={16} fill="currentColor" />
                        <span>Happening Now</span>
                    </div>
                    <h1 className="hero-title animate-fade-in" style={{animationDelay: '0.1s'}}>
                        Trending <span className="gradient-text">Highway Bites</span>
                    </h1>
                    <p className="hero-desc animate-fade-in" style={{animationDelay: '0.2s'}}>
                        The most ordered delicacies by fellow travelers on your route. 
                        Pre-order now and skip the highway queues.
                    </p>
                </div>
            </div>

            <div className="trending-container container">
                <div className="trending-top-bar glass animate-fade-in" style={{animationDelay: '0.3s'}}>
                    <div className="search-pill">
                        <Search size={20} />
                        <input type="text" placeholder="Search for trending dishes..." />
                    </div>
                    <div className="category-scroll">
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="trending-grid">
                    {filteredDishes.map((dish, index) => (
                        <div 
                            key={dish.id} 
                            className="dish-card glass animate-fade-in-up"
                            style={{animationDelay: `${0.1 + index * 0.1}s`, cursor: 'pointer'}}
                            onClick={() => navigate(`/menu/${dish.restaurant.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`)}
                        >
                            <div className="dish-img-wrapper">
                                <img src={dish.image} alt={dish.name} />
                                <div className="dish-tags">
                                    {dish.tags.map(tag => (
                                        <span key={tag} className="dish-tag">{tag}</span>
                                    ))}
                                </div>
                                <div className="dish-rating-badge">
                                    <Star size={14} fill="currentColor" />
                                    <span>{dish.rating}</span>
                                </div>
                            </div>
                            <div className="dish-details">
                                <div className="dish-category">{dish.category}</div>
                                <h3 className="dish-name">{dish.name}</h3>
                                <div className="dish-restaurant">
                                    <span className="by">by</span> {dish.restaurant}
                                </div>
                                <div className="dish-meta">
                                    <div className="prep-time">
                                        <Clock size={16} />
                                        <span>Ready in {dish.prepTime}</span>
                                    </div>
                                    <div className="dish-price">₹{dish.price}</div>
                                </div>
                                <button className="add-btn btn-primary-slim">
                                    <ShoppingCart size={18} />
                                    <span>Add to Tray</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <section className="trending-cta container animate-fade-in">
                <div className="cta-glass glass">
                    <div className="cta-text">
                        <h2>Don't see your favorite?</h2>
                        <p>Explore full menus of the best restaurants on your route.</p>
                    </div>
                    <button className="cta-btn landing-btn-primary" onClick={() => navigate('/')}>
                        <span>Explore All Menus</span>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </section>
        </div>
    );
};

export default TrendingPage;
