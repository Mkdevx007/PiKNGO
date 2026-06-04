package com.pikngo.user_service.dto;

public class SosRequestDTO {
    private Double latitude;
    private Double longitude;

    public SosRequestDTO() {}

    public SosRequestDTO(Double latitude, Double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
