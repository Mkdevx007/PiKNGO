package com.pikngo.user_service.controller;

import com.pikngo.user_service.dto.JwtResponse;
import com.pikngo.user_service.dto.LoginRequest;
import com.pikngo.user_service.dto.OtpVerificationRequest;
import com.pikngo.user_service.dto.UserRegistrationRequest;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.service.AuthService;
import com.pikngo.user_service.service.UserService;
import com.pikngo.user_service.service.AddressService;
import com.pikngo.user_service.entity.Address;
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
    private final AddressService addressService;

    @PostMapping("/register")
    public ResponseEntity<com.pikngo.user_service.dto.ApiResponse<User>> registerUser(
            @Valid @RequestBody UserRegistrationRequest request) {
        User user = userService.registerUser(request);
        return new ResponseEntity<>(
                com.pikngo.user_service.dto.ApiResponse.success("User registration successful", user),
                HttpStatus.CREATED);
    }

    @PostMapping("/login/password")
    public ResponseEntity<JwtResponse> loginWithPassword(@Valid @RequestBody LoginRequest request) {
        boolean isValid = authService.loginWithPassword(request);
        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(JwtResponse.builder().token(null).phoneNumber("Invalid credentials").build());
        }

        String identifier = request.getIdentifier(); // Can be email or phone
        User user = userRepository.findByPhoneNumber(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        String token = jwtUtils.generateToken(user.getPhoneNumber());
        return ResponseEntity.ok(JwtResponse.builder()
                .token(token)
                .phoneNumber(user.getPhoneNumber())
                .userId(user.getId())
                .build());
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
        User user = userRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> new UserNotFoundException(
                        "User not registered with phone number: " + request.getPhoneNumber()));

        // 3. Generate JWT
        String token = jwtUtils.generateToken(request.getPhoneNumber());
        return ResponseEntity.ok(JwtResponse.builder()
                .token(token)
                .phoneNumber(request.getPhoneNumber())
                .userId(user.getId())
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

    // --- Address Management ---
    @GetMapping("/{userId}/addresses")
    public ResponseEntity<java.util.List<Address>> getAddresses(@PathVariable java.util.UUID userId) {
        return ResponseEntity.ok(addressService.getAddressesByUserId(userId));
    }

    @PostMapping("/{userId}/addresses")
    public ResponseEntity<Address> addAddress(@PathVariable java.util.UUID userId,
            @Valid @RequestBody Address address) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(addressService.addAddress(userId, address));
    }

    @PutMapping("/{userId}/addresses/{addressId}")
    public ResponseEntity<Address> updateAddress(@PathVariable java.util.UUID userId,
            @PathVariable java.util.UUID addressId,
            @Valid @RequestBody Address address) {
        return ResponseEntity.ok(addressService.updateAddress(userId, addressId, address));
    }

    @DeleteMapping("/{userId}/addresses/{addressId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable java.util.UUID userId,
            @PathVariable java.util.UUID addressId) {
        addressService.deleteAddress(userId, addressId);
        return ResponseEntity.noContent().build();
    }
}
