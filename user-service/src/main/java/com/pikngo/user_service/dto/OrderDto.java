package com.pikngo.user_service.dto;

import com.pikngo.user_service.entity.Order;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class OrderDto {
    private UUID id;
    private UUID userId;
    private String userName;
    private UUID restaurantId;
    private String restaurantName;
    private BigDecimal totalAmount;
    private Order.OrderStatus status;
    private String deliveryAddress;
    private String paymentMethod;
    private boolean isSelfPickup;
    private LocalDateTime createdTs;

    public OrderDto() {}

    public OrderDto(UUID id, UUID userId, String userName, UUID restaurantId, String restaurantName, 
                    BigDecimal totalAmount, Order.OrderStatus status, String deliveryAddress, 
                    String paymentMethod, boolean isSelfPickup, LocalDateTime createdTs) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.restaurantId = restaurantId;
        this.restaurantName = restaurantName;
        this.totalAmount = totalAmount;
        this.status = status;
        this.deliveryAddress = deliveryAddress;
        this.paymentMethod = paymentMethod;
        this.isSelfPickup = isSelfPickup;
        this.createdTs = createdTs;
    }

    public static class OrderDtoBuilder {
        private UUID id;
        private UUID userId;
        private String userName;
        private UUID restaurantId;
        private String restaurantName;
        private BigDecimal totalAmount;
        private Order.OrderStatus status;
        private String deliveryAddress;
        private String paymentMethod;
        private boolean isSelfPickup;
        private LocalDateTime createdTs;

        public OrderDtoBuilder id(UUID id) { this.id = id; return this; }
        public OrderDtoBuilder userId(UUID userId) { this.userId = userId; return this; }
        public OrderDtoBuilder userName(String userName) { this.userName = userName; return this; }
        public OrderDtoBuilder restaurantId(UUID restaurantId) { this.restaurantId = restaurantId; return this; }
        public OrderDtoBuilder restaurantName(String restaurantName) { this.restaurantName = restaurantName; return this; }
        public OrderDtoBuilder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public OrderDtoBuilder status(Order.OrderStatus status) { this.status = status; return this; }
        public OrderDtoBuilder deliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; return this; }
        public OrderDtoBuilder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public OrderDtoBuilder isSelfPickup(boolean isSelfPickup) { this.isSelfPickup = isSelfPickup; return this; }
        public OrderDtoBuilder createdTs(LocalDateTime createdTs) { this.createdTs = createdTs; return this; }

        public OrderDto build() {
            return new OrderDto(id, userId, userName, restaurantId, restaurantName, totalAmount, status, deliveryAddress, paymentMethod, isSelfPickup, createdTs);
        }
    }

    public static OrderDtoBuilder builder() {
        return new OrderDtoBuilder();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public UUID getRestaurantId() { return restaurantId; }
    public void setRestaurantId(UUID restaurantId) { this.restaurantId = restaurantId; }
    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public Order.OrderStatus getStatus() { return status; }
    public void setStatus(Order.OrderStatus status) { this.status = status; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public boolean isSelfPickup() { return isSelfPickup; }
    public void setSelfPickup(boolean selfPickup) { isSelfPickup = selfPickup; }
    public LocalDateTime getCreatedTs() { return createdTs; }
    public void setCreatedTs(LocalDateTime createdTs) { this.createdTs = createdTs; }
}
