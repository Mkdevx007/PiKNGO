package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.repository.OtpVerificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class OtpCleanupJob {

    private static final Logger log = LoggerFactory.getLogger(OtpCleanupJob.class);

    private final OtpVerificationRepository otpRepository;

    public OtpCleanupJob(OtpVerificationRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

    /**
     * Delete expired OTPs from the database every hour.
     * fixedRate is in milliseconds (3600000 ms = 1 hour).
     */
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanupExpiredOtps() {
        log.info("Starting scheduled cleanup for expired OTPs...");
        int deletedCount = otpRepository.deleteByExpiryTimeBefore(LocalDateTime.now());
        log.info("Cleanup finished. Deleted {} expired OTP records.", deletedCount);
    }
}
