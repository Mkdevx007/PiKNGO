package com.pikngo.user_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ReviewResponseDTO {
    private UUID id;
    private UUID userId;
    private String userName;
    private String userPhotoUrl;
    private UUID restaurantId;
    private String restaurantName;
    private Integer rating;
    private String comment;
    private String photoUrl;
    private boolean isEliteReview;
    private LocalDateTime createdTs;

    // Constructors, Getters, Setters
    public ReviewResponseDTO() {}

    public static class Builder {
        private ReviewResponseDTO dto = new ReviewResponseDTO();
        public Builder id(UUID id) { dto.id = id; return this; }
        public Builder userId(UUID userId) { dto.userId = userId; return this; }
        public Builder userName(String userName) { dto.userName = userName; return this; }
        public Builder userPhotoUrl(String userPhotoUrl) { dto.userPhotoUrl = userPhotoUrl; return this; }
        public Builder restaurantId(UUID restaurantId) { dto.restaurantId = restaurantId; return this; }
        public Builder restaurantName(String restaurantName) { dto.restaurantName = restaurantName; return this; }
        public Builder rating(Integer rating) { dto.rating = rating; return this; }
        public Builder comment(String comment) { dto.comment = comment; return this; }
        public Builder photoUrl(String photoUrl) { dto.photoUrl = photoUrl; return this; }
        public Builder isEliteReview(boolean isEliteReview) { dto.isEliteReview = isEliteReview; return this; }
        public Builder createdTs(LocalDateTime createdTs) { dto.createdTs = createdTs; return this; }
        public ReviewResponseDTO build() { return dto; }
    }

    public static Builder builder() { return new Builder(); }

    // Standard Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getUserPhotoUrl() { return userPhotoUrl; }
    public void setUserPhotoUrl(String userPhotoUrl) { this.userPhotoUrl = userPhotoUrl; }
    public UUID getRestaurantId() { return restaurantId; }
    public void setRestaurantId(UUID restaurantId) { this.restaurantId = restaurantId; }
    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public boolean isEliteReview() { return isEliteReview; }
    public void setEliteReview(boolean eliteReview) { isEliteReview = eliteReview; }
    public LocalDateTime getCreatedTs() { return createdTs; }
    public void setCreatedTs(LocalDateTime createdTs) { this.createdTs = createdTs; }
}
