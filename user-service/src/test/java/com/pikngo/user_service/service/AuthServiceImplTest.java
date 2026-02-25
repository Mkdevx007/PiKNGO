package com.pikngo.user_service.service;

import com.pikngo.user_service.dto.OtpRequest;
import com.pikngo.user_service.dto.OtpVerificationRequest;
import com.pikngo.user_service.entity.OtpVerification;
import com.pikngo.user_service.repository.OtpVerificationRepository;
import com.pikngo.user_service.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private OtpVerificationRepository otpRepository;

    @InjectMocks
    private AuthServiceImpl authService;

    private static final String TEST_PHONE = "+1234567890";

    @BeforeEach
    void setUp() {
        // MockitoExtension handles initialization
    }

    @Test
    @DisplayName("Should send OTP and save to repository")
    void shouldSendOtpAndSaveToRepository() {
        // Given
        OtpRequest request = new OtpRequest();
        request.setPhoneNumber(TEST_PHONE);

        when(otpRepository.save(any(OtpVerification.class))).thenAnswer(invocation -> {
            OtpVerification otp = invocation.getArgument(0);
            otp.setId(java.util.UUID.randomUUID());
            return otp;
        });

        // When
        authService.sendOtp(request);

        // Then
        verify(otpRepository, times(1)).save(any(OtpVerification.class));
    }

    @Test
    @DisplayName("Should verify valid OTP successfully")
    void shouldVerifyValidOtpSuccessfully() {
        // Given
        String otpCode = "123456";
        OtpVerification otp = OtpVerification.builder()
                .phoneNumber(TEST_PHONE)
                .otpCode(otpCode)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .isUsed(false)
                .build();

        when(otpRepository.findTopByPhoneNumberAndIsUsedOrderByCreatedAtDesc(TEST_PHONE, false))
                .thenReturn(Optional.of(otp));
        when(otpRepository.save(any(OtpVerification.class))).thenReturn(otp);

        OtpVerificationRequest request = new OtpVerificationRequest();
        request.setPhoneNumber(TEST_PHONE);
        request.setOtpCode(otpCode);

        // When
        boolean result = authService.verifyOtp(request);

        // Then
        assertThat(result).isTrue();
        verify(otpRepository, times(1)).save(any(OtpVerification.class));
    }

    @Test
    @DisplayName("Should fail to verify with invalid OTP code")
    void shouldFailToVerifyWithInvalidOtpCode() {
        // Given
        OtpVerification otp = OtpVerification.builder()
                .phoneNumber(TEST_PHONE)
                .otpCode("123456")
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .isUsed(false)
                .build();

        when(otpRepository.findTopByPhoneNumberAndIsUsedOrderByCreatedAtDesc(TEST_PHONE, false))
                .thenReturn(Optional.of(otp));

        OtpVerificationRequest request = new OtpVerificationRequest();
        request.setPhoneNumber(TEST_PHONE);
        request.setOtpCode("999999"); // Wrong OTP

        // When
        boolean result = authService.verifyOtp(request);

        // Then
        assertThat(result).isFalse();
        verify(otpRepository, never()).save(any(OtpVerification.class));
    }

    @Test
    @DisplayName("Should fail to verify expired OTP")
    void shouldFailToVerifyExpiredOtp() {
        // Given
        OtpVerification expiredOtp = OtpVerification.builder()
                .phoneNumber(TEST_PHONE)
                .otpCode("123456")
                .expiryTime(LocalDateTime.now().minusMinutes(1)) // Expired
                .isUsed(false)
                .build();

        when(otpRepository.findTopByPhoneNumberAndIsUsedOrderByCreatedAtDesc(TEST_PHONE, false))
                .thenReturn(Optional.of(expiredOtp));

        OtpVerificationRequest request = new OtpVerificationRequest();
        request.setPhoneNumber(TEST_PHONE);
        request.setOtpCode("123456");

        // When
        boolean result = authService.verifyOtp(request);

        // Then
        assertThat(result).isFalse();
        verify(otpRepository, never()).save(any(OtpVerification.class));
    }

    @Test
    @DisplayName("Should fail to verify when no OTP exists")
    void shouldFailToVerifyWhenNoOtpExists() {
        // Given
        when(otpRepository.findTopByPhoneNumberAndIsUsedOrderByCreatedAtDesc(TEST_PHONE, false))
                .thenReturn(Optional.empty());

        OtpVerificationRequest request = new OtpVerificationRequest();
        request.setPhoneNumber(TEST_PHONE);
        request.setOtpCode("123456");

        // When
        boolean result = authService.verifyOtp(request);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should mark OTP as used after successful verification")
    void shouldMarkOtpAsUsedAfterSuccessfulVerification() {
        // Given
        String otpCode = "123456";
        OtpVerification otp = OtpVerification.builder()
                .phoneNumber(TEST_PHONE)
                .otpCode(otpCode)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .isUsed(false)
                .build();

        when(otpRepository.findTopByPhoneNumberAndIsUsedOrderByCreatedAtDesc(TEST_PHONE, false))
                .thenReturn(Optional.of(otp));
        when(otpRepository.save(any(OtpVerification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OtpVerificationRequest request = new OtpVerificationRequest();
        request.setPhoneNumber(TEST_PHONE);
        request.setOtpCode(otpCode);

        // When
        authService.verifyOtp(request);

        // Then
        assertThat(otp.isUsed()).isTrue();
    }
}
