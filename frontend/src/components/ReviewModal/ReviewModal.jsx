import React, { useState } from 'react';
import { Star, X, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, order }) => {
    const { showToast } = useToast();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            showToast('Please select a star rating', 'error');
            return;
        }

        setIsSubmitting(true);
        // Mocking API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            showToast('Review submitted! Thank you for your feedback.', 'success');
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setRating(0);
                setComment('');
            }, 2000);
        }, 1500);
    };

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="review-modal glass-card elite-entrance" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                {!isSuccess ? (
                    <div className="review-content">
                        <div className="review-header">
                            <div className="icon-badge">
                                <Star className="text-orange" fill="currentColor" />
                            </div>
                            <h2>Rate Your Experience</h2>
                            <p>How was your meal from <strong>{order?.restaurantName}</strong>?</p>
                        </div>

                        <form onSubmit={handleSubmit} className="review-form">
                            <div className="star-rating-container">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`star-btn ${star <= (hover || rating) ? 'active' : ''}`}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                    >
                                        <Star size={32} fill={star <= (hover || rating) ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>

                            <div className="comment-box">
                                <label>Tell us more</label>
                                <div className="textarea-wrapper">
                                    <MessageSquare size={18} className="input-icon" />
                                    <textarea
                                        placeholder="Food quality, packaging, pickup experience..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary w-full mt-4" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : (
                                    <>
                                        Submit Review <Send size={18} className="ml-2" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="success-state animate-fade-in">
                        <div className="success-icon">
                            <CheckCircle size={60} className="text-green" />
                        </div>
                        <h2>Feedback Received!</h2>
                        <p>Your review helps us maintain the elite quality of PikNGo stops.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewModal;
