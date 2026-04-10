package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.dto.AddressDto;
import com.pikngo.user_service.dto.ProfileUpdateRequest;
import com.pikngo.user_service.dto.UserDto;
import com.pikngo.user_service.dto.UserRegistrationRequest;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.exception.UserAlreadyExistsException;
import com.pikngo.user_service.exception.UserNotFoundException;
import com.pikngo.user_service.repository.UserRepository;
import com.pikngo.user_service.service.EmailService;
import com.pikngo.user_service.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public User registerUser(UserRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number already exists");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .userPassword(passwordEncoder.encode(request.getPassword()))
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .role(User.UserRole.USER)
                .isActive(true)
                .isDeleted(false)
                .build();

        User savedUser = userRepository.save(user);

        // Send Welcome Email
        String subject = "Welcome to PikNGo Premium!";
        String body = "Hi " + request.getFirstName() + ",\n\n" +
                "Thank you for registering with PikNGo. Your account has been successfully created.\n" +
                "Enjoy exploring top-tier restaurants and premium delivery services!\n\n" +
                "Best Regards,\nThe PikNGo Team";
        emailService.sendEmail(savedUser.getEmail(), subject, body);

        return savedUser;
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserByPhoneNumber(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new UserNotFoundException("User not found with phone: " + phoneNumber));
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }

    @Override
    @Transactional
    public User updateUserProfile(String phoneNumber, ProfileUpdateRequest request) {
        User user = getUserByPhoneNumber(phoneNumber);
        
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        
        if (request.getEmail() != null) {
            if (!request.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new UserAlreadyExistsException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }
        
        if (request.getAddressLine1() != null) user.setAddressLine1(request.getAddressLine1());
        if (request.getAddressLine2() != null) user.setAddressLine2(request.getAddressLine2());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getState() != null) user.setState(request.getState());
        if (request.getPincode() != null) user.setPincode(request.getPincode());
        
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void updateProfilePhoto(String phoneNumber, byte[] photo) {
        User user = getUserByPhoneNumber(phoneNumber);
        user.setProfilePhoto(photo);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getProfilePhoto(UUID userId) {
        return userRepository.findById(userId)
                .map(User::getProfilePhoto)
                .orElse(null);
    }

    @Override
    @Transactional
    public void deleteUser(UUID userId, boolean softDelete) {
        log.info("Deleting user {}. Soft delete: {}", userId, softDelete);
        User user = getUserById(userId);
        if (softDelete) {
            user.setDeleted(true);
            user.setActive(false);
            userRepository.save(user);
        } else {
            userRepository.delete(user);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDto> getAllUsers(Pageable pageable) {
        log.info("Fetching a page of users (admin access)");
        return userRepository.findAll(pageable).map(this::convertToDto);
    }

    @Override
    @Transactional
    public User updateUserStatus(UUID userId, boolean active) {
        log.info("Admin Action: Updating status for user {} to {}", userId, active);
        User user = getUserById(userId);
        user.setActive(active);
        if (active && user.isDeleted()) {
            user.setDeleted(false);
        }
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateUserRole(UUID userId, String role) {
        log.info("Admin Action: Updating role for user {} to {}", userId, role);
        User user = getUserById(userId);
        try {
            user.setRole(User.UserRole.valueOf(role.toUpperCase()));
        } catch (IllegalArgumentException e) {
            log.error("Invalid role name: {}", role);
            throw new RuntimeException("Invalid role name: " + role);
        }
        return userRepository.save(user);
    }

    private UserDto convertToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .profileImageUrl(user.getProfileImageUrl())
                .isActive(user.isActive())
                .isDeleted(user.isDeleted())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .addresses(user.getAddresses() != null ? user.getAddresses().stream().map(addr -> AddressDto.builder()
                        .id(addr.getId())
                        .type(addr.getType())
                        .addressLine1(addr.getAddressLine1())
                        .addressLine2(addr.getAddressLine2())
                        .city(addr.getCity())
                        .state(addr.getState())
                        .pincode(addr.getPincode())
                        .isDefault(addr.isDefault())
                        .build()).collect(Collectors.toList()) : null)
                .build();
    }
}
