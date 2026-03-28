package com.pikngo.user_service.controller;

import com.pikngo.user_service.dto.RestaurantRequestDTO;
import com.pikngo.user_service.dto.RestaurantResponseDTO;
import com.pikngo.user_service.entity.Restaurant;
import com.pikngo.user_service.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
@Slf4j
public class RestaurantController {

    private final RestaurantService restaurantService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Restaurant> createRestaurant(@Valid @RequestBody RestaurantRequestDTO dto) {
        log.info("REST request to create restaurant: {}", dto.getRestaurantName());
        Restaurant restaurant = Restaurant.builder()
                .resturantName(dto.getRestaurantName())
                .address(dto.getAddress())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .isActive(dto.isActive())
                .category(dto.getCategory())
                .rating(dto.getRating())
                .deliveryTime(dto.getDeliveryTime())
                .imageUrl(dto.getImageUrl())
                .build();
        return new ResponseEntity<>(restaurantService.createRestaurant(restaurant), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable UUID id, @Valid @RequestBody RestaurantRequestDTO dto) {
        log.info("REST request to update restaurant: {}", id);
        Restaurant restaurant = Restaurant.builder()
                .resturantName(dto.getRestaurantName())
                .address(dto.getAddress())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .isActive(dto.isActive())
                .category(dto.getCategory())
                .rating(dto.getRating())
                .deliveryTime(dto.getDeliveryTime())
                .imageUrl(dto.getImageUrl())
                .build();
        return ResponseEntity.ok(restaurantService.updateRestaurant(id, restaurant));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<RestaurantResponseDTO>> getNearby(
            @RequestParam Double lat,
            @RequestParam Double lon,
            @RequestParam(defaultValue = "10.0") Double radius) {
        log.info("REST request to get nearby restaurants: {}, {}, {}km", lat, lon, radius);
        return ResponseEntity.ok(restaurantService.getNearbyRestaurants(lat, lon, radius));
    }

    @GetMapping("/search")
    public ResponseEntity<List<RestaurantResponseDTO>> searchByRoute(
            @RequestParam Double srcLat,
            @RequestParam Double srcLon,
            @RequestParam Double destLat,
            @RequestParam Double destLon,
            @RequestParam(defaultValue = "15.0") Double radius) {
        log.info("REST request to search restaurants between locations");
        return ResponseEntity
                .ok(restaurantService.getRestaurantsBetweenLocations(srcLat, srcLon, destLat, destLon, radius));
    }

    @GetMapping
    public ResponseEntity<List<RestaurantResponseDTO>> getAll() {
        log.info("REST request to get all active restaurants");
        return ResponseEntity.ok(restaurantService.getAllActiveRestaurants());
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RestaurantResponseDTO>> getAllAdmin() {
        log.info("REST request to get all restaurants for admin");
        return ResponseEntity.ok(restaurantService.getAllRestaurantsForAdmin());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantResponseDTO> getById(@PathVariable UUID id) {
        log.info("REST request to get restaurant by ID: {}", id);
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }
}
