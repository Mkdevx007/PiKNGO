package com.pikngo.user_service.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

@Entity
@Table(name = "orders")
public class Order {

    public enum OrderStatus {
        PENDING, CONFIRMED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "_id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "is_self_pickup", nullable = false)
    private boolean isSelfPickup = false;

    @Column(name = "payment_method")
    private String paymentMethod;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;

    @CreationTimestamp
    @Column(name = "created_ts", updatable = false)
    private LocalDateTime createdTs;

    @UpdateTimestamp
    @Column(name = "modified_ts")
    private LocalDateTime modifiedTs;

    public Order() {}

    // Manual Builder to replace failing Lombok builder
    public static class OrderBuilder {
        private User user;
        private Restaurant restaurant;
        private BigDecimal totalAmount;
        private OrderStatus status = OrderStatus.PENDING;
        private String deliveryAddress;
        private boolean isSelfPickup = false;
        private String paymentMethod;

        public OrderBuilder user(User user) { this.user = user; return this; }
        public OrderBuilder restaurant(Restaurant restaurant) { this.restaurant = restaurant; return this; }
        public OrderBuilder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public OrderBuilder status(OrderStatus status) { this.status = status; return this; }
        public OrderBuilder deliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; return this; }
        public OrderBuilder isSelfPickup(boolean isSelfPickup) { this.isSelfPickup = isSelfPickup; return this; }
        public OrderBuilder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }

        public Order build() {
            Order order = new Order();
            order.setUser(user);
            order.setRestaurant(restaurant);
            order.setTotalAmount(totalAmount);
            order.setStatus(status);
            order.setDeliveryAddress(deliveryAddress);
            order.setSelfPickup(isSelfPickup);
            order.setPaymentMethod(paymentMethod);
            return order;
        }
    }

    public static OrderBuilder builder() {
        return new OrderBuilder();
    }

    // Explicit Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }
    public BigDecimal totalAmount() { return totalAmount; } 
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public boolean isSelfPickup() { return isSelfPickup; }
    public void setSelfPickup(boolean selfPickup) { isSelfPickup = selfPickup; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public LocalDateTime getCreatedTs() { return createdTs; }
    public void setCreatedTs(LocalDateTime createdTs) { this.createdTs = createdTs; }
    public LocalDateTime getModifiedTs() { return modifiedTs; }
    public void setModifiedTs(LocalDateTime modifiedTs) { this.modifiedTs = modifiedTs; }
}
