package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.entity.Address;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.exception.UserNotFoundException;
import com.pikngo.user_service.repository.AddressRepository;
import com.pikngo.user_service.repository.UserRepository;
import com.pikngo.user_service.service.AddressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public Address addAddress(UUID userId, Address address) {
        log.info("Adding new address for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        address.setUser(user);
        return addressRepository.save(address);
    }

    @Override
    public List<Address> getUserAddresses(UUID userId) {
        log.info("Fetching addresses for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        return addressRepository.findByUserAndIsDeletedFalse(user);
    }

    @Override
    @Transactional
    public Address updateAddress(UUID addressId, Address updatedAddress) {
        log.info("Updating address ID: {}", addressId);
        Address existing = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found with ID: " + addressId));

        existing.setAddressLine1(updatedAddress.getAddressLine1());
        existing.setAddressLine2(updatedAddress.getAddressLine2());
        existing.setCity(updatedAddress.getCity());
        existing.setState(updatedAddress.getState());
        existing.setPincode(updatedAddress.getPincode());

        return addressRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteAddress(UUID addressId) {
        log.info("Soft deleting address ID: {}", addressId);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found with ID: " + addressId));
        address.setDeleted(true);
        addressRepository.save(address);
    }
}
