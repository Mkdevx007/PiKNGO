package com.pikngo.user_service.controller;

import com.pikngo.user_service.dto.ApiResponse;
import com.pikngo.user_service.dto.TrendingItemDTO;
import com.pikngo.user_service.entity.MenuItem;
import com.pikngo.user_service.entity.Order;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.repository.MenuItemRepository;
import com.pikngo.user_service.repository.OrderRepository;
import com.pikngo.user_service.repository.UserRepository;
import com.pikngo.user_service.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/ai/recommendations")
public class AiRecommendationController {

    private final AiService aiService;
    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;

    public AiRecommendationController(AiService aiService, OrderRepository orderRepository, 
                                    MenuItemRepository menuItemRepository, UserRepository userRepository) {
        this.aiService = aiService;
        this.orderRepository = orderRepository;
        this.menuItemRepository = menuItemRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<TrendingItemDTO>>> getRecommendations(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("User not authenticated"));
        }

        User user = userRepository.findByPhoneNumber(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Fetch User History (last 10 unique items)
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedTsDesc(user.getId());
        String history = orders.stream()
                .flatMap(o -> o.getItems().stream())
                .map(oi -> oi.getMenuItem().getItemName())
                .distinct()
                .limit(10)
                .collect(Collectors.joining(", "));

        if (history.isEmpty()) {
            history = "New user, no history yet. Suggest popular highway food.";
        }

        // 2. Fetch Available Items (limit to 50 for context window)
        List<MenuItem> allAvailable = menuItemRepository.findAll().stream()
                .filter(MenuItem::isAvailable)
                .limit(50)
                .collect(Collectors.toList());
        
        List<String> availableNames = allAvailable.stream()
                .map(mi -> mi.getId().toString() + ":" + mi.getItemName())
                .collect(Collectors.toList());

        // 3. Get AI Recommendations (UUIDs)
        List<UUID> recommendedIds = aiService.getFoodRecommendations(history, availableNames);

        // 4. Map back to DTOs
        List<TrendingItemDTO> results = menuItemRepository.findAllById(recommendedIds).stream()
                .map(mi -> new TrendingItemDTO(
                        mi.getId(),
                        mi.getItemName(),
                        mi.getItemCategory(),
                        mi.getItemPrice(),
                        mi.getItemImageUrl(),
                        mi.isVeg(),
                        mi.getRestaurant().getId(),
                        mi.getRestaurant().getRestaurantName(),
                        mi.getRestaurant().getRating(),
                        mi.getRestaurant().getDeliveryTime(),
                        0L // dummy count
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Neural Recommendations Dispatched", results));
    }
}
