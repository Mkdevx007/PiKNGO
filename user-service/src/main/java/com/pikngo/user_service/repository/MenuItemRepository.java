package com.pikngo.user_service.repository;

import com.pikngo.user_service.entity.MenuItem;
import com.pikngo.user_service.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {
    List<MenuItem> findByRestaurantId(UUID restaurantId);
    List<MenuItem> findByRestaurant(Restaurant restaurant);

    @Modifying
    @Transactional
    @Query("DELETE FROM MenuItem m WHERE m.restaurant = :restaurant")
    void deleteByRestaurant(Restaurant restaurant);
}
