package com.pikngo.user_service.controller;

import com.pikngo.user_service.dto.ReviewRequestDTO;
import com.pikngo.user_service.dto.ReviewResponseDTO;
import com.pikngo.user_service.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<ReviewResponseDTO> submitReview(
            @PathVariable UUID userId,
            @RequestBody ReviewRequestDTO request) {
        return ResponseEntity.ok(reviewService.submitReview(userId, request));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<ReviewResponseDTO>> getRestaurantReviews(
            @PathVariable UUID restaurantId) {
        return ResponseEntity.ok(reviewService.getRestaurantReviews(restaurantId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewResponseDTO>> getUserReviews(
            @PathVariable UUID userId) {
        return ResponseEntity.ok(reviewService.getUserReviews(userId));
    }
}
