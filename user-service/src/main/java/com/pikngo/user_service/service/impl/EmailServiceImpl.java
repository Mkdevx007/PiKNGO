package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public void sendEmail(String to, String subject, String body) {
        log.info("Preparing to send email to {}", to);

        if (mailSender == null) {
            log.warn("JavaMailSender is NOT configured. Simulation mode active.");
            log.info("[SIMULATED EMAIL] To: {} | Subject: {} | Body: {}", to, subject, body);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            log.info("[SIMULATED EMAIL] To: {} | Subject: {} | Body: {}", to, subject, body);
        }
    }
}
