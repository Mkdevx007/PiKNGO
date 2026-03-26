package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.dto.OrderRequestDTO;
import com.pikngo.user_service.dto.OrderResponseDTO;
import com.pikngo.user_service.entity.*;
import com.pikngo.user_service.repository.*;
import com.pikngo.user_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    @Override
    @Transactional
    public OrderResponseDTO placeOrder(UUID userId, OrderRequestDTO request) {
        log.info("Placing order for user: {} to restaurant: {}", userId, request.getRestaurantId());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Order order = Order.builder()
                .user(user)
                .restaurant(restaurant)
                .totalAmount(request.getTotalAmount())
                .deliveryAddress(request.getDeliveryAddress())
                .paymentMethod(request.getPaymentMethod())
                .status("PENDING")
                .build();

        List<OrderItem> orderItems = request.getItems().stream().map(itemDto -> {
            MenuItem menuItem = menuItemRepository.findById(itemDto.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found: " + itemDto.getMenuItemId()));
            
            return OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .quantity(itemDto.getQuantity())
                    .price(itemDto.getPrice())
                    .build();
        }).collect(Collectors.toList());

        order.setItems(orderItems);
        Order savedOrder = orderRepository.save(order);

        return mapToDTO(savedOrder);
    }

    @Override
    public OrderResponseDTO getOrderById(UUID orderId) {
        return orderRepository.findById(orderId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Override
    public List<OrderResponseDTO> getUserOrders(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedTsDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponseDTO> getRestaurantOrders(UUID restaurantId) {
        return orderRepository.findByRestaurantIdOrderByCreatedTsDesc(restaurantId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedTsDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponseDTO updateOrderStatus(UUID orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return mapToDTO(orderRepository.save(order));
    }

    private OrderResponseDTO mapToDTO(Order order) {
        return OrderResponseDTO.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getFirstName() + " " + order.getUser().getLastName())
                .restaurantId(order.getRestaurant().getId())
                .restaurantName(order.getRestaurant().getResturantName())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .deliveryAddress(order.getDeliveryAddress())
                .paymentMethod(order.getPaymentMethod())
                .createdTs(order.getCreatedTs())
                .items(order.getItems().stream().map(item -> 
                    OrderResponseDTO.OrderItemResponseDTO.builder()
                            .id(item.getId())
                            .menuItemId(item.getMenuItem().getId())
                            .itemName(item.getMenuItem().getName())
                            .quantity(item.getQuantity())
                            .price(item.getPrice())
                            .build()
                ).collect(Collectors.toList()))
                .build();
    }
}
