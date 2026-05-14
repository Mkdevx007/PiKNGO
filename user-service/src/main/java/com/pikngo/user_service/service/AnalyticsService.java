package com.pikngo.user_service.service;

import com.pikngo.user_service.dto.DashboardStatsDTO;
import com.pikngo.user_service.repository.OrderRepository;
import com.pikngo.user_service.repository.RestaurantRepository;
import com.pikngo.user_service.repository.UserRepository;
import com.pikngo.user_service.repository.PromotionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;
    private final PromotionRepository promotionRepository;

    public AnalyticsService(UserRepository userRepository, 
                            RestaurantRepository restaurantRepository, 
                            OrderRepository orderRepository,
                            PromotionRepository promotionRepository) {
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.orderRepository = orderRepository;
        this.promotionRepository = promotionRepository;
    }

    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        
        stats.setTotalUsers(userRepository.count());
        stats.setTotalRestaurants(restaurantRepository.count());
        stats.setTotalOrders(orderRepository.count());
        stats.setActivePromotions(promotionRepository.count());
        
        java.math.BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : java.math.BigDecimal.ZERO);

        try {
            stats.setDeliveryOrders(orderRepository.countByIsSelfPickupFalse());
            stats.setPickupOrders(orderRepository.countByIsSelfPickupTrue());
        } catch (Exception e) {}

        // Weekly Revenue
        try {
            List<Object[]> weeklyData = orderRepository.findWeeklyRevenue();
            java.util.List<DashboardStatsDTO.ChartDataDTO> weeklyRevenue = new java.util.ArrayList<>();
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("E");
            
            for (Object[] row : weeklyData) {
                if (row == null || row.length < 3) continue;
                
                java.time.LocalDate localDate = null;
                Object dateObj = row[0];
                
                if (dateObj instanceof java.sql.Date) {
                    localDate = ((java.sql.Date) dateObj).toLocalDate();
                } else if (dateObj instanceof java.sql.Timestamp) {
                    localDate = ((java.sql.Timestamp) dateObj).toLocalDateTime().toLocalDate();
                } else if (dateObj instanceof java.time.LocalDate) {
                    localDate = (java.time.LocalDate) dateObj;
                } else if (dateObj != null) {
                    // Fallback attempt
                    try {
                        localDate = java.time.LocalDate.parse(dateObj.toString());
                    } catch (Exception ex) {}
                }
                
                if (localDate == null) continue;

                java.math.BigDecimal revenue = (row[1] instanceof java.math.BigDecimal) ? (java.math.BigDecimal) row[1] : java.math.BigDecimal.ZERO;
                long count = (row[2] instanceof Number) ? ((Number) row[2]).longValue() : 0L;
                
                weeklyRevenue.add(new DashboardStatsDTO.ChartDataDTO(localDate.format(formatter), localDate.toString(), revenue, count));
            }
            stats.setWeeklyRevenue(weeklyRevenue);
        } catch (Exception e) {
            stats.setWeeklyRevenue(new java.util.ArrayList<>());
        }

        // Status Distribution
        try {
            List<Object[]> statusData = orderRepository.findOrderStatusCounts();
            java.util.Map<String, Long> distribution = new java.util.HashMap<>();
            for (Object[] row : statusData) {
                if (row != null && row.length >= 2) {
                    distribution.put(row[0].toString(), ((Number) row[1]).longValue());
                }
            }
            stats.setOrderStatusDistribution(distribution);
        } catch (Exception e) {
            stats.setOrderStatusDistribution(new java.util.HashMap<>());
        }

        // Top Restaurants
        try {
            List<Object[]> topResData = orderRepository.findTopRestaurantsByRevenue();
            java.util.List<java.util.Map<String, Object>> topRestaurants = new java.util.ArrayList<>();
            for (Object[] row : topResData) {
                if (row != null && row.length >= 2) {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("name", row[0]);
                    map.put("value", row[1]);
                    topRestaurants.add(map);
                }
            }
            stats.setTopRestaurants(topRestaurants);
        } catch (Exception e) {
            stats.setTopRestaurants(new java.util.ArrayList<>());
        }

        // Add a default insight to ensure it's never empty
        java.util.List<DashboardStatsDTO.AIInsightDTO> defaultInsights = new java.util.ArrayList<>();
        defaultInsights.add(new DashboardStatsDTO.AIInsightDTO("INFO", "System Initialized: AI Core is ready.", "cpu"));
        stats.setAiInsights(defaultInsights);

        return stats;
    }
}
