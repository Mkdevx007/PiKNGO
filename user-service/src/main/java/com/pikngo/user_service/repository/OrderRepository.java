package com.pikngo.user_service.repository;

import com.pikngo.user_service.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUserIdOrderByCreatedTsDesc(UUID userId);
    List<Order> findByRestaurantIdOrderByCreatedTsDesc(UUID restaurantId);
    List<Order> findAllByOrderByCreatedTsDesc();
}
