package com.pikngo.user_service.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "restaurants")
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "_id")
    private UUID id;

    @Column(name = "restaurant_name", nullable = false, length = 100)
    private String restaurantName;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "delivery_time", length = 20)
    private String deliveryTime;

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<MenuItem> menuItems;

    @CreationTimestamp
    @Column(name = "created_ts", updatable = false)
    private LocalDateTime createdTs;

    @UpdateTimestamp
    @Column(name = "modified_ts")
    private LocalDateTime modifiedTs;

    public Restaurant() {}

    // Manual Builder to replace failing Lombok builder
    public static class RestaurantBuilder {
        private String restaurantName;
        private String address;
        private Double latitude;
        private Double longitude;
        private String imageUrl;
        private String category;
        private Double rating;
        private String deliveryTime;
        private boolean isActive = true;
        private boolean isDeleted = false;

        public RestaurantBuilder restaurantName(String restaurantName) { this.restaurantName = restaurantName; return this; }
        public RestaurantBuilder address(String address) { this.address = address; return this; }
        public RestaurantBuilder latitude(Double latitude) { this.latitude = latitude; return this; }
        public RestaurantBuilder longitude(Double longitude) { this.longitude = longitude; return this; }
        public RestaurantBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public RestaurantBuilder category(String category) { this.category = category; return this; }
        public RestaurantBuilder rating(Double rating) { this.rating = rating; return this; }
        public RestaurantBuilder deliveryTime(String deliveryTime) { this.deliveryTime = deliveryTime; return this; }
        public RestaurantBuilder isActive(boolean isActive) { this.isActive = isActive; return this; }
        public RestaurantBuilder isDeleted(boolean isDeleted) { this.isDeleted = isDeleted; return this; }

        public Restaurant build() {
            Restaurant rest = new Restaurant();
            rest.setRestaurantName(restaurantName);
            rest.setAddress(address);
            rest.setLatitude(latitude);
            rest.setLongitude(longitude);
            rest.setImageUrl(imageUrl);
            rest.setCategory(category);
            rest.setRating(rating);
            rest.setDeliveryTime(deliveryTime);
            rest.setActive(isActive);
            rest.setDeleted(isDeleted);
            return rest;
        }
    }

    public static RestaurantBuilder builder() {
        return new RestaurantBuilder();
    }

    // Explicit Getters and Setters
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
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
    public List<MenuItem> getMenuItems() { return menuItems; }
    public void setMenuItems(List<MenuItem> menuItems) { this.menuItems = menuItems; }
    public LocalDateTime getCreatedTs() { return createdTs; }
    public void setCreatedTs(LocalDateTime createdTs) { this.createdTs = createdTs; }
    public LocalDateTime getModifiedTs() { return modifiedTs; }
    public void setModifiedTs(LocalDateTime modifiedTs) { this.modifiedTs = modifiedTs; }
}
