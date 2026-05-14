package com.pikngo.user_service.controller;

import com.pikngo.user_service.dto.ApiResponse;
import com.pikngo.user_service.dto.DashboardStatsDTO;
import com.pikngo.user_service.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final com.pikngo.user_service.service.AiService aiService;

    public AnalyticsController(AnalyticsService analyticsService, com.pikngo.user_service.service.AiService aiService) {
        this.analyticsService = analyticsService;
        this.aiService = aiService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats() {
        DashboardStatsDTO stats = analyticsService.getDashboardStats();
        stats.setAiInsights(generateAiInsights(stats));
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics fetched", stats));
    }

    private List<DashboardStatsDTO.AIInsightDTO> generateAiInsights(DashboardStatsDTO stats) {
        List<DashboardStatsDTO.AIInsightDTO> insights;
        try {
            insights = aiService.getDashboardInsights(stats);
        } catch (Exception e) {
            insights = new java.util.ArrayList<>();
        }

        // Fallback to hardcoded insights if AI returns nothing or fails
        if (insights == null || insights.isEmpty()) {
            insights = new java.util.ArrayList<>();
            insights.add(new DashboardStatsDTO.AIInsightDTO("INFO", "AI Engine Active: Monitoring real-time order flow.", "cpu"));
            if (stats.getTotalOrders() > 0) {
                insights.add(new DashboardStatsDTO.AIInsightDTO("SUCCESS", "Platform Active: Receiving live orders.", "zap"));
            } else {
                insights.add(new DashboardStatsDTO.AIInsightDTO("INFO", "Awaiting Growth: Increase marketing to drive first orders.", "trending-up"));
            }
        }
        return insights;
    }
}
