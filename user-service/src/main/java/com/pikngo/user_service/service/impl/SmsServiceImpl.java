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
    }
}
