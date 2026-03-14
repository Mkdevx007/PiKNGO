package com.pikngo.user_service.repository;

import com.pikngo.user_service.entity.Address;
import com.pikngo.user_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {
    List<Address> findByUserAndIsDeletedFalse(User user);
}
