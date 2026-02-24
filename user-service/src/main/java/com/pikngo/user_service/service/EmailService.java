package com.pikngo.user_service.service;

/**
 * Developer 2: External Integrations
 * TODO: Define methods for sending emails (e.g., welcome email, password
 * reset).
 */
public interface EmailService {
    void sendEmail(String to, String subject, String body);
}
