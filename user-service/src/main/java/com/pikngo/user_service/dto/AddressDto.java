package com.pikngo.user_service.dto;

import java.util.UUID;

public class AddressDto {
    private UUID id;
    private String type;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;
    private boolean isDefault;

    public AddressDto() {}

    public AddressDto(UUID id, String type, String addressLine1, String addressLine2, 
                      String city, String state, String pincode, boolean isDefault) {
        this.id = id;
        this.type = type;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.isDefault = isDefault;
    }

    public static class AddressDtoBuilder {
        private UUID id;
        private String type;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String pincode;
        private boolean isDefault;

        public AddressDtoBuilder id(UUID id) { this.id = id; return this; }
        public AddressDtoBuilder type(String type) { this.type = type; return this; }
        public AddressDtoBuilder addressLine1(String addressLine1) { this.addressLine1 = addressLine1; return this; }
        public AddressDtoBuilder addressLine2(String addressLine2) { this.addressLine2 = addressLine2; return this; }
        public AddressDtoBuilder city(String city) { this.city = city; return this; }
        public AddressDtoBuilder state(String state) { this.state = state; return this; }
        public AddressDtoBuilder pincode(String pincode) { this.pincode = pincode; return this; }
        public AddressDtoBuilder isDefault(boolean isDefault) { this.isDefault = isDefault; return this; }

        public AddressDto build() {
            return new AddressDto(id, type, addressLine1, addressLine2, city, state, pincode, isDefault);
        }
    }

    public static AddressDtoBuilder builder() {
        return new AddressDtoBuilder();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
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
    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean aDefault) { isDefault = aDefault; }
}
