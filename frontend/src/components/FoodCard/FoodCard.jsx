import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import './FoodCard.css';

const FoodCard = ({ image, name, price, rating, restaurant }) => {
    const navigate = useNavigate();

    // Create a slug from restaurant name for routing
    const restaurantId = restaurant.toLowerCase().replace(/\s+/g, '-');

    return (
        <div
            className="food-card glass-card flex-col animate-fade-in"
            onClick={() => navigate(`/menu/${restaurantId}`)}
            style={{ cursor: 'pointer' }}
        >
            <div className="food-image-wrapper">
                <img src={image} alt={name} className="food-img" />
                <div className="rating-badge">
                    <Star size={12} fill="currentColor" />
                    <span>{rating}</span>
                </div>
            </div>
            <div className="food-details">
                <div className="food-header">
                    <h3 className="food-title">{name}</h3>
                    <p className="food-vendor">{restaurant}</p>
                </div>
                <div className="food-action-row">
                    <div className="price-tag">
                        <span className="currency">₹</span>
                        <span className="amount">{price}</span>
                    </div>
                    <button className="add-cart-btn btn-primary-slim">
                        <ShoppingCart size={16} />
                        <span>Add</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FoodCard;
