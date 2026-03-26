package com.pikngo.user_service.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.pikngo.user_service.dto.JwtResponse;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.repository.UserRepository;
import com.pikngo.user_service.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class GoogleAuthController {

    @Value("${google.client.id}")
    private String googleClientId;

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    @PostMapping("/google")
    public ResponseEntity<?> authenticateGoogleUser(@RequestBody Map<String, String> payload, HttpServletResponse response) {
        String idTokenString = payload.get("idToken");
        
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                GoogleIdToken.Payload googlePayload = idToken.getPayload();
                String email = googlePayload.getEmail();
                String firstName = (String) googlePayload.get("given_name");
                String lastName = (String) googlePayload.get("family_name");

                log.info("Google login attempt for email: {}", email);

                User user = userRepository.findByEmail(email).orElseGet(() -> {
                    log.info("Creating new user for Google login: {}", email);
                    User newUser = User.builder()
                            .email(email)
                            .firstName(firstName)
                            .lastName(lastName)
                            .phoneNumber("G-" + email) // Placeholder phone for Google-only users
                            .isActive(true)
                            .build();
                    return userRepository.save(newUser);
                });

                String token = jwtUtils.generateToken(user.getPhoneNumber(), user.getRole().name());
                
                Cookie cookie = new Cookie("token", token);
                cookie.setHttpOnly(true);
                cookie.setSecure(false);
                cookie.setPath("/");
                cookie.setMaxAge(86400);
                response.addCookie(cookie);

                return ResponseEntity.ok(JwtResponse.builder()
                        .token("protected")
                        .phoneNumber(user.getPhoneNumber())
                        .userId(user.getId())
                        .role(user.getRole().name())
                        .build());
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid ID token.");
            }
        } catch (Exception e) {
            log.error("Google authentication failed: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Authentication failed.");
        }
    }
}
