package com.pikngo.user_service.dto;

import com.pikngo.user_service.entity.User;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class UserDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String profileImageUrl;
    private boolean isActive;
    private boolean isDeleted;
    private User.UserRole role;
    private LocalDateTime createdAt;
    private List<AddressDto> addresses;

    public UserDto() {}

    public UserDto(UUID id, String firstName, String lastName, String email, String phoneNumber, 
                   String profileImageUrl, boolean isActive, boolean isDeleted, User.UserRole role, 
                   LocalDateTime createdAt, List<AddressDto> addresses) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.profileImageUrl = profileImageUrl;
        this.isActive = isActive;
        this.isDeleted = isDeleted;
        this.role = role;
        this.createdAt = createdAt;
        this.addresses = addresses;
    }

    // Builder-like pattern for convenience since we're replacing @Builder
    public static class UserDtoBuilder {
        private UUID id;
        private String firstName;
        private String lastName;
        private String email;
        private String phoneNumber;
        private String profileImageUrl;
        private boolean isActive;
        private boolean isDeleted;
        private User.UserRole role;
        private LocalDateTime createdAt;
        private List<AddressDto> addresses;

        public UserDtoBuilder id(UUID id) { this.id = id; return this; }
        public UserDtoBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public UserDtoBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public UserDtoBuilder email(String email) { this.email = email; return this; }
        public UserDtoBuilder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public UserDtoBuilder profileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; return this; }
        public UserDtoBuilder isActive(boolean isActive) { this.isActive = isActive; return this; }
        public UserDtoBuilder isDeleted(boolean isDeleted) { this.isDeleted = isDeleted; return this; }
        public UserDtoBuilder role(User.UserRole role) { this.role = role; return this; }
        public UserDtoBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public UserDtoBuilder addresses(List<AddressDto> addresses) { this.addresses = addresses; return this; }

        public UserDto build() {
            return new UserDto(id, firstName, lastName, email, phoneNumber, profileImageUrl, isActive, isDeleted, role, createdAt, addresses);
        }
    }

    public static UserDtoBuilder builder() {
        return new UserDtoBuilder();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
    public User.UserRole getRole() { return role; }
    public void setRole(User.UserRole role) { this.role = role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<AddressDto> getAddresses() { return addresses; }
    public void setAddresses(List<AddressDto> addresses) { this.addresses = addresses; }
}
