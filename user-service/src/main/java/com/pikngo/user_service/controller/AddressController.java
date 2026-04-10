package com.pikngo.user_service.controller;

import com.pikngo.user_service.dto.AddressRequestDTO;
import com.pikngo.user_service.dto.ApiResponse;
import com.pikngo.user_service.entity.Address;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.exception.UserNotFoundException;
import com.pikngo.user_service.repository.UserRepository;
import com.pikngo.user_service.service.AddressService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/addresses")
public class AddressController {

    private static final Logger log = LoggerFactory.getLogger(AddressController.class);

    private final AddressService addressService;
    private final UserRepository userRepository;

    public AddressController(AddressService addressService, UserRepository userRepository) {
        this.addressService = addressService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Address>>> getMyAddresses(Principal principal) {
        User user = getUserFromPrincipal(principal);
        log.info("Fetching addresses for user: {}", user.getId());
        List<Address> addresses = addressService.getUserAddresses(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Addresses fetched successfully", addresses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Address>> addAddress(
            @Valid @RequestBody AddressRequestDTO dto,
            Principal principal) {
        User user = getUserFromPrincipal(principal);
        log.info("Adding address for user: {}", user.getId());
        Address address = mapDtoToEntity(dto);
        Address created = addressService.addAddress(user.getId(), address);
        return new ResponseEntity<>(ApiResponse.success("Address added successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Address>> updateAddress(
            @PathVariable UUID id,
            @Valid @RequestBody AddressRequestDTO dto,
            Principal principal) {
        User user = getUserFromPrincipal(principal);
        log.info("Updating address ID: {} for user: {}", id, user.getId());
        Address address = mapDtoToEntity(dto);
        Address updated = addressService.updateAddress(user.getId(), id, address);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable UUID id,
            Principal principal) {
        User user = getUserFromPrincipal(principal);
        log.info("Deleting address ID: {} for user: {}", id, user.getId());
        addressService.deleteAddress(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }

    private User getUserFromPrincipal(Principal principal) {
        return userRepository.findByPhoneNumber(principal.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found: " + principal.getName()));
    }

    private Address mapDtoToEntity(AddressRequestDTO dto) {
        Address address = new Address();
        address.setType(dto.getType());
        address.setAddressLine1(dto.getAddressLine1());
        address.setAddressLine2(dto.getAddressLine2());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setPincode(dto.getPincode());
        return address;
    }
}
