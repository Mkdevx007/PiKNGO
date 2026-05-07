import React, { useState } from 'react';
import { Star, X, Camera, Send, Loader2, CheckCircle } from 'lucide-react';
import { reviewApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './Reviews.css';

const ReviewForm = ({ restaurantId, orderId, onClose, onSuccess }) => {
    const { showToast } = useToast();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const userId = localStorage.getItem('userId');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            showToast('Please provide a star rating', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await reviewApi.submit(userId, {
                restaurantId,
                rating,
                comment,
                photoUrl: '' // Photo upload logic can be added later
            });
            setIsSuccess(true);
            showToast('Review shared with the Elite community!', 'success');
            setTimeout(() => {
                onSuccess && onSuccess();
                onClose();
            }, 2000);
        } catch (err) {
            showToast('Failed to post review. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="elite-modal-backdrop animate-fade-in">
                <div className="elite-modal-content glass success-state animate-scale-in">
                    <div className="success-animation">
                        <CheckCircle size={64} className="text-orange animate-bounce" />
                    </div>
                    <h2 className="elite-h-accent">TRANSMISSION SUCCESSFUL</h2>
                    <p>Your feedback has been encoded into the PikNGo ecosystem.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="elite-modal-backdrop animate-fade-in">
            <div className="elite-modal-content glass feedback-form animate-scale-in">
                <div className="modal-header">
                    <Star size={20} className="text-orange" />
                    <span className="elite-h-accent">ELITE FEEDBACK</span>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <p className="form-hint-elite text-center mb-6">How was your culinary experience at this establishment?</p>
                    
                    <div className="star-rating-hub mb-8">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`star-btn ${star <= (hover || rating) ? 'active' : ''}`}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <Star 
                                    size={36} 
                                    fill={star <= (hover || rating) ? "currentColor" : "none"} 
                                />
                            </button>
                        ))}
                    </div>

                    <div className="form-group-elite mb-6">
                        <label>TRANSMIT COMMENTARY</label>
                        <textarea 
                            placeholder="Share your experience (e.g., flavor profile, service speed, packaging quality...)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="glass-modern-input"
                            rows={4}
                        />
                    </div>

                    <div className="modal-actions pt-4">
                        <button type="button" className="btn-text-elite" onClick={onClose} disabled={isSubmitting}>
                            DISCARD
                        </button>
                        <button type="submit" className="btn-solid-orange-elite" disabled={isSubmitting}>
                            {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> AUTHORIZING...</> : <><Send size={16} /> SUBMIT FEEDBACK</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewForm;
