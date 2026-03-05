package com.pikngo.user_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Identifier is required")
    private String identifier; // Email or Phone

    @NotBlank(message = "Password is required")
    private String password;
}
