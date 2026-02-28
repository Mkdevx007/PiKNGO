package com.pikngo.user_service.controller;

import com.pikngo.user_service.dto.JwtResponse;
import com.pikngo.user_service.dto.OtpVerificationRequest;
import com.pikngo.user_service.dto.UserRegistrationRequest;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.service.AuthService;
import com.pikngo.user_service.service.UserService;
import com.pikngo.user_service.utils.JwtUtils;
import com.pikngo.user_service.exception.UserNotFoundException;
import com.pikngo.user_service.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthService authService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        User user = userService.registerUser(request);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    @PostMapping("/login/send-otp")
    public ResponseEntity<Void> sendOtp(@RequestParam String phoneNumber) {
        authService.sendOtp(phoneNumber);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login/verify-otp")
    public ResponseEntity<JwtResponse> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        // 1. Verify Token (Firebase or Local)
        boolean isValid = authService.verifyOtp(request);
        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. Check if user exists in database
        if (!userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new UserNotFoundException(
                    "User not registered with phone number: " + request.getPhoneNumber());
        }

        // 3. Generate JWT
        String token = jwtUtils.generateToken(request.getPhoneNumber());
        return ResponseEntity.ok(JwtResponse.builder()
                .token(token)
                .phoneNumber(request.getPhoneNumber())
                .build());
    }

    @PatchMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @Valid @RequestBody com.pikngo.user_service.dto.ProfileUpdateRequest request,
            java.security.Principal principal) {
        String phoneNumber = principal.getName();
        User updatedUser = userService.updateUserProfile(phoneNumber, request);
        return ResponseEntity.ok(updatedUser);
    }
}
