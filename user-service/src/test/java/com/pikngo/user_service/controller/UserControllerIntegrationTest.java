package com.pikngo.user_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pikngo.user_service.dto.OtpVerificationRequest;
import com.pikngo.user_service.dto.UserRegistrationRequest;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.repository.UserRepository;
import com.pikngo.user_service.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String PHONE_NUMBER = "+1234567890";

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void testRegistrationAndLocalOtpFlow() throws Exception {
        // 1. Register User
        UserRegistrationRequest regRequest = new UserRegistrationRequest();
        regRequest.setFirstName("John");
        regRequest.setLastName("Doe");
        regRequest.setEmail("john.doe@example.com");
        regRequest.setPhoneNumber(PHONE_NUMBER);
        regRequest.setAddress("123 Main St");

        mockMvc.perform(post("/api/v1/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.phoneNumber").value(PHONE_NUMBER));

        // 2. Send OTP
        mockMvc.perform(post("/api/v1/users/login/send-otp")
                .param("phoneNumber", PHONE_NUMBER))
                .andExpect(status().isOk());

        // Note: In integration test, we can't easily get the OTP code from the
        // simulated log
        // But we can test the failure case or mock the service if needed.
        // For this test, we verify the endpoint exists and responds correctly.

        // 3. Verify OTP (Failure case with wrong code)
        OtpVerificationRequest verifyRequest = new OtpVerificationRequest();
        verifyRequest.setPhoneNumber(PHONE_NUMBER);
        verifyRequest.setOtpCode("000000");

        mockMvc.perform(post("/api/v1/users/login/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(verifyRequest)))
                .andExpect(status().isUnauthorized());
    }
}
