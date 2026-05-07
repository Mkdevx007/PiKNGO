package com.pikngo.user_service.service;

import com.pikngo.user_service.dto.ReviewRequestDTO;
import com.pikngo.user_service.dto.ReviewResponseDTO;

import java.util.List;
import java.util.UUID;

public interface ReviewService {
    ReviewResponseDTO submitReview(UUID userId, ReviewRequestDTO request);
    List<ReviewResponseDTO> getRestaurantReviews(UUID restaurantId);
    List<ReviewResponseDTO> getUserReviews(UUID userId);
}
