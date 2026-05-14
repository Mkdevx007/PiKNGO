package com.pikngo.user_service.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardStatsDTO {
    private long totalUsers;
    private long totalRestaurants;
    private long totalOrders;
    private long activePromotions;
    private BigDecimal totalRevenue;
    private long deliveryOrders;
    private long pickupOrders;
    private List<ChartDataDTO> weeklyRevenue;
    private Map<String, Long> orderStatusDistribution;
    private List<Map<String, Object>> topRestaurants;
    private List<AIInsightDTO> aiInsights;

    public DashboardStatsDTO() {}

    public static class ChartDataDTO {
        private String name;
        private String date;
        private BigDecimal revenue;
        private long orders;

        public ChartDataDTO(String name, String date, BigDecimal revenue, long orders) {
            this.name = name;
            this.date = date;
            this.revenue = revenue;
            this.orders = orders;
        }

        public String getName() { return name; }
        public String getDate() { return date; }
        public BigDecimal getRevenue() { return revenue; }
        public long getOrders() { return orders; }
    }

    public static class AIInsightDTO {
        private String type; // SUCCESS, WARNING, INFO
        private String message;
        private String icon; // zap, trending-up, alert-circle

        public AIInsightDTO(String type, String message, String icon) {
            this.type = type;
            this.message = message;
            this.icon = icon;
        }

        public String getType() { return type; }
        public String getMessage() { return message; }
        public String getIcon() { return icon; }
    }

    // Getters and Setters
    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getTotalRestaurants() { return totalRestaurants; }
    public void setTotalRestaurants(long totalRestaurants) { this.totalRestaurants = totalRestaurants; }
    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
    public long getActivePromotions() { return activePromotions; }
    public void setActivePromotions(long activePromotions) { this.activePromotions = activePromotions; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public long getDeliveryOrders() { return deliveryOrders; }
    public void setDeliveryOrders(long deliveryOrders) { this.deliveryOrders = deliveryOrders; }
    public long getPickupOrders() { return pickupOrders; }
    public void setPickupOrders(long pickupOrders) { this.pickupOrders = pickupOrders; }
    public List<ChartDataDTO> getWeeklyRevenue() { return weeklyRevenue; }
    public void setWeeklyRevenue(List<ChartDataDTO> weeklyRevenue) { this.weeklyRevenue = weeklyRevenue; }
    public Map<String, Long> getOrderStatusDistribution() { return orderStatusDistribution; }
    public void setOrderStatusDistribution(Map<String, Long> orderStatusDistribution) { this.orderStatusDistribution = orderStatusDistribution; }
    public List<Map<String, Object>> getTopRestaurants() { return topRestaurants; }
    public void setTopRestaurants(List<Map<String, Object>> topRestaurants) { this.topRestaurants = topRestaurants; }
    public List<AIInsightDTO> getAiInsights() { return aiInsights; }
    public void setAiInsights(List<AIInsightDTO> aiInsights) { this.aiInsights = aiInsights; }
}
