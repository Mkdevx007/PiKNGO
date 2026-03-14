package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.dto.LoginRequest;
import com.pikngo.user_service.dto.OtpVerificationRequest;
import com.pikngo.user_service.entity.OtpVerification;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.repository.OtpVerificationRepository;
import com.pikngo.user_service.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OtpVerificationRepository otpRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private com.pikngo.user_service.service.SmsService smsService;

    @Mock
    private com.pikngo.user_service.service.EmailService emailService;

    @InjectMocks
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void loginWithPassword_ShouldReturnTrue_WhenCredentialsAreValid() {
        LoginRequest request = new LoginRequest();
        request.setIdentifier("1234567890");
        request.setPassword("password123");

        User user = new User();
        user.setPhoneNumber("1234567890");
        user.setUserPassword("encodedPassword");

        when(userRepository.findByPhoneNumber(any())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);

        boolean result = authService.loginWithPassword(request);

        assertTrue(result);
    }

    @Test
    void loginWithPassword_ShouldReturnFalse_WhenUserNotFound() {
        LoginRequest request = new LoginRequest();
        request.setIdentifier("9999999999");
        request.setPassword("any");

        when(userRepository.findByPhoneNumber(any())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());

        boolean result = authService.loginWithPassword(request);

        assertFalse(result);
    }

    @Test
    void verifyOtp_ShouldReturnTrue_WhenOtpIsValid() {
        OtpVerificationRequest request = new OtpVerificationRequest();
        request.setPhoneNumber("1234567890");
        request.setOtpCode("123456");

        OtpVerification otp = new OtpVerification();
        otp.setOtpCode("123456");
        otp.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        otp.setUsed(false);

        when(otpRepository.findTopByPhoneNumberAndOtpCodeAndIsUsedOrderByCreatedAtDesc(any(), any(), eq(false)))
                .thenReturn(Optional.of(otp));

        boolean result = authService.verifyOtp(request);

        assertTrue(result);
        assertTrue(otp.isUsed());
        verify(otpRepository, times(1)).save(otp);
    }

    @Test
    void verifyOtp_ShouldReturnFalse_WhenOtpExpired() {
        OtpVerificationRequest request = new OtpVerificationRequest();
        request.setPhoneNumber("1234567890");
        request.setOtpCode("123456");

        OtpVerification otp = new OtpVerification();
        otp.setOtpCode("123456");
        otp.setExpiryTime(LocalDateTime.now().minusMinutes(5));
        otp.setUsed(false);

        when(otpRepository.findTopByPhoneNumberAndOtpCodeAndIsUsedOrderByCreatedAtDesc(any(), any(), eq(false)))
                .thenReturn(Optional.of(otp));

        boolean result = authService.verifyOtp(request);

        assertFalse(result);
    }
}
