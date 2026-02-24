package com.pikngo.user_service.dto;

import lombok.Data;

/**
 * Developer 3: User Registration & Profile
 * TODO: Add fields for profile updates.
 */
@Data
public class ProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String address;
    // TODO: Add more fields as needed
}
