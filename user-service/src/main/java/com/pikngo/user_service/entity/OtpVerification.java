package com.pikngo.user_service.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "otp_verifications")
@EntityListeners(AuditingEntityListener.class)
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "_id")
    private UUID id;

    @Column(name = "phone_number", nullable = true, length = 15)
    private String phoneNumber;

    @Column(name = "email", nullable = true, length = 100)
    private String email;

    @Column(name = "otp_code", nullable = false, length = 6)
    private String otpCode;

    @Column(name = "expiry_time", nullable = false)
    private LocalDateTime expiryTime;

    @Column(name = "is_used")
    private boolean isUsed = false;

    @CreationTimestamp
    @Column(name = "created_ts", updatable = false)
    private LocalDateTime createdAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "last_modified_by")
    private String lastModifiedBy;

    public OtpVerification() {}

    public OtpVerification(UUID id, String phoneNumber, String email, String otpCode, LocalDateTime expiryTime, boolean isUsed, LocalDateTime createdAt, String createdBy, String lastModifiedBy) {
        this.id = id;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.otpCode = otpCode;
        this.expiryTime = expiryTime;
        this.isUsed = isUsed;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.lastModifiedBy = lastModifiedBy;
    }

    // Explicit manual builder to replace failing Lombok builder
    public static class OtpVerificationBuilder {
        private String phoneNumber;
        private String email;
        private String otpCode;
        private LocalDateTime expiryTime;
        private boolean isUsed;

        public OtpVerificationBuilder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public OtpVerificationBuilder email(String email) { this.email = email; return this; }
        public OtpVerificationBuilder otpCode(String otpCode) { this.otpCode = otpCode; return this; }
        public OtpVerificationBuilder expiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; return this; }
        public OtpVerificationBuilder isUsed(boolean isUsed) { this.isUsed = isUsed; return this; }

        public OtpVerification build() {
            OtpVerification otp = new OtpVerification();
            otp.setPhoneNumber(phoneNumber);
            otp.setEmail(email);
            otp.setOtpCode(otpCode);
            otp.setExpiryTime(expiryTime);
            otp.setUsed(isUsed);
            return otp;
        }
    }

    public static OtpVerificationBuilder builder() {
        return new OtpVerificationBuilder();
    }

    // Explicit Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
    public LocalDateTime getExpiryTime() { return expiryTime; }
    public void setExpiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; }
    public boolean isUsed() { return isUsed; }
    public void setUsed(boolean used) { isUsed = used; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
