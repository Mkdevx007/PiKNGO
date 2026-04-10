package com.pikngo.user_service.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
public class User {
    
    public enum UserRole {
        USER, ADMIN, OWNER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "_id")
    private UUID id;

    @NotBlank(message = "First name is required")
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Email(message = "Invalid email format")
    @Column(unique = true, length = 100)
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid phone number")
    @Column(name = "phone_number", unique = true, nullable = false, length = 15)
    private String phoneNumber;

    @Column(name = "user_password")
    private String userPassword;

    @Column(name = "address_line_1")
    private String addressLine1;

    @Column(name = "address_line_2")
    private String addressLine2;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "pincode")
    private String pincode;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "profile_photo", columnDefinition = "bytea")
    private byte[] profilePhoto;

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private UserRole role = UserRole.USER;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Address> addresses;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Order> orders;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private PasswordResetToken passwordResetToken;

    @CreationTimestamp
    @Column(name = "created_ts", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "modified_ts")
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "last_modified_by")
    private String lastModifiedBy;

    public User() {}

    // Manual Builder to replace failing Lombok builder
    public static class UserBuilder {
        private UUID id;
        private String firstName;
        private String lastName;
        private String email;
        private String phoneNumber;
        private String userPassword;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String pincode;
        private String profileImageUrl;
        private boolean isActive = true;
        private boolean isDeleted = false;
        private UserRole role = UserRole.USER;

        public UserBuilder id(UUID id) { this.id = id; return this; }
        public UserBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public UserBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public UserBuilder userPassword(String userPassword) { this.userPassword = userPassword; return this; }
        public UserBuilder addressLine1(String addressLine1) { this.addressLine1 = addressLine1; return this; }
        public UserBuilder addressLine2(String addressLine2) { this.addressLine2 = addressLine2; return this; }
        public UserBuilder city(String city) { this.city = city; return this; }
        public UserBuilder state(String state) { this.state = state; return this; }
        public UserBuilder pincode(String pincode) { this.pincode = pincode; return this; }
        public UserBuilder profileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; return this; }
        public UserBuilder isActive(boolean isActive) { this.isActive = isActive; return this; }
        public UserBuilder isDeleted(boolean isDeleted) { this.isDeleted = isDeleted; return this; }
        public UserBuilder role(UserRole role) { this.role = role; return this; }

        public User build() {
            User user = new User();
            user.setId(id);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setPhoneNumber(phoneNumber);
            user.setUserPassword(userPassword);
            user.setAddressLine1(addressLine1);
            user.setAddressLine2(addressLine2);
            user.setCity(city);
            user.setState(state);
            user.setPincode(pincode);
            user.setProfileImageUrl(profileImageUrl);
            user.setActive(isActive);
            user.setDeleted(isDeleted);
            user.setRole(role);
            return user;
        }
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    // Explicit Getters and Setters
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
    public String getUserPassword() { return userPassword; }
    public void setUserPassword(String userPassword) { this.userPassword = userPassword; }
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
    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    public byte[] getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(byte[] profilePhoto) { this.profilePhoto = profilePhoto; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public List<Address> getAddresses() { return addresses; }
    public void setAddresses(List<Address> addresses) { this.addresses = addresses; }
    public List<Order> getOrders() { return orders; }
    public void setOrders(List<Order> orders) { this.orders = orders; }
    public PasswordResetToken getPasswordResetToken() { return passwordResetToken; }
    public void setPasswordResetToken(PasswordResetToken passwordResetToken) { this.passwordResetToken = passwordResetToken; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
