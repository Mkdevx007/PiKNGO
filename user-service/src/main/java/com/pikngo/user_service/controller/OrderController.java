package com.pikngo.user_service.controller;

import com.pikngo.user_service.dto.OrderRequestDTO;
import com.pikngo.user_service.dto.OrderResponseDTO;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.repository.UserRepository;
import com.pikngo.user_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<OrderResponseDTO> placeOrder(@RequestBody OrderRequestDTO request, Principal principal) {
        User user = getUserFromPrincipal(principal);
        log.info("REST request to place order for user: {}", user.getId());
        return new ResponseEntity<>(orderService.placeOrder(user.getId(), request), HttpStatus.CREATED);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponseDTO>> getMyOrders(Principal principal) {
        User user = getUserFromPrincipal(principal);
        log.info("REST request to get orders for user: {}", user.getId());
        return ResponseEntity.ok(orderService.getUserOrders(user.getId()));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<OrderResponseDTO>> getRestaurantOrders(@PathVariable UUID restaurantId) {
        log.info("REST request to get orders for restaurant: {}", restaurantId);
        return ResponseEntity.ok(orderService.getRestaurantOrders(restaurantId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        log.info("REST request to get all orders for admin");
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable UUID orderId,
            @RequestParam String status) {
        log.info("REST request to update status of order: {} to {}", orderId, status);
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }

    private User getUserFromPrincipal(Principal principal) {
        return userRepository.findByPhoneNumber(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));
    }
}
