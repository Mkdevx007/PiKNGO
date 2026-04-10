package com.pikngo.user_service.service;

import com.pikngo.user_service.dto.ChangePasswordRequest;
import com.pikngo.user_service.dto.OtpVerificationRequest;
import com.pikngo.user_service.dto.LoginRequest;

public interface AuthService {
    boolean verifyOtp(OtpVerificationRequest request);

    void sendOtp(String phoneNumber);

    boolean verifyLocalOtp(String phoneNumber, String code);

    boolean loginWithPassword(LoginRequest request);

    void processForgotPassword(String email);

    void resetPassword(String token, String newPassword);

    void sendEmailOtp(String email);

    boolean verifyEmailOtp(String email, String otp);
    void changePassword(String phoneNumber, ChangePasswordRequest request);
}
