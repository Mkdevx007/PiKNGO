package com.pikngo.user_service.service;

import com.pikngo.user_service.dto.OrderRequestDTO;
import com.pikngo.user_service.dto.OrderResponseDTO;

import java.util.List;
import java.util.UUID;

public interface OrderService {
    OrderResponseDTO placeOrder(UUID userId, OrderRequestDTO request);
    OrderResponseDTO getOrderById(UUID orderId);
    List<OrderResponseDTO> getUserOrders(UUID userId);
    List<OrderResponseDTO> getRestaurantOrders(UUID restaurantId);
    List<OrderResponseDTO> getAllOrders();
    OrderResponseDTO updateOrderStatus(UUID orderId, String status);
}
