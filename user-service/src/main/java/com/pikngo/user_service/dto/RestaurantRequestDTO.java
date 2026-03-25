package com.pikngo.user_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RestaurantRequestDTO {

    @NotBlank(message = "Restaurant name is required")
    private String restaurantName;

    @NotBlank(message = "Address is required")
    private String address;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private boolean isActive = true;

    private String category;
    private Double rating;
    private String deliveryTime;
    private String imageUrl;
}
