package com.pikngo.user_service.controller;

import com.pikngo.user_service.dto.ApiResponse;
import com.pikngo.user_service.dto.OrderRequestDTO;
import com.pikngo.user_service.dto.OrderResponseDTO;
import com.pikngo.user_service.dto.TrendingItemDTO;
import com.pikngo.user_service.service.OrderService;
import com.pikngo.user_service.entity.Order;
import com.pikngo.user_service.repository.OrderRepository;
import com.pikngo.user_service.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final com.pikngo.user_service.repository.RestaurantRepository restaurantRepository;

    public OrderController(OrderService orderService, UserRepository userRepository, 
                           OrderRepository orderRepository,
                           com.pikngo.user_service.repository.RestaurantRepository restaurantRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.restaurantRepository = restaurantRepository;
    }

    /** Trending endpoint: returns the top 30 most-ordered menu items across all restaurants */
    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<TrendingItemDTO>>> getTrending(
            @RequestParam(defaultValue = "30") int limit) {
        log.info("REST request to get top {} trending items", limit);
        List<TrendingItemDTO> trending = orderRepository.findTopTrendingItems(PageRequest.of(0, limit));
        return ResponseEntity.ok(ApiResponse.success("Trending items fetched successfully", trending));
    }

    /** New endpoint: Frontend calls POST /orders — userId extracted from JWT cookie automatically */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponseDTO>> placeOrderFromJwt(Principal principal, @RequestBody OrderRequestDTO request) {
        log.info("REST request to place order from JWT user: {}", principal != null ? principal.getName() : "unknown");
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        // principal.getName() is the phone number (username in JWT)
        var user = userRepository.findByPhoneNumber(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found for phone: " + principal.getName()));
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully", orderService.placeOrder(user.getId(), request)));
    }

    /** Legacy endpoint: kept for backward compatibility */
    @PostMapping("/place")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> placeOrder(@RequestParam UUID userId, @RequestBody OrderRequestDTO request) {
        log.info("REST request to place order for user: {}", userId);
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully", orderService.placeOrder(userId, request)));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getOrderById(@PathVariable UUID orderId) {
        log.info("REST request to get order: {}", orderId);
        return ResponseEntity.ok(ApiResponse.success("Order fetched successfully", orderService.getOrderById(orderId)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> getUserOrders(@PathVariable UUID userId) {
        log.info("REST request to get orders for user: {}", userId);
        return ResponseEntity.ok(ApiResponse.success("User orders fetched successfully", orderService.getUserOrders(userId)));
    }

    @GetMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESTAURANT_OWNER')")
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> getRestaurantOrders(Principal principal, @PathVariable UUID restaurantId) {
        log.info("REST request to get orders for restaurant: {}", restaurantId);
        
        // Security Check: If the user is a RESTAURANT_OWNER, verify they own this restaurant
        com.pikngo.user_service.entity.User currentUser = userRepository.findByPhoneNumber(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (currentUser.getRole().name().equals("RESTAURANT_OWNER")) {
            var restaurant = restaurantRepository.findById(restaurantId).orElse(null);
            if (restaurant == null || restaurant.getOwnerId() == null || !restaurant.getOwnerId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).build(); // Forbidden
            }
        }
        
        return ResponseEntity.ok(ApiResponse.success("Restaurant orders fetched successfully", orderService.getRestaurantOrders(restaurantId)));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderResponseDTO>>> getAllOrders(Pageable pageable) {
        log.info("REST request to get all orders (admin)");
        return ResponseEntity.ok(ApiResponse.success("All orders fetched successfully", orderService.getAllOrders(pageable)));
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_RIDER')")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> updateOrderStatus(
            Principal principal,
            @PathVariable UUID orderId,
            @RequestParam Order.OrderStatus status) {
        log.info("REST request to update status for order: {} to {}", orderId, status);
        
        com.pikngo.user_service.entity.User currentUser = userRepository.findByPhoneNumber(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Security Check for Restaurant Owner
        if (currentUser.getRole().name().equals("RESTAURANT_OWNER")) {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            if (!order.getRestaurant().getOwnerId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        
        // Security Check for Delivery Rider
        if (currentUser.getRole().name().equals("DELIVERY_RIDER")) {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            if (order.getRider() == null || !order.getRider().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", orderService.updateOrderStatus(orderId, status)));
    }

    @PatchMapping("/{orderId}/address")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> updateOrderAddress(
            @PathVariable UUID orderId,
            @RequestParam String address) {
        log.info("REST request to update address for order: {}", orderId);
        return ResponseEntity.ok(ApiResponse.success("Order address updated successfully", orderService.updateOrderAddress(orderId, address)));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> getMyOrders(Principal principal) {
        log.info("REST request to get orders for current JWT user: {}", principal != null ? principal.getName() : "unknown");
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        var user = userRepository.findByPhoneNumber(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found for phone: " + principal.getName()));
        return ResponseEntity.ok(ApiResponse.success("My orders fetched successfully", orderService.getUserOrders(user.getId())));
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'DELIVERY_RIDER')")
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> getAvailableOrders() {
        log.info("REST request to get available orders for riders");
        return ResponseEntity.ok(ApiResponse.success("Available orders fetched successfully", orderService.getAvailableOrders()));
    }

    @GetMapping("/rider")
    @PreAuthorize("hasRole('DELIVERY_RIDER')")
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> getRiderOrders(Principal principal) {
        log.info("REST request to get orders for current rider: {}", principal.getName());
        var user = userRepository.findByPhoneNumber(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(ApiResponse.success("Rider orders fetched successfully", orderService.getRiderOrders(user.getId())));
    }

    @PostMapping("/{orderId}/claim")
    @PreAuthorize("hasRole('DELIVERY_RIDER')")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> claimOrder(Principal principal, @PathVariable UUID orderId) {
        log.info("REST request for rider {} to claim order {}", principal.getName(), orderId);
        var user = userRepository.findByPhoneNumber(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(ApiResponse.success("Order claimed successfully", orderService.claimOrder(orderId, user.getId())));
    }
}
