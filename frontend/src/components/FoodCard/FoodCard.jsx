import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Navigation, Clock } from 'lucide-react';
import SafeImage from '../Common/SafeImage';
import './FoodCard.css';

const FoodCard = ({ id, image, name, rating, address, distance, isActive, onHover, onLeave }) => {
    // Treat null/undefined as true (Active)
    const active = isActive !== false;
    const navigate = useNavigate();

    const handleCardClick = () => {
        if (!isActive) return; // Prevent navigation if closed
        navigate(`/menu/${id}`);
    };

    return (
        <div
            className={`restaurant-portal-card glass-modern animate-fade-in ${!active ? 'closed-card' : ''}`}
            onClick={handleCardClick}
            onMouseEnter={() => onHover && id && onHover(id)}
            onMouseLeave={() => onLeave && onLeave()}
        >
            <div className="card-media">
                <SafeImage src={image} alt={name} className="media-image" />
                <div className="media-overlay"></div>
                
                {distance !== undefined && distance !== null && distance !== '' && !isNaN(parseFloat(distance)) && (
                    <div className="proximity-badge-overlay-elite">
                        <span>{parseFloat(distance) < 1 ? `${Math.round(parseFloat(distance) * 1000)}m` : `${parseFloat(distance).toFixed(1)} KM`} AWAY</span>
                    </div>
                )}

                {!active && (
                    <div className="closed-overlay animate-fade-in">
                        <div className="closed-badge-main">
                            <Clock size={16} />
                            <span>Temporarily Closed</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="card-content">
                <div className="content-header-block">
                    <div className="header-main-row">
                        <h3 className="restaurant-name">{name}</h3>
                        <div className="rating-pill-inline">
                            <Star size={14} fill="#FF6B00" color="#FF6B00" />
                            <span>{rating || '4.0'}</span>
                        </div>
                    </div>
                    <div className="location-info-muted">
                        <span title={address}>{address || 'Highway Service Area, NH4'}</span>
                    </div>
                </div>

                <div className="card-footer-actions">
                    <button 
                        className={`btn-outline-text ${!active ? 'disabled' : ''}`} 
                        onClick={(e) => { e.stopPropagation(); if(active) navigate(`/menu/${id}`); }}
                        disabled={!active}
                    >
                        VIEW MENU
                    </button>
                    <button 
                        className={`btn-solid-orange ${!active ? 'disabled' : ''}`} 
                        onClick={(e) => { e.stopPropagation(); if(active) navigate(`/menu/${id}`); }}
                        disabled={!active}
                    >
                        {active ? 'ORDER NOW' : 'CLOSED'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FoodCard;
