package com.pikngo.user_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "global_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlobalSetting {

    @Id
    private Long id; // Assuming a single row for global config

    private String platformName;

    private boolean maintenanceMode;

    private Double deliveryFee;

    private Double taxPercentage;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
