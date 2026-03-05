package com.pikngo.user_service.service;

import com.pikngo.user_service.dto.OtpVerificationRequest;
import com.pikngo.user_service.dto.LoginRequest;

public interface AuthService {
    boolean verifyOtp(OtpVerificationRequest request);

    void sendOtp(String phoneNumber);

    boolean verifyLocalOtp(String phoneNumber, String code);

    boolean loginWithPassword(LoginRequest request);
}
