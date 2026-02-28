package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.dto.ProfileUpdateRequest;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.exception.UserAlreadyExistsException;
import com.pikngo.user_service.exception.UserNotFoundException;
import com.pikngo.user_service.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User existingUser;
    private String phoneNumber = "1234567890";

    @BeforeEach
    void setUp() {
        existingUser = User.builder()
                .id(UUID.randomUUID())
                .firstName("Old")
                .lastName("User")
                .email("old@example.com")
                .phoneNumber(phoneNumber)
                .address("Old Address")
                .isActive(true)
                .build();
    }

    @Test
    void shouldUpdateUserProfileSuccessfully() {
        ProfileUpdateRequest request = ProfileUpdateRequest.builder()
                .firstName("New")
                .lastName("Name")
                .address("New Address")
                .email("new@example.com")
                .build();

        when(userRepository.findByPhoneNumber(phoneNumber)).thenReturn(Optional.of(existingUser));
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User updatedUser = userService.updateUserProfile(phoneNumber, request);

        assertThat(updatedUser.getFirstName()).isEqualTo("New");
        assertThat(updatedUser.getLastName()).isEqualTo("Name");
        assertThat(updatedUser.getAddress()).isEqualTo("New Address");
        assertThat(updatedUser.getEmail()).isEqualTo("new@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldPartialUpdateUserProfile() {
        ProfileUpdateRequest request = ProfileUpdateRequest.builder()
                .firstName("UpdatedFirst")
                .build();

        when(userRepository.findByPhoneNumber(phoneNumber)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User updatedUser = userService.updateUserProfile(phoneNumber, request);

        assertThat(updatedUser.getFirstName()).isEqualTo("UpdatedFirst");
        assertThat(updatedUser.getLastName()).isEqualTo("User"); // Remains same
        assertThat(updatedUser.getAddress()).isEqualTo("Old Address"); // Remains same
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExistsDuringUpdate() {
        ProfileUpdateRequest request = ProfileUpdateRequest.builder()
                .email("exists@example.com")
                .build();

        when(userRepository.findByPhoneNumber(phoneNumber)).thenReturn(Optional.of(existingUser));
        when(userRepository.existsByEmail("exists@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.updateUserProfile(phoneNumber, request))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining("Email already in use");
    }

    @Test
    void shouldThrowExceptionWhenUserNotFoundDuringUpdate() {
        ProfileUpdateRequest request = ProfileUpdateRequest.builder()
                .firstName("New")
                .build();

        when(userRepository.findByPhoneNumber(phoneNumber)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateUserProfile(phoneNumber, request))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("not found");
    }
}
