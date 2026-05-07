package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.dto.OrderRequestDTO;
import com.pikngo.user_service.dto.OrderResponseDTO;
import com.pikngo.user_service.entity.*;
import com.pikngo.user_service.repository.*;
import com.pikngo.user_service.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final com.pikngo.user_service.service.LoyaltyService loyaltyService;

    public OrderServiceImpl(OrderRepository orderRepository, UserRepository userRepository, 
                            RestaurantRepository restaurantRepository, MenuItemRepository menuItemRepository,
                            SimpMessagingTemplate messagingTemplate, com.pikngo.user_service.service.LoyaltyService loyaltyService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
        this.messagingTemplate = messagingTemplate;
        this.loyaltyService = loyaltyService;
    }

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
                .isSelfPickup(request.isSelfPickup())
                .paymentMethod(request.getPaymentMethod())
                .status(Order.OrderStatus.PENDING)
                .build();

        List<OrderItem> orderItems = (request.getItems() != null) ? request.getItems().stream().map(itemDto -> {
            MenuItem menuItem = menuItemRepository.findById(itemDto.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found: " + itemDto.getMenuItemId()));
            
            return OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .quantity(itemDto.getQuantity())
                    .price(itemDto.getPrice())
                    .build();
        }).collect(Collectors.toList()) : null;

        order.setItems(orderItems);
        
        // Calculate and award loyalty points
        Long pointsEarned = loyaltyService.awardPoints(order);
        order.setPointsEarned(pointsEarned);

        Order savedOrder = orderRepository.save(order);
        OrderResponseDTO response = mapToDTO(savedOrder);
        
        // Broadcast new order to WebSocket topic
        messagingTemplate.convertAndSend("/topic/orders", response);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(UUID orderId) {
        return orderRepository.findById(orderId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getUserOrders(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedTsDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getRestaurantOrders(UUID restaurantId) {
        return orderRepository.findByRestaurantIdOrderByCreatedTsDesc(restaurantId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponseDTO> getAllOrders(Pageable pageable) {
        log.info("Fetching a page of all orders for admin");
        return orderRepository.findAll(pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional
    public OrderResponseDTO updateOrderStatus(UUID orderId, Order.OrderStatus status) {
        log.info("Updating status for order: {} to {}", orderId, status);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        OrderResponseDTO response = mapToDTO(orderRepository.save(order));
        
        // Broadcast order status update to WebSocket topic
        messagingTemplate.convertAndSend("/topic/orders", response);
        
        return response;
    }

    @Override
    @Transactional
    public OrderResponseDTO updateOrderAddress(UUID orderId, String address) {
        log.info("Updating address for order: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setDeliveryAddress(address);
        return mapToDTO(orderRepository.save(order));
    }

    private OrderResponseDTO mapToDTO(Order order) {
        if (order == null) return null;
        
        OrderResponseDTO.OrderResponseDTOBuilder builder = OrderResponseDTO.builder()
                .id(order.getId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .deliveryAddress(order.getDeliveryAddress())
                .isSelfPickup(order.isSelfPickup())
                .paymentMethod(order.getPaymentMethod())
                .pointsEarned(order.getPointsEarned())
                .createdTs(order.getCreatedTs());

        if (order.getUser() != null) {
            builder.userId(order.getUser().getId())
                   .userName(order.getUser().getFirstName() + " " + order.getUser().getLastName());
        }

        if (order.getRestaurant() != null) {
            builder.restaurantId(order.getRestaurant().getId())
                   .restaurantName(order.getRestaurant().getRestaurantName());
        }

        if (order.getItems() != null) {
            builder.items(order.getItems().stream().map(item -> {
                OrderResponseDTO.OrderItemResponseDTO.OrderItemResponseDTOBuilder itemField = OrderResponseDTO.OrderItemResponseDTO.builder()
                        .id(item.getId())
                        .quantity(item.getQuantity())
                        .price(item.getPrice());
                
                if (item.getMenuItem() != null) {
                    itemField.menuItemId(item.getMenuItem().getId())
                             .itemName(item.getMenuItem().getItemName());
                }
                
                return itemField.build();
            }).collect(Collectors.toList()));
        }

        return builder.build();
    }
}
