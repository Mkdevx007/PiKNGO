package com.pikngo.user_service.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class PartnerAnalyticsDTO {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private double averageRating;
    private List<TopItemDTO> topItems;
    private Map<String, BigDecimal> dailyRevenue;

    public PartnerAnalyticsDTO() {}

    public PartnerAnalyticsDTO(BigDecimal totalRevenue, long totalOrders, double averageRating, 
                                List<TopItemDTO> topItems, Map<String, BigDecimal> dailyRevenue) {
        this.totalRevenue = totalRevenue;
        this.totalOrders = totalOrders;
        this.averageRating = averageRating;
        this.topItems = topItems;
        this.dailyRevenue = dailyRevenue;
    }

    public static class TopItemDTO {
        private String itemName;
        private long count;

        public TopItemDTO(String itemName, long count) {
            this.itemName = itemName;
            this.count = count;
        }

        public String getItemName() { return itemName; }
        public long getCount() { return count; }
    }

    // Getters and Setters
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
    public List<TopItemDTO> getTopItems() { return topItems; }
    public void setTopItems(List<TopItemDTO> topItems) { this.topItems = topItems; }
    public Map<String, BigDecimal> getDailyRevenue() { return dailyRevenue; }
    public void setDailyRevenue(Map<String, BigDecimal> dailyRevenue) { this.dailyRevenue = dailyRevenue; }
}
