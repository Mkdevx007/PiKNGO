package com.pikngo.user_service.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO representing a trending menu item — most ordered across all restaurants.
 */
public class TrendingItemDTO {

    private UUID menuItemId;
    private String name;
    private String category;
    private BigDecimal price;
    private String imageUrl;
    private boolean isVeg;
    private UUID restaurantId;
    private String restaurantName;
    private Double rating;
    private String deliveryTime;
    private Long orderCount;

    public TrendingItemDTO() {}

    public TrendingItemDTO(UUID menuItemId, String name, String category, BigDecimal price,
                           String imageUrl, boolean isVeg, UUID restaurantId,
                           String restaurantName, Double rating, String deliveryTime, Long orderCount) {
        this.menuItemId = menuItemId;
        this.name = name;
        this.category = category;
        this.price = price;
        this.imageUrl = imageUrl;
        this.isVeg = isVeg;
        this.restaurantId = restaurantId;
        this.restaurantName = restaurantName;
        this.rating = rating;
        this.deliveryTime = deliveryTime;
        this.orderCount = orderCount;
    }

    public UUID getMenuItemId() { return menuItemId; }
    public void setMenuItemId(UUID menuItemId) { this.menuItemId = menuItemId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isVeg() { return isVeg; }
    public void setVeg(boolean veg) { isVeg = veg; }

    public UUID getRestaurantId() { return restaurantId; }
    public void setRestaurantId(UUID restaurantId) { this.restaurantId = restaurantId; }

    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getDeliveryTime() { return deliveryTime; }
    public void setDeliveryTime(String deliveryTime) { this.deliveryTime = deliveryTime; }

    public Long getOrderCount() { return orderCount; }
    public void setOrderCount(Long orderCount) { this.orderCount = orderCount; }
}
