import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Clock, Flame, ChevronRight, Filter, Search, Loader2, TrendingUp } from 'lucide-react';

import './TrendingPage.css';

import { orderApi, restaurantApi, menuApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const TrendingPage = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [trendingDishes, setTrendingDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRealTrending, setIsRealTrending] = useState(false);
    
    const { addToCart } = useCart();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchTrendingData = async () => {
            setLoading(true);

            const categoryImages = {
                'Main Course': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800',
                'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800',
                'Fast Food': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800',
                'Burgers': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=800',
                'Beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800',
                'Desserts': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=800',
                'Indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800',
                'Chinese': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=800',
                'Breakfast': 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=800',
                'Default': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?q=80&w=800'
            };
            const getFallbackImage = (category, name) => {
                if (category && categoryImages[category]) return categoryImages[category];
                const lowerName = (name || '').toLowerCase();
                if (lowerName.includes('pizza')) return categoryImages['Pizza'];
                if (lowerName.includes('burger')) return categoryImages['Burgers'];
                if (lowerName.includes('shake') || lowerName.includes('tea') || lowerName.includes('coffee')) return categoryImages['Beverages'];
                if (lowerName.includes('paneer') || lowerName.includes('roti') || lowerName.includes('thali')) return categoryImages['Indian'];
                return categoryImages['Default'];
            };

            try {
                // ── Path 1: Real trending from order history ──
                const trendingData = await orderApi.getTrending(30);
                const items = Array.isArray(trendingData) ? trendingData : [];

                if (items.length > 0) {
                    const mapped = items.map(item => ({
                        id: item.menuItemId,
                        name: item.name,
                        restaurant: item.restaurantName,
                        restaurantId: item.restaurantId,
                        price: item.price,
                        rating: item.rating ? Number(item.rating).toFixed(1) : '4.0',
                        prepTime: item.deliveryTime || '20-30 min',
                        image: item.imageUrl || getFallbackImage(item.category, item.name),
                        tags: item.veg ? ['Veg', 'Bestseller'] : ['Non-Veg', 'Popular'],
                        category: item.category || 'Main Course',
                        orderCount: item.orderCount || 0,
                    }));
                    setTrendingDishes(mapped);
                    setIsRealTrending(true);
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.warn('Trending endpoint unavailable, falling back to menu browse:', err.message);
            }

            // ── Path 2: Fallback — show all available menu items as "Featured" ──
            try {
                const restaurants = await restaurantApi.getAll();
                let allItems = [];

                await Promise.all((restaurants || []).map(async (rest) => {
                    try {
                        const menuData = await menuApi.getMenu(rest._id || rest.id);
                        const menuArr = Array.isArray(menuData) ? menuData : [];
                        const mapped = menuArr.map(item => ({
                            id: item._id || item.id,
                            name: item.name || item.itemName,
                            restaurant: rest.restaurantName,
                            restaurantId: rest._id || rest.id,
                            price: item.price || item.itemPrice || 99,
                            rating: rest.rating ? Number(rest.rating).toFixed(1) : (4.0 + Math.random() * 0.9).toFixed(1),
                            prepTime: rest.deliveryTime || '20-30 min',
                            image: item.imageUrl || item.itemImageUrl || getFallbackImage(item.category || item.itemCategory, item.name || item.itemName),
                            tags: (item.isVeg || item.veg) ? ['Veg', 'Featured'] : ['Non-Veg', 'Featured'],
                            category: item.category || item.itemCategory || 'Main Course',
                            orderCount: null,
                        }));
                        allItems.push(...mapped);
                    } catch (e) {
                        console.warn('Failed to fetch menu for', rest.restaurantName);
                    }
                }));

                allItems.sort(() => 0.5 - Math.random());
                setTrendingDishes(allItems);
                setIsRealTrending(false);
            } catch (err) {
                console.error('Failed to load featured data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingData();
    }, []);

    // Extract unique categories from actual items
    const dynamicCategories = ['All', ...new Set(trendingDishes.map(dish => dish.category))];

    const filteredDishes = selectedCategory === 'All' 
        ? trendingDishes 
        : trendingDishes.filter(dish => dish.category === selectedCategory);

    const handleAddToCart = (e, dish) => {
        e.stopPropagation();
        
        // Map Trending dish object to Cart item structure
        const cartItem = {
            id: dish.id,
            name: dish.name,
            price: dish.price,
            image: dish.image,
            category: dish.category
        };
        
        addToCart(cartItem, dish.restaurantId, dish.restaurant);
        showToast(`${dish.name} added to tray!`, 'success');
    };

    return (
        <div className="trending-page">
            <div className="bg-mesh-trending"></div>
            
            <div className="trending-hero">
                <div className="container">
                    <div className="hero-badge-elite animate-fade-in">
                        <div className="pulser"></div>
                        <span>{isRealTrending ? 'Real-Time Data Active' : 'Happening Now'}</span>
                    </div>
                    <h1 className="hero-title-elite animate-fade-in">
                        {isRealTrending ? 'Most Ordered' : 'Trending'} <span className="gradient-text">Highway Bites</span>
                    </h1>
                    <p className="hero-desc-elite animate-fade-in">
                        {isRealTrending
                            ? 'Live analytics based on thousands of orders from fellow travelers currently on the road.'
                            : 'The most loved delicacies by fellow travelers on your route. Pre-order now and skip the highway queues.'}
                    </p>
                </div>
            </div>

            <div className="container">
                <div className="trending-filter-bar animate-fade-in">
                    <div className="search-module">
                        <Search size={22} />
                        <input type="text" placeholder="Search for trending dishes..." />
                    </div>
                    <div className="cat-scroll-elite">
                        {dynamicCategories.map(cat => (
                            <button 
                                key={cat} 
                                className={`cat-btn-elite ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.4)' }}>
                        <Loader2 className="spinner" size={48} style={{ margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
                        <p className="dish-cat-elite">Accessing Live Repositories...</p>
                    </div>
                ) : (
                    <div className="trending-grid">
                        {filteredDishes.length > 0 ? (
                            filteredDishes.map((dish, index) => (
                                <div 
                                    key={dish.id} 
                                    className="elite-dish-card animate-fade-in-up"
                                    style={{animationDelay: `${0.1 + (index % 10) * 0.1}s`, cursor: 'pointer'}}
                                    onClick={() => navigate(`/menu/${dish.restaurantId}`)}
                                >
                                    <div className="dish-img-box">
                                        <img 
                                            src={dish.image} 
                                            alt={dish.name} 
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?q=80&w=801';
                                                e.target.onerror = null;
                                            }}
                                        />
                                        
                                        <div className="badge-container">
                                            {dish.tags.map((tag, idx) => (
                                                <span key={idx} className={`radiant-badge ${
                                                    tag.toLowerCase().includes('veg') ? 'badge-veg' : 
                                                    tag.toLowerCase().includes('trending') || tag.toLowerCase().includes('best') ? 'badge-trending' : 'badge-popular'
                                                }`}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="rating-pill-elite">
                                            <Star size={14} fill="currentColor" />
                                            <span>{dish.rating}</span>
                                        </div>

                                        {dish.orderCount && (
                                            <div className="analytics-badge">
                                                <TrendingUp size={14} />
                                                <span>{dish.orderCount}+ Orders</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="elite-dish-info">
                                        <div className="dish-cat-elite">{dish.category}</div>
                                        <h3 className="dish-name-elite">{dish.name}</h3>
                                        <div className="dish-rest-elite">
                                            <span>by</span> {dish.restaurant}
                                        </div>

                                        <div className="elite-meta-row">
                                            <div className="elite-time">
                                                <Clock size={16} />
                                                <span>{dish.prepTime}</span>
                                            </div>
                                            <div className="signature-price-box">
                                                ₹{dish.price}
                                            </div>
                                        </div>

                                        <button className="elite-add-btn" onClick={(e) => handleAddToCart(e, dish)}>
                                            <ShoppingCart size={18} />
                                            <span>Add to Tray</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '80px 0', color: 'rgba(255,255,255,0.4)' }}>
                                <p className="dish-rest-elite">No active signals found for this category.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <section className="container trending-cta">
                <div className="cta-glass-elite animate-fade-in">
                    <div className="cta-text">
                        <h2 className="hero-title-elite" style={{fontSize: '2.5rem', marginBottom: '1rem'}}>Don't see your favorite?</h2>
                        <p className="hero-desc-elite" style={{fontSize: '1.1rem'}}>Explore full menus of the best restaurants on your route.</p>
                    </div>
                    <button className="btn-primary-pro" onClick={() => navigate('/')}>
                        <span>Explore All Menus</span>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </section>
        </div>
    );
};

export default TrendingPage;
