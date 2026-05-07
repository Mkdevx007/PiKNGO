package com.pikngo.user_service.service.impl;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.pikngo.user_service.dto.ChangePasswordRequest;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final OtpVerificationRepository otpRepository;
    private final UserRepository userRepository;
    private final SmsService smsService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    public AuthServiceImpl(OtpVerificationRepository otpRepository, UserRepository userRepository,
                           SmsService smsService, PasswordEncoder passwordEncoder,
                           PasswordResetTokenRepository tokenRepository, EmailService emailService) {
        this.otpRepository = otpRepository;
        this.userRepository = userRepository;
        this.smsService = smsService;
        this.passwordEncoder = passwordEncoder;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
    }

    @Override
    public boolean loginWithPassword(LoginRequest request) {
        String identifier = request.getIdentifier() != null ? request.getIdentifier() : 
                            (request.getPhoneNumber() != null ? request.getPhoneNumber() : request.getEmail());
        log.info("Attempting login for identifier: {}", identifier);
        return userRepository.findByPhoneNumber(identifier)
                .or(() -> {
                    log.info("Phone number not found, checking email for: {}", identifier);
                    return userRepository.findByEmail(identifier);
                })
                .map(user -> {
                    if (user.getUserPassword() == null) {
                        log.warn("User {} has no password set", identifier);
                        return false;
                    }
                    boolean matches = passwordEncoder.matches(request.getPassword(), user.getUserPassword());
                    if (!matches) {
                        log.warn("Password mismatch for user {}", identifier);
                    } else {
                        log.info("Login successful for user {}", identifier);
                    }
                    return matches;
                })
                .orElseGet(() -> {
                    log.warn("User not found for identifier: {}", identifier);
                    return false;
                });
    }

    @Override
    public boolean verifyOtp(OtpVerificationRequest request) {
        if (request.getFirebaseToken() != null && !request.getFirebaseToken().isBlank()) {
            return verifyFirebaseToken(request.getFirebaseToken(), request.getPhoneNumber());
        } else if (request.getPhoneNumber() != null) {
            return verifyLocalOtp(request.getPhoneNumber(), request.getOtpCode());
        } else {
            return verifyEmailOtp(request.getEmail(), request.getOtpCode());
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
        // --- Demo Bypass ---
        if ("555555".equals(code)) {
            log.info("Demo Bypass: Local OTP verified for {}", phoneNumber);
            return true;
        }

        return otpRepository.findTopByPhoneNumberAndOtpCodeAndIsUsedOrderByCreatedAtDesc(phoneNumber, code, false)
                .map(otp -> {
                    if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
                        log.warn("OTP expired for {}", phoneNumber);
                        return false;
                    }
                    otp.setUsed(true);
                    otpRepository.save(otp);
                    log.info("Local OTP verified successfully for {}", phoneNumber);
                    return true;
                }).orElseGet(() -> {
                    log.warn("No matching unused OTP found for {}", phoneNumber);
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
    @Transactional
    public void processForgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(
                        "No account found with this email"));

        tokenRepository.deleteByUser(user);
        tokenRepository.flush();

        // Standardize to 6-digit numeric OTP for better Elite UX
        String token = String.format("%06d", new Random().nextInt(999999));
        
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build();

        tokenRepository.save(resetToken);

        log.info("Password reset OTP generated for {}: {}", email, token);
        
        // Use the new professional HTML email template
        emailService.sendOtpEmail(email, token);
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        String upperToken = token.trim().toUpperCase();
        log.info("Attempting to reset password with token: {}", upperToken);
        
        PasswordResetToken resetToken = tokenRepository.findByToken(upperToken)
                .orElseThrow(() -> new com.pikngo.user_service.exception.TokenException("Invalid reset code. Please check your email and try again."));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new com.pikngo.user_service.exception.TokenException("Reset code has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setUserPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(resetToken);
        log.info("Password successfully reset for user: {}", user.getEmail());
    }

    @Override
    public void sendEmailOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        String otpCode = String.format("%06d", new Random().nextInt(999999));
        log.info("Generated Email OTP for {}: {}", email, otpCode);

        OtpVerification otp = OtpVerification.builder()
                .email(email)
                .phoneNumber(user.getPhoneNumber())
                .otpCode(otpCode)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .isUsed(false)
                .build();

        otpRepository.save(otp);
        System.out.println("DEBUG_OTP_EMAIL: " + email + " CODE: " + otpCode);
        emailService.sendOtpEmail(email, otpCode);
    }

    @Override
    public boolean verifyEmailOtp(String email, String otpCode) {
        // --- Demo Bypass ---
        if ("555555".equals(otpCode)) {
            log.info("Demo Bypass: Email OTP verified for {}", email);
            return true;
        }

        return otpRepository.findTopByEmailAndOtpCodeAndIsUsedOrderByCreatedAtDesc(email, otpCode, false)
                .map(otp -> {
                    if (otp.getExpiryTime().isBefore(LocalDateTime.now())) {
                        log.warn("Email OTP expired for {}", email);
                        return false;
                    }
                    otp.setUsed(true);
                    otpRepository.save(otp);
                    log.info("Email OTP verified successfully for {}", email);
                    return true;
                }).orElseGet(() -> {
                    log.warn("No matching unused Email OTP found for {}", email);
                    return false;
                });
    }

    @Override
    @Transactional
    public void changePassword(String phoneNumber, ChangePasswordRequest request) {
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new UserNotFoundException("User not found with phone: " + phoneNumber));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getUserPassword())) {
            throw new BadCredentialsException("Current password does not match");
        }

        user.setUserPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password successfully changed for user: {}", phoneNumber);
    }
}
