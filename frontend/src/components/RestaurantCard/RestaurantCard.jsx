import React from 'react';
import { MapPin, Star, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './RestaurantCard.css';

const RestaurantCard = ({ id, restaurantName, address, latitude, longitude, rating = 4.5 }) => {
    const navigate = useNavigate();

    return (
        <div className="restaurant-card glass-card animate-fade-in" onClick={() => navigate(`/menu/${id}`)}>
            <div className="card-image-wrapper">
                <img
                    src={`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1500&auto=format&fit=crop`}
                    alt={restaurantName}
                    className="restaurant-image"
                />
                <div className="image-overlay">
                    <div className="rating-badge">
                        <Star size={14} fill="currentColor" />
                        <span>{rating}</span>
                    </div>
                </div>
            </div>

            <div className="card-content">
                <div className="card-header">
                    <h3 className="restaurant-name">{restaurantName}</h3>
                    <span className="status-dot online"></span>
                </div>

                <div className="details-row">
                    <MapPin size={14} className="icon-gold" />
                    <span className="address-text">{address}</span>
                </div>

                <div className="card-footer">
                    <div className="footer-info">
                        <Clock size={14} />
                        <span>20-30 min</span>
                    </div>
                    <button className="view-btn">
                        View Menu <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestaurantCard;
