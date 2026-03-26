package com.pikngo.user_service.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDTO {
    private UUID restaurantId;
    private java.math.BigDecimal totalAmount;
    private String deliveryAddress;
    private String paymentMethod;
    private List<OrderItemDTO> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDTO {
        private UUID menuItemId;
        private Integer quantity;
        private java.math.BigDecimal price;
    }
}
