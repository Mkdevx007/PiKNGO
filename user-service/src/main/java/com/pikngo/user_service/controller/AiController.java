package com.pikngo.user_service.controller;

import com.pikngo.user_service.dto.ApiResponse;
import com.pikngo.user_service.dto.DashboardStatsDTO;
import com.pikngo.user_service.service.AiService;
import com.pikngo.user_service.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/ai")
public class AiController {

    private final AiService aiService;
    private final AnalyticsService analyticsService;

    public AiController(AiService aiService, AnalyticsService analyticsService) {
        this.aiService = aiService;
        this.analyticsService = analyticsService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<String>> chatWithAi(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        if (prompt == null || prompt.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Prompt is required"));
        }

        DashboardStatsDTO context = analyticsService.getDashboardStats();
        String response = aiService.getAiResponse(prompt, context);
        
        return ResponseEntity.ok(ApiResponse.success("AI Thinking Complete", response));
    }

    @GetMapping("/test-connectivity")
    public ResponseEntity<ApiResponse<String>> testConnectivity() {
        String testResponse = aiService.getAiResponse("Hello, are you online?", new DashboardStatsDTO());
        if (testResponse.contains("Error") || testResponse.contains("failed")) {
            return ResponseEntity.status(500).body(ApiResponse.error("AI Connection Failed: " + testResponse));
        }
        return ResponseEntity.ok(ApiResponse.success("AI is Online!", testResponse));
    }
}
