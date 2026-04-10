package com.pikngo.user_service.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

public class OrderResponseDTO {
    private UUID id;
    private UUID userId;
    private String userName;
    private UUID restaurantId;
    private String restaurantName;
    private BigDecimal totalAmount;
    private String status;
    private String deliveryAddress;
    private String paymentMethod;
    private boolean isSelfPickup;
    private LocalDateTime createdTs;
    private List<OrderItemResponseDTO> items;

    public OrderResponseDTO() {}

    public OrderResponseDTO(UUID id, UUID userId, String userName, UUID restaurantId, String restaurantName, 
                             BigDecimal totalAmount, String status, String deliveryAddress, String paymentMethod, 
                             boolean isSelfPickup, LocalDateTime createdTs, List<OrderItemResponseDTO> items) {
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
        this.items = items;
    }

    public static class OrderResponseDTOBuilder {
        private UUID id;
        private UUID userId;
        private String userName;
        private UUID restaurantId;
        private String restaurantName;
        private BigDecimal totalAmount;
        private String status;
        private String deliveryAddress;
        private String paymentMethod;
        private boolean isSelfPickup;
        private LocalDateTime createdTs;
        private List<OrderItemResponseDTO> items;

        public OrderResponseDTOBuilder id(UUID id) { this.id = id; return this; }
        public OrderResponseDTOBuilder userId(UUID userId) { this.userId = userId; return this; }
        public OrderResponseDTOBuilder userName(String userName) { this.userName = userName; return this; }
        public OrderResponseDTOBuilder restaurantId(UUID restaurantId) { this.restaurantId = restaurantId; return this; }
        public OrderResponseDTOBuilder restaurantName(String restaurantName) { this.restaurantName = restaurantName; return this; }
        public OrderResponseDTOBuilder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public OrderResponseDTOBuilder status(String status) { this.status = status; return this; }
        public OrderResponseDTOBuilder deliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; return this; }
        public OrderResponseDTOBuilder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public OrderResponseDTOBuilder isSelfPickup(boolean isSelfPickup) { this.isSelfPickup = isSelfPickup; return this; }
        public OrderResponseDTOBuilder createdTs(LocalDateTime createdTs) { this.createdTs = createdTs; return this; }
        public OrderResponseDTOBuilder items(List<OrderItemResponseDTO> items) { this.items = items; return this; }

        public OrderResponseDTO build() {
            return new OrderResponseDTO(id, userId, userName, restaurantId, restaurantName, totalAmount, status, deliveryAddress, paymentMethod, isSelfPickup, createdTs, items);
        }
    }

    public static OrderResponseDTOBuilder builder() {
        return new OrderResponseDTOBuilder();
    }

    public static class OrderItemResponseDTO {
        private UUID id;
        private UUID menuItemId;
        private String itemName;
        private Integer quantity;
        private BigDecimal price;

        public OrderItemResponseDTO() {}
        public OrderItemResponseDTO(UUID id, UUID menuItemId, String itemName, Integer quantity, BigDecimal price) {
            this.id = id;
            this.menuItemId = menuItemId;
            this.itemName = itemName;
            this.quantity = quantity;
            this.price = price;
        }

        public static class OrderItemResponseDTOBuilder {
            private UUID id;
            private UUID menuItemId;
            private String itemName;
            private Integer quantity;
            private BigDecimal price;

            public OrderItemResponseDTOBuilder id(UUID id) { this.id = id; return this; }
            public OrderItemResponseDTOBuilder menuItemId(UUID menuItemId) { this.menuItemId = menuItemId; return this; }
            public OrderItemResponseDTOBuilder itemName(String itemName) { this.itemName = itemName; return this; }
            public OrderItemResponseDTOBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
            public OrderItemResponseDTOBuilder price(BigDecimal price) { this.price = price; return this; }
            public OrderItemResponseDTO build() {
                return new OrderItemResponseDTO(id, menuItemId, itemName, quantity, price);
            }
        }

        public static OrderItemResponseDTOBuilder builder() {
            return new OrderItemResponseDTOBuilder();
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public UUID getMenuItemId() { return menuItemId; }
        public void setMenuItemId(UUID menuItemId) { this.menuItemId = menuItemId; }
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public boolean isSelfPickup() { return isSelfPickup; }
    public void setSelfPickup(boolean selfPickup) { isSelfPickup = selfPickup; }
    public LocalDateTime getCreatedTs() { return createdTs; }
    public void setCreatedTs(LocalDateTime createdTs) { this.createdTs = createdTs; }
    public List<OrderItemResponseDTO> getItems() { return items; }
    public void setItems(List<OrderItemResponseDTO> items) { this.items = items; }
}
