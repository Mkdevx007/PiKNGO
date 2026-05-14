package com.pikngo.user_service.dto;

import java.util.UUID;

public class LocationUpdateDTO {
    private UUID orderId;
    private Double latitude;
    private Double longitude;

    public LocationUpdateDTO() {}

    public LocationUpdateDTO(UUID orderId, Double latitude, Double longitude) {
        this.orderId = orderId;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
