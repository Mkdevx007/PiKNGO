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
        PENDING, CONFIRMED, PREPARING, READY, PICKED_UP, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rider_id")
    private User rider;

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

    @Column(name = "points_earned")
    private Long pointsEarned = 0L;

    @Column(name = "promo_code")
    private String promoCode;

    @Column(name = "discount_amount", precision = 12, scale = 2)
    private java.math.BigDecimal discountAmount = java.math.BigDecimal.ZERO;

    @Column(name = "rider_latitude")
    private Double riderLatitude;

    @Column(name = "rider_longitude")
    private Double riderLongitude;

    @Column(name = "delivery_latitude")
    private Double deliveryLatitude;

    @Column(name = "delivery_longitude")
    private Double deliveryLongitude;

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
        private OrderStatus status;
        private String deliveryAddress;
        private boolean isSelfPickup;
        private String paymentMethod;
        private Long pointsEarned = 0L;
        private User rider;
        private String promoCode;
        private java.math.BigDecimal discountAmount = java.math.BigDecimal.ZERO;
        private Double riderLatitude;
        private Double riderLongitude;
        private Double deliveryLatitude;
        private Double deliveryLongitude;

        public OrderBuilder user(User user) { this.user = user; return this; }
        public OrderBuilder restaurant(Restaurant restaurant) { this.restaurant = restaurant; return this; }
        public OrderBuilder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public OrderBuilder status(OrderStatus status) { this.status = status; return this; }
        public OrderBuilder deliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; return this; }
        public OrderBuilder isSelfPickup(boolean isSelfPickup) { this.isSelfPickup = isSelfPickup; return this; }
        public OrderBuilder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public OrderBuilder pointsEarned(Long pointsEarned) { this.pointsEarned = pointsEarned; return this; }
        public OrderBuilder rider(User rider) { this.rider = rider; return this; }
        public OrderBuilder promoCode(String promoCode) { this.promoCode = promoCode; return this; }
        public OrderBuilder discountAmount(java.math.BigDecimal discountAmount) { this.discountAmount = discountAmount; return this; }
        public OrderBuilder riderLatitude(Double lat) { this.riderLatitude = lat; return this; }
        public OrderBuilder riderLongitude(Double lng) { this.riderLongitude = lng; return this; }
        public OrderBuilder deliveryLatitude(Double lat) { this.deliveryLatitude = lat; return this; }
        public OrderBuilder deliveryLongitude(Double lng) { this.deliveryLongitude = lng; return this; }

        public Order build() {
            Order order = new Order();
            order.setUser(user);
            order.setRestaurant(restaurant);
            order.setTotalAmount(totalAmount);
            order.setStatus(status);
            order.setDeliveryAddress(deliveryAddress);
            order.setSelfPickup(isSelfPickup);
            order.setPaymentMethod(paymentMethod);
            order.setPointsEarned(pointsEarned);
            order.setRider(rider);
            order.setPromoCode(promoCode);
            order.setDiscountAmount(discountAmount);
            order.setRiderLatitude(riderLatitude);
            order.setRiderLongitude(riderLongitude);
            order.setDeliveryLatitude(deliveryLatitude);
            order.setDeliveryLongitude(deliveryLongitude);
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
    public Long getPointsEarned() { return pointsEarned; }
    public void setPointsEarned(Long pointsEarned) { this.pointsEarned = pointsEarned; }
    public User getRider() { return rider; }
    public void setRider(User rider) { this.rider = rider; }
    public String getPromoCode() { return promoCode; }
    public void setPromoCode(String promoCode) { this.promoCode = promoCode; }
    public java.math.BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(java.math.BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public Double getRiderLatitude() { return riderLatitude; }
    public void setRiderLatitude(Double riderLatitude) { this.riderLatitude = riderLatitude; }
    public Double getRiderLongitude() { return riderLongitude; }
    public void setRiderLongitude(Double riderLongitude) { this.riderLongitude = riderLongitude; }
    public Double getDeliveryLatitude() { return deliveryLatitude; }
    public void setDeliveryLatitude(Double deliveryLatitude) { this.deliveryLatitude = deliveryLatitude; }
    public Double getDeliveryLongitude() { return deliveryLongitude; }
    public void setDeliveryLongitude(Double deliveryLongitude) { this.deliveryLongitude = deliveryLongitude; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public LocalDateTime getCreatedTs() { return createdTs; }
    public void setCreatedTs(LocalDateTime createdTs) { this.createdTs = createdTs; }
    public LocalDateTime getModifiedTs() { return modifiedTs; }
    public void setModifiedTs(LocalDateTime modifiedTs) { this.modifiedTs = modifiedTs; }
}
