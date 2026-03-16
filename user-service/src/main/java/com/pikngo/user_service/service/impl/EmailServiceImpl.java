package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    @jakarta.annotation.PostConstruct
    public void init() {
        if (mailSender == null) {
            log.warn("EmailServiceImpl initialized but JavaMailSender is NULL!");
        } else {
            log.info("EmailServiceImpl initialized with JavaMailSender. From: {}", fromEmail);
        }
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        log.info("Preparing to send email to {} from {}", to, fromEmail);

        if (mailSender == null) {
            log.error("CRITICAL: JavaMailSender is NULL. Check your pom.xml and application.properties configuration.");
            log.info("[SIMULATED EMAIL] To: {} | Subject: {} | Body: {}", to, subject, body);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            log.info("Attempting to send real email via SMTP...");
            mailSender.send(message);
            log.info("SUCCESS: Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("FAILURE: Failed to send email to {}. Error: {}", to, e.getMessage());
            e.printStackTrace(); // This will help see the full trace in console
            log.info("[SIMULATED EMAIL FALLBACK] To: {} | Subject: {} | Body: {}", to, subject, body);

            // DEBUG: Write to a file in the project root for easy access during development
            try (java.io.FileWriter writer = new java.io.FileWriter("../OTP_DEBUG.txt", true)) {
                writer.write(String.format("[%s] EMAIL To: %s | Subject: %s | %s%n",
                        java.time.LocalDateTime.now(), to, subject, body));
            } catch (java.io.IOException ioe) {
                log.error("Failed to write to OTP_DEBUG.txt: {}", ioe.getMessage());
            }
        }
    }

    @Override
    public void sendOtpEmail(String email, String otp) {
        String subject = "Your PikNGo Verification Code";
        String body = "Your verification code is: " + otp + "\n\nThis code will expire in 5 minutes.";
        sendEmail(email, subject, body);
    }
}
