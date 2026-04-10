package com.pikngo.user_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ProfileUpdateRequest {
    @NotBlank(message = "First name is required")
    private String firstName;
    @NotBlank(message = "Last name is required")
    private String lastName;
    @Email(message = "Invalid email format")
    private String email;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;

    public ProfileUpdateRequest() {}

    public ProfileUpdateRequest(String firstName, String lastName, String email, String addressLine1, String addressLine2, String city, String state, String pincode) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
    }

    public static class ProfileUpdateRequestBuilder {
        private String firstName;
        private String lastName;
        private String email;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String pincode;

        public ProfileUpdateRequestBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public ProfileUpdateRequestBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public ProfileUpdateRequestBuilder email(String email) { this.email = email; return this; }
        public ProfileUpdateRequestBuilder addressLine1(String addressLine1) { this.addressLine1 = addressLine1; return this; }
        public ProfileUpdateRequestBuilder addressLine2(String addressLine2) { this.addressLine2 = addressLine2; return this; }
        public ProfileUpdateRequestBuilder city(String city) { this.city = city; return this; }
        public ProfileUpdateRequestBuilder state(String state) { this.state = state; return this; }
        public ProfileUpdateRequestBuilder pincode(String pincode) { this.pincode = pincode; return this; }

        public ProfileUpdateRequest build() {
            return new ProfileUpdateRequest(firstName, lastName, email, addressLine1, addressLine2, city, state, pincode);
        }
    }

    public static ProfileUpdateRequestBuilder builder() {
        return new ProfileUpdateRequestBuilder();
    }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }
    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
}
