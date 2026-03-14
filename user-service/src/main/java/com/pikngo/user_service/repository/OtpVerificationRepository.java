package com.pikngo.user_service.repository;

import com.pikngo.user_service.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {
    Optional<OtpVerification> findTopByPhoneNumberAndIsUsedOrderByCreatedAtDesc(String phoneNumber, boolean isUsed);

    Optional<OtpVerification> findTopByEmailAndIsUsedOrderByCreatedAtDesc(String email, boolean isUsed);

    Optional<OtpVerification> findTopByEmailAndOtpCodeAndIsUsedOrderByCreatedAtDesc(String email, String otpCode,
            boolean isUsed);

    Optional<OtpVerification> findTopByPhoneNumberAndOtpCodeAndIsUsedOrderByCreatedAtDesc(String phoneNumber,
            String otpCode, boolean isUsed);

    int deleteByExpiryTimeBefore(java.time.LocalDateTime expiryTime);
}
