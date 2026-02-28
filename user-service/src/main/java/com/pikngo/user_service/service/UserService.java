package com.pikngo.user_service.service;

import com.pikngo.user_service.dto.ProfileUpdateRequest;
import com.pikngo.user_service.dto.UserRegistrationRequest;
import com.pikngo.user_service.entity.User;

import java.util.UUID;

public interface UserService {
    User registerUser(UserRegistrationRequest request);

    User getUserByPhoneNumber(String phoneNumber);

    User getUserById(UUID id);

    User updateUserProfile(String phoneNumber, ProfileUpdateRequest request);
}
