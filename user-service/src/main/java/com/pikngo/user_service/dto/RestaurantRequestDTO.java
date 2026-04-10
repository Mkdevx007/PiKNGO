package com.pikngo.user_service.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class RestaurantRequestDTO {
    private UUID id;
    private String restaurantName;
    @NotBlank(message = "Address is required")
    private String address;
    private Double latitude;
    private Double longitude;
    private String imageUrl;
    private String category;
    private Double rating;
    private String deliveryTime;
    private boolean isActive;

    public RestaurantRequestDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public String getDeliveryTime() { return deliveryTime; }
    public void setDeliveryTime(String deliveryTime) { this.deliveryTime = deliveryTime; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
