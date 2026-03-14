package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.service.SmsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsServiceImpl implements SmsService {

    @Override
    public void sendSms(String phoneNumber, String message) {
        log.info("Preparing to send SMS to {}", phoneNumber);

        // In a real implementation, you would use Twilio, AWS SNS, etc.
        // For now, we simulate the SMS sending.
        log.info("[SIMULATED SMS] To: {} | Message: {}", phoneNumber, message);

        // DEBUG: Write to a file in the project root for easy access during development
        try (java.io.FileWriter writer = new java.io.FileWriter("../OTP_DEBUG.txt", true)) {
            writer.write(String.format("[%s] SMS To: %s | %s%n",
                    java.time.LocalDateTime.now(), phoneNumber, message));
        } catch (java.io.IOException e) {
            log.error("Failed to write to OTP_DEBUG.txt: {}", e.getMessage());
        }
    }
}
