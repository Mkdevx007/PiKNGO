package com.pikngo.user_service.service;

import com.pikngo.user_service.entity.Address;

import java.util.List;

import java.util.UUID;

public interface AddressService {
    Address addAddress(UUID userId, Address address);
    List<Address> getUserAddresses(UUID userId);
    Address updateAddress(UUID userId, UUID addressId, Address updatedAddress);
    void deleteAddress(UUID userId, UUID addressId);
}
