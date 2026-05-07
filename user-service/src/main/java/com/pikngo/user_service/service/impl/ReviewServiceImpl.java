package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.dto.ReviewRequestDTO;
import com.pikngo.user_service.dto.ReviewResponseDTO;
import com.pikngo.user_service.entity.Restaurant;
import com.pikngo.user_service.entity.Review;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.repository.RestaurantRepository;
import com.pikngo.user_service.repository.ReviewRepository;
import com.pikngo.user_service.repository.UserRepository;
import com.pikngo.user_service.service.ReviewService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository, UserRepository userRepository, RestaurantRepository restaurantRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Override
    @Transactional
    public ReviewResponseDTO submitReview(UUID userId, ReviewRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Review review = new Review();
        review.setUser(user);
        review.setRestaurant(restaurant);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setPhotoUrl(request.getPhotoUrl());
        
        // Elite logic: High loyalty users get special badges on reviews
        if (user.getLoyaltyPoints() != null && user.getLoyaltyPoints() >= 1500) {
            review.setEliteReview(true);
        }

        Review savedReview = reviewRepository.save(review);
        
        // Update restaurant's average rating
        updateRestaurantRating(restaurant);

        return mapToDTO(savedReview);
    }

    private void updateRestaurantRating(Restaurant restaurant) {
        List<Review> reviews = reviewRepository.findByRestaurantIdOrderByCreatedTsDesc(restaurant.getId());
        if (reviews.isEmpty()) return;

        double average = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        
        // Round to 1 decimal place
        average = Math.round(average * 10.0) / 10.0;
        
        restaurant.setRating(average);
        restaurantRepository.save(restaurant);
    }

    @Override
    public List<ReviewResponseDTO> getRestaurantReviews(UUID restaurantId) {
        return reviewRepository.findByRestaurantIdOrderByCreatedTsDesc(restaurantId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponseDTO> getUserReviews(UUID userId) {
        return reviewRepository.findByUserIdOrderByCreatedTsDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private ReviewResponseDTO mapToDTO(Review review) {
        if (review == null) return null;
        
        ReviewResponseDTO.Builder builder = ReviewResponseDTO.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .photoUrl(review.getPhotoUrl())
                .isEliteReview(review.isEliteReview())
                .createdTs(review.getCreatedTs());

        if (review.getUser() != null) {
            builder.userId(review.getUser().getId())
                   .userName(review.getUser().getFirstName() + " " + review.getUser().getLastName())
                   .userPhotoUrl(review.getUser().getProfileImageUrl());
        }

        if (review.getRestaurant() != null) {
            builder.restaurantId(review.getRestaurant().getId())
                   .restaurantName(review.getRestaurant().getRestaurantName());
        }

        return builder.build();
    }
}
