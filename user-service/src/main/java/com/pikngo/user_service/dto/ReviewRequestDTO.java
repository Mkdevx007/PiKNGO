package com.pikngo.user_service.dto;

import java.util.UUID;

public class ReviewRequestDTO {
    private Integer rating;
    private String comment;
    private String photoUrl;
    private UUID restaurantId;

    public ReviewRequestDTO() {}

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public UUID getRestaurantId() { return restaurantId; }
    public void setRestaurantId(UUID restaurantId) { this.restaurantId = restaurantId; }
}
