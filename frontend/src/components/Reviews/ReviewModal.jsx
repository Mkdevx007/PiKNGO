import React, { useState } from 'react';
import { Star, X, Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, onSubmit, restaurantName, isSubmitting }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) return;
        onSubmit({ rating, comment, photoUrl });
        // Reset state
        setRating(0);
        setComment('');
        setPhotoUrl('');
    };

    return (
        <div className="review-modal-overlay">
            <div className="review-modal glass-modern animate-scale-in">
                <div className="modal-header">
                    <div className="header-intel">
                        <span className="intel-tag">COMMUNICATION UPLINK</span>
                        <h3>Record Transmission: {restaurantName}</h3>
                    </div>
                    <button className="close-btn" onClick={onClose} disabled={isSubmitting}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="rating-selector">
                        <label>EXPERIENCE QUALITY</label>
                        <div className="star-group">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`star-btn ${star <= (hover || rating) ? 'active' : ''}`}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                >
                                    <Star size={32} fill={star <= (hover || rating) ? 'currentColor' : 'none'} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="input-group-elite">
                        <label>FEEDBACK DATA</label>
                        <textarea
                            placeholder="Describe your journey experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group-elite">
                        <label>VISUAL EVIDENCE (URL)</label>
                        <div className="input-with-icon">
                            <ImageIcon size={18} className="input-icon" />
                            <input
                                type="text"
                                placeholder="Paste photo link..."
                                value={photoUrl}
                                onChange={(e) => setPhotoUrl(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="submit-btn-elite" 
                        disabled={rating === 0 || isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>TRANSMITTING...</span>
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                <span>BROADCAST REVIEW</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="modal-footer-intel">
                    <p>Verified reviews contribute to restaurant ranking and Elite status.</p>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
