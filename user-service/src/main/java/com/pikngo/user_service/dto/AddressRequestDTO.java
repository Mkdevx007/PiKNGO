package com.pikngo.user_service.dto;

import jakarta.validation.constraints.NotBlank;

public class AddressRequestDTO {
    private String type;
    @NotBlank(message = "Address line 1 is required")
    private String addressLine1;
    private String addressLine2;
    @NotBlank(message = "City is required")
    private String city;
    @NotBlank(message = "State is required")
    private String state;
    @NotBlank(message = "Pincode is required")
    private String pincode;

    public AddressRequestDTO() {}
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
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
