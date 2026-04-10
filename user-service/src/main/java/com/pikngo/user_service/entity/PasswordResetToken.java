package com.pikngo.user_service.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String token;

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    @JsonBackReference
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    public PasswordResetToken() {}

    public PasswordResetToken(UUID id, String token, User user, LocalDateTime expiryDate) {
        this.id = id;
        this.token = token;
        this.user = user;
        this.expiryDate = expiryDate;
    }

    // Explicit manual builder to replace failing Lombok builder
    public static class PasswordResetTokenBuilder {
        private String token;
        private User user;
        private LocalDateTime expiryDate;

        public PasswordResetTokenBuilder token(String token) { this.token = token; return this; }
        public PasswordResetTokenBuilder user(User user) { this.user = user; return this; }
        public PasswordResetTokenBuilder expiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; return this; }

        public PasswordResetToken build() {
            PasswordResetToken prt = new PasswordResetToken();
            prt.setToken(token);
            prt.setUser(user);
            prt.setExpiryDate(expiryDate);
            return prt;
        }
    }

    public static PasswordResetTokenBuilder builder() {
        return new PasswordResetTokenBuilder();
    }

    // Explicit Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }

    public boolean isExpired() {
        return expiryDate != null && expiryDate.isBefore(LocalDateTime.now());
    }
}
