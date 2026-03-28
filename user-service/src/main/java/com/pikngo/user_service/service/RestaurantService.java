package com.pikngo.user_service.service;

import com.pikngo.user_service.entity.Restaurant;
import com.pikngo.user_service.dto.RestaurantResponseDTO;
import java.util.List;
import java.util.UUID;

public interface RestaurantService {
    Restaurant createRestaurant(Restaurant restaurant);

    Restaurant updateRestaurant(UUID id, Restaurant restaurant);

    List<RestaurantResponseDTO> getNearbyRestaurants(Double lat, Double lon, Double radius);

    List<RestaurantResponseDTO> getRestaurantsBetweenLocations(Double srcLat, Double srcLon, Double destLat, Double destLon,
            Double radius);

    List<RestaurantResponseDTO> getAllActiveRestaurants();
    List<RestaurantResponseDTO> getAllRestaurantsForAdmin();
    RestaurantResponseDTO getRestaurantById(UUID id);
}
