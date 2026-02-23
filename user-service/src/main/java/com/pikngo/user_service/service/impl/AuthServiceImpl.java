package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.dto.OtpRequest;
import com.pikngo.user_service.dto.OtpVerificationRequest;
import com.pikngo.user_service.entity.OtpVerification;
import com.pikngo.user_service.repository.OtpVerificationRepository;
import com.pikngo.user_service.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final OtpVerificationRepository otpRepository;

    @Override
    public void sendOtp(OtpRequest request) {
        String otp = String.format("%06d", new Random().nextInt(1000000));

        // In a real scenario, integrate an SMS Gateway here
        log.info("Sending OTP {} to phone number {}", otp, request.getPhoneNumber());

        OtpVerification otpVerification = OtpVerification.builder()
                .phoneNumber(request.getPhoneNumber())
                .otpCode(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5)) // OTP expires in 5 minutes
                .isUsed(false)
                .build();

        otpRepository.save(otpVerification);
    }

    @Override
    public boolean verifyOtp(OtpVerificationRequest request) {
        return otpRepository.findTopByPhoneNumberAndIsUsedOrderByCreatedAtDesc(request.getPhoneNumber(), false)
                .map(otp -> {
                    if (otp.getOtpCode().equals(request.getOtpCode()) &&
                            otp.getExpiryTime().isAfter(LocalDateTime.now())) {
                        otp.setUsed(true);
                        otpRepository.save(otp);
                        return true;
                    }
                    return false;
                })
                .orElse(false);
    }
}
