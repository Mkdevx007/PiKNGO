package com.pikngo.user_service.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
import java.math.BigDecimal;

@Entity
@Table(name = "menu_items")
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "item_name", nullable = false, length = 100)
    private String itemName;

    @Column(name = "item_description", columnDefinition = "TEXT")
    private String itemDescription;

    @Column(name = "item_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal itemPrice;

    @Column(name = "item_image_url", length = 255)
    private String itemImageUrl;

    @Column(name = "item_category", length = 50)
    private String itemCategory;

    @Column(name = "is_available")
    private boolean isAvailable = true;

    @Column(name = "is_veg")
    private boolean isVeg = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id")
    @JsonBackReference
    private Restaurant restaurant;

    @CreationTimestamp
    @Column(name = "created_ts", updatable = false)
    private LocalDateTime createdTs;

    @UpdateTimestamp
    @Column(name = "modified_ts")
    private LocalDateTime modifiedTs;

    public MenuItem() {}

    // Manual Builder to replace failing Lombok builder
    public static class MenuItemBuilder {
        private String itemName;
        private String itemDescription;
        private BigDecimal itemPrice;
        private String itemImageUrl;
        private String itemCategory;
        private boolean isAvailable = true;
        private boolean isVeg = true;
        private Restaurant restaurant;

        public MenuItemBuilder itemName(String itemName) { this.itemName = itemName; return this; }
        public MenuItemBuilder itemDescription(String itemDescription) { this.itemDescription = itemDescription; return this; }
        public MenuItemBuilder itemPrice(BigDecimal itemPrice) { this.itemPrice = itemPrice; return this; }
        public MenuItemBuilder itemImageUrl(String itemImageUrl) { this.itemImageUrl = itemImageUrl; return this; }
        public MenuItemBuilder itemCategory(String itemCategory) { this.itemCategory = itemCategory; return this; }
        public MenuItemBuilder isAvailable(boolean isAvailable) { this.isAvailable = isAvailable; return this; }
        public MenuItemBuilder isVeg(boolean isVeg) { this.isVeg = isVeg; return this; }
        public MenuItemBuilder restaurant(Restaurant restaurant) { this.restaurant = restaurant; return this; }

        public MenuItem build() {
            MenuItem mi = new MenuItem();
            mi.setItemName(itemName);
            mi.setItemDescription(itemDescription);
            mi.setItemPrice(itemPrice);
            mi.setItemImageUrl(itemImageUrl);
            mi.setItemCategory(itemCategory);
            mi.setAvailable(isAvailable);
            mi.setVeg(isVeg);
            mi.setRestaurant(restaurant);
            return mi;
        }
    }

    public static MenuItemBuilder builder() {
        return new MenuItemBuilder();
    }

    // Explicit Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public String getItemDescription() { return itemDescription; }
    public void setItemDescription(String itemDescription) { this.itemDescription = itemDescription; }
    public BigDecimal getItemPrice() { return itemPrice; }
    public void setItemPrice(BigDecimal itemPrice) { this.itemPrice = itemPrice; }
    public String getItemImageUrl() { return itemImageUrl; }
    public void setItemImageUrl(String itemImageUrl) { this.itemImageUrl = itemImageUrl; }
    public String getItemCategory() { return itemCategory; }
    public void setItemCategory(String itemCategory) { this.itemCategory = itemCategory; }
    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }
    public boolean isVeg() { return isVeg; }
    public void setVeg(boolean veg) { isVeg = veg; }
    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }
    public LocalDateTime getCreatedTs() { return createdTs; }
    public void setCreatedTs(LocalDateTime createdTs) { this.createdTs = createdTs; }
    public LocalDateTime getModifiedTs() { return modifiedTs; }
    public void setModifiedTs(LocalDateTime modifiedTs) { this.modifiedTs = modifiedTs; }
}
