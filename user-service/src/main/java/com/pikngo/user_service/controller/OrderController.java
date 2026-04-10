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

    public OrderController(OrderService orderService, UserRepository userRepository, OrderRepository orderRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
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
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> getRestaurantOrders(@PathVariable UUID restaurantId) {
        log.info("REST request to get orders for restaurant: {}", restaurantId);
        return ResponseEntity.ok(ApiResponse.success("Restaurant orders fetched successfully", orderService.getRestaurantOrders(restaurantId)));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderResponseDTO>>> getAllOrders(Pageable pageable) {
        log.info("REST request to get all orders (admin)");
        return ResponseEntity.ok(ApiResponse.success("All orders fetched successfully", orderService.getAllOrders(pageable)));
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> updateOrderStatus(
            @PathVariable UUID orderId,
            @RequestParam Order.OrderStatus status) {
        log.info("REST request to update status for order: {} to {}", orderId, status);
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
}
