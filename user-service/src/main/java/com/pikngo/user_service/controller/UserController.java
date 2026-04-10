package com.pikngo.user_service.controller;

import com.pikngo.user_service.dto.JwtResponse;
import com.pikngo.user_service.dto.LoginRequest;
import com.pikngo.user_service.dto.OtpVerificationRequest;
import com.pikngo.user_service.dto.UserRegistrationRequest;
import com.pikngo.user_service.dto.ApiResponse;
import com.pikngo.user_service.dto.ProfileUpdateRequest;
import com.pikngo.user_service.dto.UserDto;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.service.AuthService;
import com.pikngo.user_service.service.UserService;
import com.pikngo.user_service.utils.JwtUtils;
import com.pikngo.user_service.exception.UserNotFoundException;
import com.pikngo.user_service.repository.UserRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final AuthService authService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    public UserController(UserService userService, AuthService authService, JwtUtils jwtUtils, UserRepository userRepository) {
        this.userService = userService;
        this.authService = authService;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> registerUser(
            @Valid @RequestBody UserRegistrationRequest request) {
        User user = userService.registerUser(request);
        return new ResponseEntity<>(
                ApiResponse.success("User registration successful", user),
                HttpStatus.CREATED);
    }

    @PostMapping("/login/password")
    public ResponseEntity<ApiResponse<JwtResponse>> loginWithPassword(@Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        boolean isValid = authService.loginWithPassword(request);
        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid credentials"));
        }

        String identifier = request.getIdentifier() != null ? request.getIdentifier() : 
                            (request.getPhoneNumber() != null ? request.getPhoneNumber() : request.getEmail());
        User user = userRepository.findByPhoneNumber(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (user.isDeleted()) {
            user.setDeleted(false);
            user.setActive(true);
            userRepository.save(user);
        }

        String token = jwtUtils.generateToken(user.getPhoneNumber(), user.getRole().name());

        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(86400); 
        response.addCookie(cookie);

        JwtResponse jwtResponse = new JwtResponse("protected", user.getPhoneNumber(), user.getId(), user.getRole().name());
        return ResponseEntity.ok(ApiResponse.success("Login successful", jwtResponse));
    }

    @PostMapping("/login/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@RequestParam String phoneNumber) {
        authService.sendOtp(phoneNumber);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to " + phoneNumber, null));
    }

    @PostMapping("/login/send-email-otp")
    public ResponseEntity<ApiResponse<Void>> sendEmailOtp(@RequestParam String email) {
        authService.sendEmailOtp(email);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to " + email, null));
    }

    @PostMapping("/login/verify-otp")
    public ResponseEntity<ApiResponse<JwtResponse>> verifyOtp(@Valid @RequestBody OtpVerificationRequest request,
            HttpServletResponse response) {
        boolean isValid = authService.verifyOtp(request);
        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Invalid OTP"));
        }

        User user;
        if (request.getPhoneNumber() != null) {
            user = userRepository.findByPhoneNumber(request.getPhoneNumber())
                    .orElseThrow(() -> new UserNotFoundException(
                            "User not registered with phone number: " + request.getPhoneNumber()));
        } else {
            user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UserNotFoundException(
                            "User not registered with email: " + request.getEmail()));
        }

        if (user.isDeleted()) {
            user.setDeleted(false);
            user.setActive(true);
            userRepository.save(user);
        }

        String token = jwtUtils.generateToken(user.getPhoneNumber(), user.getRole().name());

        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(86400);
        response.addCookie(cookie);

        JwtResponse jwtResponse = new JwtResponse("protected", user.getPhoneNumber(), user.getId(), user.getRole().name());
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", jwtResponse));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getProfile(Principal principal) {
        User user = userService.getUserByPhoneNumber(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", user));
    }

    @PatchMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            Principal principal) {
        String phoneNumber = principal.getName();
        User updatedUser = userService.updateUserProfile(phoneNumber, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedUser));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@RequestParam(defaultValue = "true") boolean softDelete,
            Principal principal) {
        User user = userService.getUserByPhoneNumber(principal.getName());
        userService.deleteUser(user.getId(), softDelete);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @PostMapping("/profile/photo")
    public ResponseEntity<ApiResponse<String>> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User not authenticated"));
            }
            userService.updateProfilePhoto(principal.getName(), file.getBytes());
            return ResponseEntity.ok(ApiResponse.success("Photo uploaded successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/profile/photo/{userId}")
    public ResponseEntity<byte[]> getProfilePhoto(@PathVariable UUID userId) {
        try {
            byte[] photo = userService.getProfilePhoto(userId);
            if (photo == null || photo.length == 0) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.IMAGE_JPEG)
                    .body(photo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestParam String email) {
        authService.processForgotPassword(email);
        return ResponseEntity.ok(ApiResponse.success("Reset link sent to " + email, null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestParam String token,
            @RequestParam String newPassword) {
        authService.resetPassword(token, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password successfully reset", null));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Admin request for all users. Page: {}, Size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success("All users fetched successfully", userService.getAllUsers(pageable)));
    }

    @PatchMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @PathVariable UUID userId,
            @RequestParam boolean active) {
        log.info("Admin request to update user {} status to {}", userId, active);
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", userService.updateUserStatus(userId, active)));
    }

    @PatchMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> updateUserRole(
            @PathVariable UUID userId,
            @RequestParam String role) {
        log.info("Admin request to update user {} role to {}", userId, role);
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", userService.updateUserRole(userId, role)));
    }

    @DeleteMapping("/admin/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUserByAdmin(@PathVariable UUID userId) {
        log.warn("Admin request to PERMANENTLY delete user {}", userId);
        userService.deleteUser(userId, false); // Hard delete
        return ResponseEntity.ok(ApiResponse.success("User permanently deleted", null));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }
}
