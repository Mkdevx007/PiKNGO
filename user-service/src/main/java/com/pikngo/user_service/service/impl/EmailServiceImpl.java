package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

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
        log.info("Preparing to send plain text email to {} from {}", to, fromEmail);
        if (mailSender == null) {
            log.warn("[SIMULATED EMAIL] To: {} | Subject: {} | Body: {}", to, subject, body);
            logToDebugFile(to, subject, body);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("SUCCESS: Plain text email sent to {}", to);
        } catch (Exception e) {
            log.error("FAILURE: Failed to send plain email. Fallback to debug log.");
            logToDebugFile(to, subject, body);
        }
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        log.info("Preparing to send HTML email to {} from {}", to, fromEmail);
        if (mailSender == null) {
            log.warn("[SIMULATED HTML EMAIL] To: {} | Subject: {}", to, subject);
            logToDebugFile(to, subject, "[HTML CONTENT]");
            return;
        }

        try {
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, "utf-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true indicates HTML

            mailSender.send(mimeMessage);
            log.info("SUCCESS: HTML email sent to {}", to);
        } catch (Exception e) {
            log.error("FAILURE: Failed to send HTML email. Error: {}", e.getMessage());
            logToDebugFile(to, subject, "[HTML FAILED: " + e.getMessage() + "]");
        }
    }

    @Override
    public void sendOtpEmail(String email, String otp) {
        String subject = "Your PikNGo Verification Code";
        
        // Mobile-optimized and more compact Elite template
        String htmlTemplate = 
            "<!DOCTYPE html><html><body style='margin:0;padding:0;background-color:#f8faff;font-family:\"Helvetica Neue\", Helvetica, Arial, sans-serif;'>" +
            "  <div style='max-width:500px;margin:20px auto;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.05);border:1px solid #e2e8f0;'>" +
            "    <div style='background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);padding:30px 20px;text-align:center;'>" +
            "      <h1 style='color:#ffffff;margin:0;font-size:24px;letter-spacing:-1px;font-weight:800;'>Pik<span style='color:#FF4D29;'>N</span>Go</h1>" +
            "      <p style='color:#94a3b8;margin:5px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;'>Elite Highway Dining</p>" +
            "    </div>" +
            "    <div style='padding:40px 25px;text-align:center;'>" +
            "      <h2 style='color:#0f172a;margin:0;font-size:22px;font-weight:800;'>Verification Code</h2>" +
            "      <p style='color:#64748b;margin:12px 0 30px;font-size:15px;line-height:1.5;'>Use the secure code below to complete your request.</p>" +
            "      <div style='background-color:#f8fafc;border-radius:12px;padding:20px 15px;display:inline-block;border:2px solid #f1f5f9;'>" +
            "        <span style='font-family:Monaco, monospace;font-size:38px;font-weight:800;letter-spacing:8px;color:#FF4D29;'>" + otp + "</span>" +
            "      </div>" +
            "      <p style='color:#94a3b8;margin:30px 0 0;font-size:13px;'>Code expires in <strong style='color:#0f172a;'>5 minutes</strong></p>" +
            "    </div>" +
            "    <div style='background-color:#f1f5f9;padding:25px;text-align:center;'>" +
            "      <p style='color:#94a3b8;margin:0;font-size:12px;line-height:1.4;'>If this wasn't you, please ignore this email.</p>" +
            "      <p style='color:#cbd5e1;margin:15px 0 0;font-size:11px;'>&copy; 2026 PikNGo Premium Dining</p>" +
            "    </div>" +
            "  </div>" +
            "</body></html>";

        sendHtmlEmail(email, subject, htmlTemplate);
    }

    private void logToDebugFile(String to, String subject, String body) {
        try (java.io.FileWriter writer = new java.io.FileWriter("OTP_DEBUG.txt", true)) {
            writer.write(String.format("[%s] EMAIL To: %s | Subject: %s | Body snippet: %s%n",
                    java.time.LocalDateTime.now(), to, subject, body.substring(0, Math.min(50, body.length()))));
        } catch (java.io.IOException ioe) {
            log.error("Failed to write to OTP_DEBUG.txt: {}", ioe.getMessage());
        }
    }
}
