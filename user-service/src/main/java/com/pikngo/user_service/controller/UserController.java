package com.pikngo.user_service.controller;

import com.pikngo.user_service.dto.JwtResponse;
import com.pikngo.user_service.dto.LoginRequest;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final AuthService authService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<com.pikngo.user_service.dto.ApiResponse<User>> registerUser(
            @Valid @RequestBody UserRegistrationRequest request) {
        User user = userService.registerUser(request);
        return new ResponseEntity<>(
                com.pikngo.user_service.dto.ApiResponse.success("User registration successful", user),
                HttpStatus.CREATED);
    }

    @PostMapping("/login/password")
    public ResponseEntity<JwtResponse> loginWithPassword(@Valid @RequestBody LoginRequest request,
            jakarta.servlet.http.HttpServletResponse response) {
        boolean isValid = authService.loginWithPassword(request);
        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(JwtResponse.builder().token(null).phoneNumber("Invalid credentials").build());
        }

        String identifier = request.getIdentifier(); // Can be email or phone
        User user = userRepository.findByPhoneNumber(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Restore soft-deleted account on successful login
        if (user.isDeleted()) {
            user.setDeleted(false);
            user.setActive(true);
            userRepository.save(user);
        }

        String token = jwtUtils.generateToken(user.getPhoneNumber(), user.getRole().name());

        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production with HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(86400); // 1 day
        response.addCookie(cookie);

        return ResponseEntity.ok(JwtResponse.builder()
                .token("protected")
                .phoneNumber(user.getPhoneNumber())
                .userId(user.getId())
                .role(user.getRole().name())
                .build());
    }

    @PostMapping("/login/send-otp")
    public ResponseEntity<Void> sendOtp(@RequestParam String phoneNumber) {
        authService.sendOtp(phoneNumber);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login/send-email-otp")
    public ResponseEntity<Void> sendEmailOtp(@RequestParam String email) {
        authService.sendEmailOtp(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login/verify-otp")
    public ResponseEntity<JwtResponse> verifyOtp(@Valid @RequestBody OtpVerificationRequest request,
            jakarta.servlet.http.HttpServletResponse response) {
        // 1. Verify Token (Firebase or Local SMS or Email)
        boolean isValid = authService.verifyOtp(request);
        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. Check if user exists in database (using phone or email)
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

        // Restore soft-deleted account on successful login
        if (user.isDeleted()) {
            user.setDeleted(false);
            user.setActive(true);
            userRepository.save(user);
        }

        // 3. Generate JWT (using phone number as principal)
        String token = jwtUtils.generateToken(user.getPhoneNumber(), user.getRole().name());

        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production with HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(86400); // 1 day
        response.addCookie(cookie);

        return ResponseEntity.ok(JwtResponse.builder()
                .token("protected")
                .phoneNumber(user.getPhoneNumber())
                .userId(user.getId())
                .role(user.getRole().name())
                .build());
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(java.security.Principal principal) {
        User user = userService.getUserByPhoneNumber(principal.getName());
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @Valid @RequestBody com.pikngo.user_service.dto.ProfileUpdateRequest request,
            java.security.Principal principal) {
        String phoneNumber = principal.getName();
        User updatedUser = userService.updateUserProfile(phoneNumber, request);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteUser(@RequestParam(defaultValue = "true") boolean softDelete,
            java.security.Principal principal) {
        User user = userService.getUserByPhoneNumber(principal.getName());
        userService.deleteUser(user.getId(), softDelete);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/profile/photo")
    public ResponseEntity<?> uploadProfilePhoto(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            java.security.Principal principal) {
        try {
            if (principal == null) {
                log.error("Principal is null in photo upload!");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }
            log.info("Received photo upload request from user: {}", principal.getName());
            if (file == null || file.isEmpty()) {
                log.error("File is null or empty in photo upload!");
                return ResponseEntity.badRequest().body("File is empty");
            }
            log.info("File name: {}, size: {} bytes", file.getOriginalFilename(), file.getSize());
            
            userService.updateProfilePhoto(principal.getName(), file.getBytes());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Unhandled error in photo upload controller: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/profile/photo/{userId}")
    public ResponseEntity<byte[]> getProfilePhoto(@PathVariable java.util.UUID userId) {
        try {
            log.info("Fetching profile photo for user ID: {}", userId);
            byte[] photo = userService.getProfilePhoto(userId);
            if (photo == null || photo.length == 0) {
                log.warn("No profile photo found for user ID: {}", userId);
                return ResponseEntity.notFound().build();
            }
            log.info("Found photo of size: {} bytes", photo.length);
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.IMAGE_JPEG)
                    .body(photo);
        } catch (Exception e) {
            log.error("Error retrieving profile photo for user ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<com.pikngo.user_service.dto.ApiResponse<String>> forgotPassword(@RequestParam String email) {
        authService.processForgotPassword(email);
        return ResponseEntity.ok(com.pikngo.user_service.dto.ApiResponse.success("Reset link sent to " + email, null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<com.pikngo.user_service.dto.ApiResponse<String>> resetPassword(@RequestParam String token,
            @RequestParam String newPassword) {
        authService.resetPassword(token, newPassword);
        return ResponseEntity.ok(com.pikngo.user_service.dto.ApiResponse.success("Password successfully reset", null));
    }

    @GetMapping("/all")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(jakarta.servlet.http.HttpServletResponse response) {
        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }
}
