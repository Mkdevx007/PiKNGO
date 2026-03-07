package com.pikngo.user_service.service.impl;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.pikngo.user_service.dto.LoginRequest;
import com.pikngo.user_service.dto.OtpVerificationRequest;
import com.pikngo.user_service.entity.OtpVerification;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.entity.PasswordResetToken;
import com.pikngo.user_service.exception.InvalidOtpException;
import com.pikngo.user_service.exception.UserNotFoundException;
import com.pikngo.user_service.repository.OtpVerificationRepository;
import com.pikngo.user_service.repository.UserRepository;
import com.pikngo.user_service.repository.PasswordResetTokenRepository;
import com.pikngo.user_service.service.AuthService;
import com.pikngo.user_service.service.EmailService;
import com.pikngo.user_service.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final OtpVerificationRepository otpRepository;
    private final UserRepository userRepository;
    private final SmsService smsService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    @Override
    public boolean loginWithPassword(LoginRequest request) {
        log.info("Attempting login for identifier: {}", request.getIdentifier());
        return userRepository.findByPhoneNumber(request.getIdentifier())
                .or(() -> {
                    log.info("Phone number not found, checking email for: {}", request.getIdentifier());
                    return userRepository.findByEmail(request.getIdentifier());
                })
                .map(user -> {
                    if (user.getUserPassword() == null) {
                        log.warn("User {} has no password set", user.getPhoneNumber());
                        return false;
                    }
                    boolean matches = passwordEncoder.matches(request.getPassword(), user.getUserPassword());
                    if (!matches) {
                        log.warn("Password mismatch for user {}", user.getPhoneNumber());
                    } else {
                        log.info("Login successful for user {}", user.getPhoneNumber());
                    }
                    return matches;
                })
                .orElseGet(() -> {
                    log.warn("User not found for identifier: {}", request.getIdentifier());
                    return false;
                });
    }

    @Override
    public boolean verifyOtp(OtpVerificationRequest request) {
        if (request.getFirebaseToken() != null && !request.getFirebaseToken().isBlank()) {
            return verifyFirebaseToken(request.getFirebaseToken(), request.getPhoneNumber());
        } else {
            return verifyLocalOtp(request.getPhoneNumber(), request.getOtpCode());
        }
    }

    @Override
    public void sendOtp(String phoneNumber) {
        String otpCode = String.format("%06d", new Random().nextInt(999999));
        log.info("Generated OTP for {}: {}", phoneNumber, otpCode);

        OtpVerification otp = OtpVerification.builder()
                .phoneNumber(phoneNumber)
                .otpCode(otpCode)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .isUsed(false)
                .build();

        otpRepository.save(otp);
        smsService.sendSms(phoneNumber, "Your PikNGo verification code is: " + otpCode);
    }

    @Override
    public boolean verifyLocalOtp(String phoneNumber, String code) {
        return otpRepository.findTopByPhoneNumberAndIsUsedOrderByCreatedAtDesc(phoneNumber, false)
                .map(otp -> {
                    if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
                        log.warn("OTP expired for {}", phoneNumber);
                        return false;
                    }
                    if (otp.getOtpCode().equals(code)) {
                        otp.setUsed(true);
                        otpRepository.save(otp);
                        log.info("Local OTP verified successfully for {}", phoneNumber);
                        return true;
                    }
                    log.warn("Invalid OTP code for {}", phoneNumber);
                    return false;
                }).orElseGet(() -> {
                    log.warn("No unused OTP found for {}", phoneNumber);
                    return false;
                });
    }

    private boolean verifyFirebaseToken(String idToken, String phoneNumber) {
        try {
            log.info("Verifying Firebase Token for phone: {}", phoneNumber);
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String firebasePhone = (String) decodedToken.getClaims().get("phone_number");

            log.info("Firebase Token decoded. Phone in token: {}", firebasePhone);

            if (firebasePhone != null && firebasePhone.replace("+", "").contains(phoneNumber.replace("+", ""))) {
                log.info("Firebase verification successful for {}", phoneNumber);
                return true;
            }
            log.warn("Phone mismatch! Provided: {}, Token: {}", phoneNumber, firebasePhone);
            throw new InvalidOtpException("Firebase token does not match phone number");
        } catch (Exception e) {
            log.error("Firebase token verification failed for {}: {}", phoneNumber, e.getMessage());
            throw new InvalidOtpException("Invalid Firebase token: " + e.getMessage());
        }
    }

    @Override
    public void processForgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(
                        "No account found with this email"));

        // Delete existing token if any
        tokenRepository.findByUser(user).ifPresent(tokenRepository::delete);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken
                .builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build();

        tokenRepository.save(resetToken);

        log.info("Password reset token generated for {}: {}", email, token);
        emailService.sendEmail(email, "Password Reset", "Your reset token is: " + token);
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("Token has expired");
        }

        User user = resetToken.getUser();
        user.setUserPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(resetToken);
        log.info("Password successfully reset for user: {}", user.getEmail());
    }
}
