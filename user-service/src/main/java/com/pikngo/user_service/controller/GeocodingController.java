package com.pikngo.user_service.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class GeocodingController {

    private static final Logger log = LoggerFactory.getLogger(GeocodingController.class);

    private final RestTemplate restTemplate;

    public GeocodingController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Server-side geocoding to avoid browser CORS/rate-limit issues.
     * Returns { latitude, longitude } or {} if nothing found.
     */
    @GetMapping("/geocode")
    public Map<String, Double> geocode(@RequestParam("query") String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyMap();
        }

        try {
            String encoded = URLEncoder.encode(query.trim(), StandardCharsets.UTF_8);
            String url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encoded;

            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            // Nominatim requests a descriptive User-Agent; browsers cannot set it reliably.
            headers.set("User-Agent", "PikNGo/1.0 (contact: pikngo-support@example.com)");

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<NominatimResult[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    NominatimResult[].class
            );

            NominatimResult[] body = response.getBody();
            if (body == null || body.length == 0 || body[0] == null) {
                return Collections.emptyMap();
            }

            String lat = body[0].lat;
            String lon = body[0].lon;
            if (lat == null || lon == null) return Collections.emptyMap();

            Map<String, Double> result = new HashMap<>();
            result.put("latitude", Double.parseDouble(lat));
            result.put("longitude", Double.parseDouble(lon));
            return result;
        } catch (Exception e) {
            log.warn("Geocoding failed for query='{}': {}", query, e.getMessage());
            return Collections.emptyMap();
        }
    }

    private static class NominatimResult {
        public String lat;
        public String lon;
    }
}

