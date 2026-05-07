import React from 'react';
import { Star, Shield, Award, User, Calendar } from 'lucide-react';
import './Reviews.css';

const ReviewList = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="empty-reviews glass animate-fade-in">
                <p className="rest-tag-elite text-center py-10 opacity-60">No community transmissions recorded yet. Be the first to share your experience.</p>
            </div>
        );
    }

    return (
        <div className="review-list grid gap-6">
            {reviews.map((review, i) => (
                <div 
                    key={review.id} 
                    className="review-card glass animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.1}s` }}
                >
                    <div className="review-header">
                        <div className="user-blob">
                            <div className="avatar-mini">
                                {review.userPhotoUrl ? (
                                    <img src={review.userPhotoUrl} alt={review.userName} />
                                ) : (
                                    <User size={14} />
                                )}
                            </div>
                            <div className="user-meta">
                                <h4 className="user-name">
                                    {review.userName}
                                    {review.isEliteReview && (
                                        <div className="elite-badge-wrapper">
                                            <Shield size={12} className="elite-badge-icon" fill="currentColor" />
                                            <span>ELITE</span>
                                        </div>
                                    )}
                                </h4>
                                <span className="review-date flex items-center gap-1">
                                    <Calendar size={12} /> {new Date(review.createdTs).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="rating-hub-mini">
                            <Star size={14} fill="#FF6B00" color="#FF6B00" />
                            <span className="rating-val">{review.rating.toFixed(1)}</span>
                        </div>
                    </div>

                    <div className="review-body mt-4">
                        <p className="comment-text">{review.comment}</p>
                        {review.photoUrl && (
                            <div className="review-photo-box mt-4">
                                <img src={review.photoUrl} alt="Review attachment" className="review-photo" />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
