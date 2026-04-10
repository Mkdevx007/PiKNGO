package com.pikngo.user_service.entity;

import jakarta.persistence.*;
import java.util.UUID;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "_id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id")
    private MenuItem menuItem;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    public OrderItem() {}

    public OrderItem(UUID id, Order order, MenuItem menuItem, Integer quantity, BigDecimal price) {
        this.id = id;
        this.order = order;
        this.menuItem = menuItem;
        this.quantity = quantity;
        this.price = price;
    }

    public static class OrderItemBuilder {
        private UUID id;
        private Order order;
        private MenuItem menuItem;
        private Integer quantity;
        private BigDecimal price;

        public OrderItemBuilder id(UUID id) { this.id = id; return this; }
        public OrderItemBuilder order(Order order) { this.order = order; return this; }
        public OrderItemBuilder menuItem(MenuItem menuItem) { this.menuItem = menuItem; return this; }
        public OrderItemBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public OrderItemBuilder price(BigDecimal price) { this.price = price; return this; }

        public OrderItem build() {
            return new OrderItem(id, order, menuItem, quantity, price);
        }
    }

    public static OrderItemBuilder builder() {
        return new OrderItemBuilder();
    }

    // Explicit Getters and Setters for high reliability
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public UUID getMenuItemId() { return menuItem != null ? menuItem.getId() : null; }
    public MenuItem getMenuItem() { return menuItem; }
    public void setMenuItem(MenuItem menuItem) { this.menuItem = menuItem; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}
