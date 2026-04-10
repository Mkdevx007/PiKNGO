package com.pikngo.user_service.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class OrderRequestDTO {
    private UUID restaurantId;
    private BigDecimal totalAmount;
    private String deliveryAddress;
    private boolean isSelfPickup;
    private String paymentMethod;
    private List<OrderItemRequestDTO> items;

    public OrderRequestDTO() {}

    public static class OrderItemRequestDTO {
        private UUID menuItemId;
        private Integer quantity;
        private BigDecimal price;

        public OrderItemRequestDTO() {}
        public UUID getMenuItemId() { return menuItemId; }
        public void setMenuItemId(UUID menuItemId) { this.menuItemId = menuItemId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
    }

    public UUID getRestaurantId() { return restaurantId; }
    public void setRestaurantId(UUID restaurantId) { this.restaurantId = restaurantId; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public boolean isSelfPickup() { return isSelfPickup; }
    public void setSelfPickup(boolean selfPickup) { isSelfPickup = selfPickup; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public List<OrderItemRequestDTO> getItems() { return items; }
    public void setItems(List<OrderItemRequestDTO> items) { this.items = items; }
}
