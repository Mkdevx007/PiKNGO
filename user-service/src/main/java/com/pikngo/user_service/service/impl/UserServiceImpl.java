package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.dto.UserRegistrationRequest;
import com.pikngo.user_service.dto.ProfileUpdateRequest;
import com.pikngo.user_service.entity.Address;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.exception.UserAlreadyExistsException;
import com.pikngo.user_service.exception.UserNotFoundException;
import com.pikngo.user_service.repository.UserRepository;
import com.pikngo.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User registerUser(UserRegistrationRequest request) {
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new UserAlreadyExistsException("User with phone number already exists");
        }
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User with email already exists");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .userPassword(passwordEncoder.encode(request.getPassword()))
                .dob(request.getDob())
                .isActive(true)
                .build();

        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            Address address = Address.builder()
                    .addressLine1(request.getAddress())
                    .city("TBD")
                    .state("TBD")
                    .pincode("000000")
                    .user(user)
                    .build();
            user.setAddresses(Collections.singletonList(address));
        }

        return userRepository.save(user);
    }

    @Override
    public User getUserByPhoneNumber(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber)
                .filter(user -> !user.isDeleted())
                .orElseThrow(() -> new UserNotFoundException(
                        "User with phone number " + phoneNumber + " not found or deleted"));
    }

    @Override
    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .filter(user -> !user.isDeleted())
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " not found or deleted"));
    }

    @Override
    public User updateUserProfile(String phoneNumber, ProfileUpdateRequest request) {
        User user = getUserByPhoneNumber(phoneNumber);

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new UserAlreadyExistsException("Email already in use by another user");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setUserPassword(passwordEncoder.encode(request.getPassword()));
        }

        return userRepository.save(user);
    }

    @Override
    public void deleteUser(UUID userId, boolean softDelete) {
        User user = getUserById(userId);
        if (softDelete) {
            user.setDeleted(true);
            if (user.getAddresses() != null) {
                user.getAddresses().forEach(addr -> addr.setDeleted(true));
            }
            userRepository.save(user);
        } else {
            userRepository.delete(user);
        }
    }
}
