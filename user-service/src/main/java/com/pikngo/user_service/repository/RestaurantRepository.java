package com.pikngo.user_service.repository;

import com.pikngo.user_service.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, UUID> {
    
    @Query("SELECT r FROM Restaurant r WHERE (r.isActive = true OR r.isActive IS NULL) AND r.isDeleted = false")
    List<Restaurant> findByIsActiveTrueAndIsDeletedFalse();

    @Query(value = "SELECT r._id as id, r.restaurant_name as restaurantName, r.address as address, r.latitude as latitude, r.longitude as longitude, " +
            "r.image_url as imageUrl, r.category as category, r.rating as rating, r.delivery_time as deliveryTime, r.is_active as isActive, " +
            "(6371 * acos(cos(radians(?1)) * cos(radians(r.latitude)) * cos(radians(r.longitude) - radians(?2)) + sin(radians(?1)) * sin(radians(r.latitude)))) as distance " +
            "FROM restaurants r WHERE (r.is_active = true OR r.is_active IS NULL) AND r.is_deleted = false AND " +
            "(6371 * acos(cos(radians(?1)) * cos(radians(r.latitude)) * cos(radians(r.longitude) - radians(?2)) + sin(radians(?1)) * sin(radians(r.latitude)))) < ?3 " +
            "ORDER BY distance ASC", nativeQuery = true)
    List<RestaurantWithDistance> findNearbyRestaurants(Double lat, Double lon, Double radiusInKm);
}
