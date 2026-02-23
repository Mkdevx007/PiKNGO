package com.pikngo.user_service.service;

import com.pikngo.user_service.dto.OtpRequest;
import com.pikngo.user_service.dto.OtpVerificationRequest;

public interface AuthService {
    void sendOtp(OtpRequest request);

    boolean verifyOtp(OtpVerificationRequest request);
}
