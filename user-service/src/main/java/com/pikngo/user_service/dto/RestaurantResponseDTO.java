package com.pikngo.user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantResponseDTO {
    private UUID id;
    private String resturantName;
    private String address;
    private Double latitude;
    private Double longitude;
    private Double distance;
    private String imageUrl;
    private String category;
    private Double rating;
    private String deliveryTime;
    private boolean isActive;
}
