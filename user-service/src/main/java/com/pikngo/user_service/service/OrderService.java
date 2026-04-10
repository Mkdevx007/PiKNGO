package com.pikngo.user_service.service;

import com.pikngo.user_service.dto.OrderRequestDTO;
import com.pikngo.user_service.dto.OrderResponseDTO;
import com.pikngo.user_service.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface OrderService {
    OrderResponseDTO placeOrder(UUID userId, OrderRequestDTO request);
    OrderResponseDTO getOrderById(UUID orderId);
    List<OrderResponseDTO> getUserOrders(UUID userId);
    List<OrderResponseDTO> getRestaurantOrders(UUID restaurantId);
    Page<OrderResponseDTO> getAllOrders(Pageable pageable);
    OrderResponseDTO updateOrderStatus(UUID orderId, Order.OrderStatus status);
    OrderResponseDTO updateOrderAddress(UUID orderId, String address);
}
