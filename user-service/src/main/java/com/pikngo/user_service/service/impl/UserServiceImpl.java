package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.dto.UserRegistrationRequest;
import com.pikngo.user_service.dto.ProfileUpdateRequest;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.entity.Address;
import com.pikngo.user_service.exception.UserAlreadyExistsException;
import com.pikngo.user_service.exception.UserNotFoundException;
import com.pikngo.user_service.repository.AddressRepository;
import com.pikngo.user_service.repository.UserRepository;
import com.pikngo.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
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
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .isActive(true)
                .build();

        log.info("REGISTERING USER: Phone: {}, City: {}, State: {}, Pincode: {}", 
                user.getPhoneNumber(), user.getCity(), user.getState(), user.getPincode());

        User savedUser = userRepository.save(user);

        // Also save to the separate addresses table as common practice for multiple addresses
        if (request.getAddressLine1() != null && !request.getAddressLine1().isBlank()) {
            Address address = Address.builder()
                    .addressLine1(request.getAddressLine1())
                    .addressLine2(request.getAddressLine2())
                    .city(request.getCity())
                    .state(request.getState())
                    .pincode(request.getPincode())
                    .user(savedUser)
                    .build();
            addressRepository.save(address);
        }

        return savedUser;
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserByPhoneNumber(String phoneNumber) {
        log.info("Searching for user with phone number: '{}'", phoneNumber);
        return userRepository.findByPhoneNumber(phoneNumber)
                .filter(user -> !user.isDeleted())
                .orElseThrow(() -> new UserNotFoundException(
                        "User with phone number " + phoneNumber + " not found or deleted"));
    }

    @Override
    @Transactional(readOnly = true)
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

        // Sync address in User entity
        boolean addressChanged = false;
        if (request.getAddressLine1() != null) { user.setAddressLine1(request.getAddressLine1()); addressChanged = true; }
        if (request.getAddressLine2() != null) { user.setAddressLine2(request.getAddressLine2()); addressChanged = true; }
        if (request.getCity() != null) { user.setCity(request.getCity()); addressChanged = true; }
        if (request.getState() != null) { user.setState(request.getState()); addressChanged = true; }
        if (request.getPincode() != null) { user.setPincode(request.getPincode()); addressChanged = true; }

        log.info("UPDATING USER PROFILE: Phone: {}, City: {}, State: {}, Pincode: {}", 
                user.getPhoneNumber(), user.getCity(), user.getState(), user.getPincode());

        User updatedUser = userRepository.save(user);

        // SYNC: Update the first address in the addresses table if it exists
        if (addressChanged) {
            List<Address> addresses = addressRepository.findByUserAndIsDeletedFalse(user);
            if (!addresses.isEmpty()) {
                Address primary = addresses.get(0);
                primary.setAddressLine1(user.getAddressLine1());
                primary.setAddressLine2(user.getAddressLine2());
                primary.setCity(user.getCity());
                primary.setState(user.getState());
                primary.setPincode(user.getPincode());
                addressRepository.save(primary);
            }
        }

        return updatedUser;
    }

    @Override
    public void deleteUser(UUID userId, boolean softDelete) {
        User user = getUserById(userId);
        if (softDelete) {
            user.setDeleted(true);
            user.setActive(false);
            userRepository.save(user);
        } else {
            userRepository.delete(user);
        }
    }
}
