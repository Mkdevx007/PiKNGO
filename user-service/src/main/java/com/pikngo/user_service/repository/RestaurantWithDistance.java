package com.pikngo.user_service.repository;

import java.util.UUID;

public interface RestaurantWithDistance {
    UUID getId();
    String getResturantName();
    String getAddress();
    Double getLatitude();
    Double getLongitude();
    Double getDistance();
}
