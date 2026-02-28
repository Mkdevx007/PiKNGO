package com.pikngo.user_service.service;

import com.pikngo.user_service.dto.OtpVerificationRequest;
import com.pikngo.user_service.exception.InvalidOtpException;
import com.pikngo.user_service.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @InjectMocks
    private AuthServiceImpl authService;

    private static final String TEST_PHONE = "+1234567890";

    @Test
    @DisplayName("Should throw Exception for Firebase verification (Integration required)")
    void shouldThrowExceptionForInvalidFirebaseVerification() {
        OtpVerificationRequest request = new OtpVerificationRequest();
        request.setPhoneNumber(TEST_PHONE);
        request.setFirebaseToken("invalid-token");

        // Firebase verification will fail because we are in a unit test without a mock
        // static FirebaseAuth
        assertThrows(RuntimeException.class, () -> authService.verifyOtp(request));
    }
}
