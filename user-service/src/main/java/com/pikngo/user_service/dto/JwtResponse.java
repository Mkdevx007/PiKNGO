package com.pikngo.user_service.dto;

import java.util.UUID;

public class JwtResponse {
    private String token;
    private String phoneNumber;
    private UUID userId;
    private String role;

    public JwtResponse() {}

    public JwtResponse(String token, String phoneNumber, UUID userId, String role) {
        this.token = token;
        this.phoneNumber = phoneNumber;
        this.userId = userId;
        this.role = role;
    }

    public static class JwtResponseBuilder {
        private String token;
        private String phoneNumber;
        private UUID userId;
        private String role;

        public JwtResponseBuilder token(String token) { this.token = token; return this; }
        public JwtResponseBuilder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public JwtResponseBuilder userId(UUID userId) { this.userId = userId; return this; }
        public JwtResponseBuilder role(String role) { this.role = role; return this; }

        public JwtResponse build() {
            return new JwtResponse(token, phoneNumber, userId, role);
        }
    }

    public static JwtResponseBuilder builder() {
        return new JwtResponseBuilder();
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
