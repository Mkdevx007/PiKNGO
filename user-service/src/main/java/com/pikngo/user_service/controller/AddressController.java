package com.pikngo.user_service.controller;

import com.pikngo.user_service.dto.AddressRequestDTO;
import com.pikngo.user_service.entity.Address;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.exception.UserNotFoundException;
import com.pikngo.user_service.repository.UserRepository;
import com.pikngo.user_service.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
@Slf4j
public class AddressController {

    private final AddressService addressService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Address>> getMyAddresses(Principal principal) {
        User user = getUserFromPrincipal(principal);
        log.info("Fetching addresses for user: {}", user.getId());
        List<Address> addresses = addressService.getUserAddresses(user.getId());
        return ResponseEntity.ok(addresses);
    }

    @PostMapping
    public ResponseEntity<Address> addAddress(
            @Valid @RequestBody AddressRequestDTO dto,
            Principal principal) {
        User user = getUserFromPrincipal(principal);
        log.info("Adding address for user: {}", user.getId());
        Address address = mapDtoToEntity(dto);
        Address created = addressService.addAddress(user.getId(), address);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Address> updateAddress(
            @PathVariable UUID id,
            @Valid @RequestBody AddressRequestDTO dto) {
        log.info("Updating address ID: {}", id);
        Address address = mapDtoToEntity(dto);
        Address updated = addressService.updateAddress(id, address);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable UUID id) {
        log.info("Deleting address ID: {}", id);
        addressService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }

    private User getUserFromPrincipal(Principal principal) {
        return userRepository.findByPhoneNumber(principal.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found: " + principal.getName()));
    }

    private Address mapDtoToEntity(AddressRequestDTO dto) {
        return Address.builder()
                .addressLine1(dto.getAddressLine1())
                .addressLine2(dto.getAddressLine2())
                .city(dto.getCity())
                .state(dto.getState())
                .pincode(dto.getPincode())
                .build();
    }
}
