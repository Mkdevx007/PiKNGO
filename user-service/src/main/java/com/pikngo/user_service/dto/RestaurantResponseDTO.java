package com.pikngo.user_service.dto;

import java.util.UUID;

public class RestaurantResponseDTO {
    private UUID id;
    private String restaurantName;
    private String address;
    private Double latitude;
    private Double longitude;
    private String imageUrl;
    private String category;
    private Double rating;
    private String deliveryTime;
    private boolean isActive;
    private Double distance;

    public RestaurantResponseDTO() {}

    public static class RestaurantResponseDTOBuilder {
        private UUID id;
        private String restaurantName;
        private String address;
        private Double latitude;
        private Double longitude;
        private String imageUrl;
        private String category;
        private Double rating;
        private String deliveryTime;
        private boolean isActive;
        private Double distance;

        public RestaurantResponseDTOBuilder id(UUID id) { this.id = id; return this; }
        public RestaurantResponseDTOBuilder restaurantName(String restaurantName) { this.restaurantName = restaurantName; return this; }
        public RestaurantResponseDTOBuilder address(String address) { this.address = address; return this; }
        public RestaurantResponseDTOBuilder latitude(Double latitude) { this.latitude = latitude; return this; }
        public RestaurantResponseDTOBuilder longitude(Double longitude) { this.longitude = longitude; return this; }
        public RestaurantResponseDTOBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public RestaurantResponseDTOBuilder category(String category) { this.category = category; return this; }
        public RestaurantResponseDTOBuilder rating(Double rating) { this.rating = rating; return this; }
        public RestaurantResponseDTOBuilder deliveryTime(String deliveryTime) { this.deliveryTime = deliveryTime; return this; }
        public RestaurantResponseDTOBuilder isActive(boolean isActive) { this.isActive = isActive; return this; }
        public RestaurantResponseDTOBuilder distance(Double distance) { this.distance = distance; return this; }

        public RestaurantResponseDTO build() {
            RestaurantResponseDTO dto = new RestaurantResponseDTO();
            dto.setId(id);
            dto.setRestaurantName(restaurantName);
            dto.setAddress(address);
            dto.setLatitude(latitude);
            dto.setLongitude(longitude);
            dto.setImageUrl(imageUrl);
            dto.setCategory(category);
            dto.setRating(rating);
            dto.setDeliveryTime(deliveryTime);
            dto.setActive(isActive);
            dto.setDistance(distance);
            return dto;
        }
    }

    public static RestaurantResponseDTOBuilder builder() {
        return new RestaurantResponseDTOBuilder();
    }

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
    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }
}
