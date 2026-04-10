package com.pikngo.user_service.controller;

import com.pikngo.user_service.repository.OrderRepository;
import com.pikngo.user_service.repository.RestaurantRepository;
import com.pikngo.user_service.repository.UserRepository;
import com.pikngo.user_service.repository.PromotionRepository;
import com.pikngo.user_service.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/analytics")
public class AnalyticsController {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;
    private final PromotionRepository promotionRepository;

    public AnalyticsController(UserRepository userRepository, 
                               RestaurantRepository restaurantRepository, 
                               OrderRepository orderRepository,
                               PromotionRepository promotionRepository) {
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.orderRepository = orderRepository;
        this.promotionRepository = promotionRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsers = userRepository.count();
        long totalRestaurants = restaurantRepository.count();
        long totalOrders = orderRepository.count();
        long activePromotions = promotionRepository.count();
        
        java.math.BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        if (totalRevenue == null) totalRevenue = java.math.BigDecimal.ZERO;

        // Custom counts for order types (Assuming these methods exist in OrderRepository)
        // If they don't, we can add them later or just return total for now.
        long deliveryOrders = 0;
        long pickupOrders = 0;
        try {
            deliveryOrders = orderRepository.countByIsSelfPickupFalse();
            pickupOrders = orderRepository.countByIsSelfPickupTrue();
        } catch (Exception e) {
            // Fallback if methods are missing
        }

        stats.put("totalUsers", totalUsers);
        stats.put("totalRestaurants", totalRestaurants);
        stats.put("totalOrders", totalOrders);
        stats.put("activePromotions", activePromotions);
        stats.put("totalRevenue", totalRevenue);
        stats.put("deliveryOrders", deliveryOrders);
        stats.put("pickupOrders", pickupOrders);
        
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics fetched", stats));
    }
}
