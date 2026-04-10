package com.pikngo.user_service.service;

import com.pikngo.user_service.dto.ProfileUpdateRequest;
import com.pikngo.user_service.dto.UserDto;
import com.pikngo.user_service.dto.UserRegistrationRequest;
import com.pikngo.user_service.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {
    User registerUser(UserRegistrationRequest request);
    User getUserByPhoneNumber(String phoneNumber);
    User getUserById(UUID id);
    User updateUserProfile(String phoneNumber, ProfileUpdateRequest request);
    void updateProfilePhoto(String phoneNumber, byte[] photo);
    byte[] getProfilePhoto(UUID userId);
    void deleteUser(UUID userId, boolean softDelete);
    Page<UserDto> getAllUsers(Pageable pageable);
    User updateUserStatus(UUID userId, boolean active);
    User updateUserRole(UUID userId, String role);
}
