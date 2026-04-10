package com.pikngo.user_service.repository;

import java.util.UUID;

public interface RestaurantWithDistance {
    UUID getId();
    String getRestaurantName();
    String getAddress();
    Double getLatitude();
    Double getLongitude();
    Double getDistance();
    String getImageUrl();
    String getCategory();
    Double getRating();
    String getDeliveryTime();
    Boolean getIsActive();
}
