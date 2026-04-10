package com.pikngo.user_service.dto;

import jakarta.validation.constraints.Pattern;

public class OtpVerificationRequest {
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid phone number")
    private String phoneNumber;
    private String email;
    private String firebaseToken;
    private String otpCode;

    public OtpVerificationRequest() {}
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFirebaseToken() { return firebaseToken; }
    public void setFirebaseToken(String firebaseToken) { this.firebaseToken = firebaseToken; }
    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
}
