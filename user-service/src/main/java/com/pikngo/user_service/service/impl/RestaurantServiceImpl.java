package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.entity.Restaurant;
import com.pikngo.user_service.repository.RestaurantRepository;
import com.pikngo.user_service.service.RestaurantService;
import com.pikngo.user_service.dto.RestaurantResponseDTO;
import com.pikngo.user_service.repository.RestaurantWithDistance;
import com.pikngo.user_service.repository.OrderRepository;
import org.springframework.data.domain.PageRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RestaurantServiceImpl implements RestaurantService {

    private static final Logger log = LoggerFactory.getLogger(RestaurantServiceImpl.class);

    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;

    public RestaurantServiceImpl(RestaurantRepository restaurantRepository, OrderRepository orderRepository) {
        this.restaurantRepository = restaurantRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional
    public Restaurant createRestaurant(Restaurant restaurant) {
        log.info("Creating new restaurant: {}", restaurant.getRestaurantName());
        return restaurantRepository.save(restaurant);
    }

    @Override
    @Transactional
    public Restaurant updateRestaurant(UUID id, Restaurant updatedRestaurant) {
        log.info("Updating restaurant ID: {}", id);
        Restaurant existing = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found with ID: " + id));

        existing.setRestaurantName(updatedRestaurant.getRestaurantName());
        existing.setAddress(updatedRestaurant.getAddress());
        existing.setLatitude(updatedRestaurant.getLatitude());
        existing.setLongitude(updatedRestaurant.getLongitude());
        existing.setActive(updatedRestaurant.isActive());
        existing.setCategory(updatedRestaurant.getCategory());
        existing.setRating(updatedRestaurant.getRating());
        existing.setDeliveryTime(updatedRestaurant.getDeliveryTime());
        existing.setImageUrl(updatedRestaurant.getImageUrl());

        return restaurantRepository.save(existing);
    }

    private RestaurantResponseDTO mapToDTO(Restaurant restaurant) {
        return RestaurantResponseDTO.builder()
                .id(restaurant.getId())
                .restaurantName(restaurant.getRestaurantName())
                .address(restaurant.getAddress())
                .latitude(restaurant.getLatitude())
                .longitude(restaurant.getLongitude())
                .imageUrl(restaurant.getImageUrl())
                .category(restaurant.getCategory())
                .rating(restaurant.getRating())
                .deliveryTime(restaurant.getDeliveryTime())
                .isActive(restaurant.isActive())
                .ownerId(restaurant.getOwnerId())
                .build();
    }

    private RestaurantResponseDTO mapToDTOWithDistance(RestaurantWithDistance projection) {
        RestaurantResponseDTO dto = new RestaurantResponseDTO();
        dto.setId(projection.getId());
        dto.setRestaurantName(projection.getRestaurantName());
        dto.setAddress(projection.getAddress());
        dto.setLatitude(projection.getLatitude());
        dto.setLongitude(projection.getLongitude());
        dto.setImageUrl(projection.getImageUrl());
        dto.setCategory(projection.getCategory());
        dto.setRating(projection.getRating());
        dto.setDeliveryTime(projection.getDeliveryTime());
        dto.setActive(projection.getIsActive());
        dto.setDistance(projection.getDistance());
        // Since projection might not have ownerId, we handle it gracefully
        // but RestaurantWithDistance should be updated if we need it here.
        return dto;
    }

    @Override
    public List<RestaurantResponseDTO> getNearbyRestaurants(Double lat, Double lon, Double radius) {
        log.info("Searching for restaurants near {}, {} within {}km", lat, lon, radius);
        return restaurantRepository.findNearbyRestaurants(lat, lon, radius)
                .stream()
                .map(this::mapToDTOWithDistance)
                .collect(Collectors.toList());
    }

    @Override
    public List<RestaurantResponseDTO> getRestaurantsBetweenLocations(Double srcLat, Double srcLon, Double destLat, Double destLon,
            Double radius) {
        log.info("Searching for restaurants along route from ({}, {}) to ({}, {}) within {}km", 
                srcLat, srcLon, destLat, destLon, radius);

        List<Restaurant> allActive = restaurantRepository.findByIsActiveTrueAndIsDeletedFalse();
        
        return allActive.stream()
                .filter(res -> res.getLatitude() != null && res.getLongitude() != null)
                .filter(res -> isAlongRoute(srcLat, srcLon, destLat, destLon, res.getLatitude(), res.getLongitude(), radius))
                .map(res -> {
                    RestaurantResponseDTO dto = mapToDTO(res);
                    double distToRoute = crossTrackDistance(srcLat, srcLon, destLat, destLon, res.getLatitude(), res.getLongitude());
                    dto.setDistance(Math.abs(distToRoute));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private boolean isAlongRoute(double lat1, double lon1, double lat2, double lon2, double lat3, double lon3, double radius) {
        double dxt = crossTrackDistance(lat1, lon1, lat2, lon2, lat3, lon3);
        if (Math.abs(dxt) > radius) return false;

        double minLat = Math.min(lat1, lat2) - (radius / 111.0);
        double maxLat = Math.max(lat1, lat2) + (radius / 111.0);
        double minLon = Math.min(lon1, lon2) - (radius / (111.0 * Math.cos(Math.toRadians(lat1))));
        double maxLon = Math.max(lon1, lon2) + (radius / (111.0 * Math.cos(Math.toRadians(lat1))));

        return lat3 >= minLat && lat3 <= maxLat && lon3 >= minLon && lon3 <= maxLon;
    }

    private double crossTrackDistance(double lat1, double lon1, double lat2, double lon2, double lat3, double lon3) {
        double R = 6371; 
        double d13 = haversine(lat1, lon1, lat3, lon3);
        double brng13 = bearing(lat1, lon1, lat3, lon3);
        double brng12 = bearing(lat1, lon1, lat2, lon2);
        
        return Math.asin(Math.sin(d13 / R) * Math.sin(brng13 - brng12)) * R;
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private double bearing(double lat1, double lon1, double lat2, double lon2) {
        double phi1 = Math.toRadians(lat1);
        double phi2 = Math.toRadians(lat2);
        double deltaLambda = Math.toRadians(lon2 - lon1);
        double y = Math.sin(deltaLambda) * Math.cos(phi2);
        double x = Math.cos(phi1) * Math.sin(phi2) -
                   Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
        return Math.atan2(y, x);
    }

    @Override
    public List<RestaurantResponseDTO> getAllActiveRestaurants() {
        log.info("Fetching all active restaurants");
        return restaurantRepository.findByIsActiveTrueAndIsDeletedFalse()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RestaurantResponseDTO> getAllRestaurantsForAdmin() {
        log.info("Fetching all restaurants for admin");
        return restaurantRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RestaurantResponseDTO> getRestaurantsByOwner(UUID ownerId) {
        return restaurantRepository.findByOwnerId(ownerId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public com.pikngo.user_service.dto.PartnerAnalyticsDTO getPartnerAnalytics(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        
        java.math.BigDecimal revenue = orderRepository.calculateRestaurantRevenue(restaurantId);
        long totalOrders = orderRepository.countByRestaurantId(restaurantId);
        
        List<Object[]> topItemsRaw = orderRepository.findTopItemsByRestaurant(restaurantId, PageRequest.of(0, 5));
        List<com.pikngo.user_service.dto.PartnerAnalyticsDTO.TopItemDTO> topItems = topItemsRaw.stream()
                .map(row -> new com.pikngo.user_service.dto.PartnerAnalyticsDTO.TopItemDTO((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());

        com.pikngo.user_service.dto.PartnerAnalyticsDTO analytics = new com.pikngo.user_service.dto.PartnerAnalyticsDTO();
        analytics.setTotalRevenue(revenue != null ? revenue : java.math.BigDecimal.ZERO);
        analytics.setTotalOrders(totalOrders);
        analytics.setAverageRating(restaurant.getRating());
        analytics.setTopItems(topItems);
        
        return analytics;
    }

    @Override
    public RestaurantResponseDTO getRestaurantById(UUID id) {
        log.info("Fetching restaurant by ID: {}", id);
        return restaurantRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Restaurant not found with ID: " + id));
    }

    @Override
    public RestaurantResponseDTO getRestaurantByOwnerId(UUID ownerId) {
        log.info("Fetching restaurant for owner ID: {}", ownerId);
        return restaurantRepository.findByOwnerId(ownerId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Restaurant not found for owner: " + ownerId));
    }
}
