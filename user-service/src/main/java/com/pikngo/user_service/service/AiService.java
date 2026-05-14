package com.pikngo.user_service.service;

import com.pikngo.user_service.dto.DashboardStatsDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@Service
public class AiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    public AiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String getAiResponse(String userPrompt, DashboardStatsDTO context) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "AI Error: Gemini API Key is missing. Please add GEMINI_API_KEY to your environment.";
        }

        String systemContext = buildSystemContext(context);
        String fullPrompt = systemContext + "\n\nAdmin Question: " + userPrompt + "\n\nPlease provide a concise, strategic response as the PikNGo AI Brain.";

        return callGemini(fullPrompt);
    }

    private String buildSystemContext(DashboardStatsDTO stats) {
        return "You are the 'PikNGo AI Brain', an elite business strategist for the PikNGo food delivery platform.\n" +
               "Current Platform Statistics:\n" +
               "- Total Users: " + stats.getTotalUsers() + "\n" +
               "- Total Restaurants: " + stats.getTotalRestaurants() + "\n" +
               "- Total Orders: " + stats.getTotalOrders() + "\n" +
               "- Total Revenue: ₹" + stats.getTotalRevenue() + "\n" +
               "- Delivery vs Pickup: " + stats.getDeliveryOrders() + " delivery, " + stats.getPickupOrders() + " pickup.\n" +
               "- Order Status Breakdown: " + stats.getOrderStatusDistribution().toString() + "\n" +
               "Use this data to answer the admin's questions with professional business advice.";
    }

    public List<DashboardStatsDTO.AIInsightDTO> getDashboardInsights(DashboardStatsDTO stats) {
        if (apiKey == null || apiKey.isEmpty()) {
            return Collections.emptyList();
        }

        String prompt = "You are the 'PikNGo AI Brain'. Analyze these real-time stats and provide 3-4 concise, elite business insights.\n" +
                "Stats: " + stats.getTotalOrders() + " orders, ₹" + stats.getTotalRevenue() + " revenue, " +
                stats.getTotalUsers() + " users, " + stats.getTotalRestaurants() + " partners.\n" +
                "Return the response in this exact format: TYPE|MESSAGE|ICON\n" +
                "TYPE can be SUCCESS, WARNING, or INFO.\n" +
                "ICON can be zap, trending-up, award, truck, alert-triangle, or cpu.\n" +
                "Example: SUCCESS|Revenue is up 15% this week!|zap\n" +
                "Only return the raw lines, no other text.";

        String response = callGemini(prompt);
        List<DashboardStatsDTO.AIInsightDTO> insights = new ArrayList<>();
        
        if (response != null && !response.contains("AI Error")) {
            String[] lines = response.split("\n");
            for (String line : lines) {
                String[] parts = line.split("\\|");
                if (parts.length >= 3) {
                    insights.add(new DashboardStatsDTO.AIInsightDTO(parts[0].trim(), parts[1].trim(), parts[2].trim()));
                }
            }
        }
        
        return insights;
    }

    private String callGemini(String prompt) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contents = new HashMap<>();
            contents.put("parts", Collections.singletonList(Collections.singletonMap("text", prompt)));
            requestBody.put("contents", Collections.singletonList(contents));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(GEMINI_URL + apiKey, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List candidates = (List) response.getBody().get("candidates");
                if (!candidates.isEmpty()) {
                    Map firstCandidate = (Map) candidates.get(0);
                    Map content = (Map) firstCandidate.get("content");
                    List parts = (List) content.get("parts");
                    return (String) ((Map) parts.get(0)).get("text");
                }
            }
            return "AI failed to respond. Please check API status.";
        } catch (Exception e) {
            return "AI Connection Error: " + e.getMessage();
        }
    }
}
