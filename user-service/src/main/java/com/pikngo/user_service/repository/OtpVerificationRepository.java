package com.pikngo.user_service.repository;

import com.pikngo.user_service.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {
    Optional<OtpVerification> findTopByPhoneNumberAndIsUsedOrderByCreatedAtDesc(String phoneNumber, boolean isUsed);
}
