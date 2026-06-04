import React, { useEffect, useState } from 'react';
import { Tag, Timer, X, Zap, ChevronRight } from 'lucide-react';
import './FlashDealOverlay.css';

const FlashDealOverlay = ({ restaurant, onClose, onAction }) => {
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (timeLeft <= 0) {
            onClose();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, onClose]);

    return (
        <div className="flash-deal-container flash-deal-animate-slide-up">
            <div className="flash-deal-glow"></div>
            <div className="flash-deal-card glass-modern">
                <button className="close-btn" onClick={onClose}>
                    <X size={18} />
                </button>
                
                <div className="flash-header">
                    <div className="zap-badge">
                        <Zap size={14} fill="currentColor" />
                        <span>FLASH DEAL</span>
                    </div>
                    <div className="timer-badge">
                        <Timer size={14} />
                        <span>{timeLeft}s</span>
                    </div>
                </div>

                <div className="flash-content">
                    <h3>{restaurant.name}</h3>
                    <p>You are just 2 mins away! Unlock <strong>20% OFF</strong> on your entire order if you act now.</p>
                </div>

                <div className="flash-footer">
                    <button className="btn-claim" onClick={() => onAction(restaurant.id)}>
                        Claim Discount <ChevronRight size={18} />
                    </button>
                </div>

                <div className="progress-bar">
                    <div 
                        className="progress-fill" 
                        style={{ width: `${(timeLeft / 60) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default FlashDealOverlay;
