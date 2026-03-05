package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.entity.Address;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.exception.UserNotFoundException;
import com.pikngo.user_service.repository.AddressRepository;
import com.pikngo.user_service.repository.UserRepository;
import com.pikngo.user_service.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    public List<Address> getAddressesByUserId(UUID userId) {
        return addressRepository.findByUserIdAndIsDeletedFalse(userId);
    }

    @Override
    public Address addAddress(UUID userId, Address address) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        address.setUser(user);
        address.setDeleted(false);
        return addressRepository.save(address);
    }

    @Override
    public Address updateAddress(UUID userId, UUID addressId, Address addressDetails) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Address does not belong to the specified user");
        }

        address.setAddressLine1(addressDetails.getAddressLine1());
        address.setAddressLine2(addressDetails.getAddressLine2());
        address.setCity(addressDetails.getCity());
        address.setState(addressDetails.getState());
        address.setPincode(addressDetails.getPincode());

        return addressRepository.save(address);
    }

    @Override
    public void deleteAddress(UUID userId, UUID addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Address does not belong to the specified user");
        }

        address.setDeleted(true);
        addressRepository.save(address);
    }
}
