package com.pikngo.user_service.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {
    private UUID id;
    private UUID userId;
    private String userName;
    private UUID restaurantId;
    private String restaurantName;
    private java.math.BigDecimal totalAmount;
    private String status;
    private String deliveryAddress;
    private String paymentMethod;
    private LocalDateTime createdTs;
    private List<OrderItemResponseDTO> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponseDTO {
        private UUID id;
        private UUID menuItemId;
        private String itemName;
        private Integer quantity;
        private java.math.BigDecimal price;
    }
}
