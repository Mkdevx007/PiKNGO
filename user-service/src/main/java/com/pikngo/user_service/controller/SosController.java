package com.pikngo.user_service.controller;

import com.pikngo.user_service.dto.ApiResponse;
import com.pikngo.user_service.dto.SosRequestDTO;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sos")
public class SosController {

    private static final Logger log = LoggerFactory.getLogger(SosController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    public SosController(SimpMessagingTemplate messagingTemplate, UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
    }

    @PostMapping("/trigger")
    @PreAuthorize("hasRole('DELIVERY_RIDER')")
    public ResponseEntity<ApiResponse<String>> triggerSos(Principal principal, @RequestBody SosRequestDTO request) {
        log.warn("🚨 SOS TRIGGERED BY RIDER: {} at Coordinates: {}, {}", principal.getName(), request.getLatitude(), request.getLongitude());

        User rider = userRepository.findByPhoneNumber(principal.getName())
                .orElseThrow(() -> new RuntimeException("Rider not found"));

        // Create an alert payload
        Map<String, Object> sosAlert = new HashMap<>();
        sosAlert.put("riderId", rider.getId());
        sosAlert.put("riderName", rider.getFirstName() + " " + rider.getLastName());
        sosAlert.put("riderPhone", rider.getPhoneNumber());
        sosAlert.put("latitude", request.getLatitude());
        sosAlert.put("longitude", request.getLongitude());
        sosAlert.put("timestamp", LocalDateTime.now().toString());
        sosAlert.put("message", "EMERGENCY: Rider triggered SOS Alert!");

        // Broadcast to WebSocket topic for Admin/Support team
        messagingTemplate.convertAndSend("/topic/sos", sosAlert);

        // In a real production app, this is where you would integrate SMS API (Twilio) 
        // to send texts to emergency contacts and support team.

        return ResponseEntity.ok(ApiResponse.success("SOS Alert successfully transmitted to Support Team", "ALERT_SENT"));
    }
}
