import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, MapPin } from 'lucide-react';
import './FoodCard.css';

const FoodCard = ({ id, image, name, price, rating, restaurant, address, distance, onHover, onLeave }) => {

    const navigate = useNavigate();


    return (
        <div
            className="food-card glass-card flex-col animate-fade-in"
            onClick={() => navigate(`/menu/${id}`)}
            onMouseEnter={() => onHover && id && onHover(id)}
            onMouseLeave={() => onLeave && onLeave()}
            style={{ cursor: 'pointer' }}
        >
            <div className="food-image-wrapper">
                <img src={image} alt={name} className="food-img" />
                {distance != null && (
                    <div className="distance-badge-overlay right-aligned">
                        <span>{distance < 1 ? `${Math.round(distance * 1000)}m away` : `${distance.toFixed(1)} km away`}</span>
                    </div>
                )}
            </div>
            <div className="food-details">
                <div className="food-header">
                    <div className="title-rating-row">
                        <h3 className="food-title">{name}</h3>
                        <div className="card-rating">
                            <Star size={14} fill="currentColor" />
                            <span>{rating}</span>
                        </div>
                    </div>
                    <p className="food-vendor">{address || restaurant}</p>
                </div>
                <div className="food-action-row">
                    <button className="btn-outline">View Menu</button>
                    <button className="btn-solid" onClick={(e) => { e.stopPropagation(); navigate(`/menu/${id}`); }}>Order Now</button>
                </div>
            </div>
        </div>
    );
};

export default FoodCard;
