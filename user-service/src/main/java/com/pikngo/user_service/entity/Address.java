package com.pikngo.user_service.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "addresses")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "_id")
    private UUID id;

    @Column(name = "type")
    private String type;

    @Column(name = "address_line_1", nullable = false)
    private String addressLine1;

    @Column(name = "address_line_2")
    private String addressLine2;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "state", nullable = false)
    private String state;

    @Column(name = "pincode", nullable = false)
    private String pincode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
	private User user;

    @CreationTimestamp
    @Column(name = "created_ts", updatable = false)
    private LocalDateTime createdTs;

    @UpdateTimestamp
    @Column(name = "modified_ts")
    private LocalDateTime modifiedTs;

    @Column(name = "is_default")
    private boolean isDefault = false;

    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    public Address() {}

    public Address(UUID id, String type, String addressLine1, String addressLine2, String city, String state, String pincode, User user, boolean isDefault, boolean isDeleted) {
        this.id = id;
        this.type = type;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.user = user;
        this.isDefault = isDefault;
        this.isDeleted = isDeleted;
    }

    public static class AddressBuilder {
        private UUID id;
        private String type;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String pincode;
        private User user;
        private boolean isDefault = false;
        private boolean isDeleted = false;

        public AddressBuilder id(UUID id) { this.id = id; return this; }
        public AddressBuilder type(String type) { this.type = type; return this; }
        public AddressBuilder addressLine1(String addressLine1) { this.addressLine1 = addressLine1; return this; }
        public AddressBuilder addressLine2(String addressLine2) { this.addressLine2 = addressLine2; return this; }
        public AddressBuilder city(String city) { this.city = city; return this; }
        public AddressBuilder state(String state) { this.state = state; return this; }
        public AddressBuilder pincode(String pincode) { this.pincode = pincode; return this; }
        public AddressBuilder user(User user) { this.user = user; return this; }
        public AddressBuilder isDefault(boolean isDefault) { this.isDefault = isDefault; return this; }
        public AddressBuilder isDeleted(boolean isDeleted) { this.isDeleted = isDeleted; return this; }

        public Address build() {
            return new Address(id, type, addressLine1, addressLine2, city, state, pincode, user, isDefault, isDeleted);
        }
    }

    public static AddressBuilder builder() {
        return new AddressBuilder();
    }

    // Explicit Getters and Setters for high reliability
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
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getCreatedTs() { return createdTs; }
    public void setCreatedTs(LocalDateTime createdTs) { this.createdTs = createdTs; }
    public LocalDateTime getModifiedTs() { return modifiedTs; }
    public void setModifiedTs(LocalDateTime modifiedTs) { this.modifiedTs = modifiedTs; }
    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean aDefault) { isDefault = aDefault; }
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
}
