package com.pikngo.user_service.service;

import com.pikngo.user_service.entity.Address;

import java.util.List;
import java.util.UUID;

public interface AddressService {
    List<Address> getAddressesByUserId(UUID userId);

    Address addAddress(UUID userId, Address address);

    Address updateAddress(UUID userId, UUID addressId, Address addressDetails);

    void deleteAddress(UUID userId, UUID addressId);
}
