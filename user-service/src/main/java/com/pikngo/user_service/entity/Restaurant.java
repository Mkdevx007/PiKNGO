package com.pikngo.user_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "restaurants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "_id", updatable = false, nullable = false)
    private UUID id;


    @NotBlank(message = "Restaurant name is required")
    @Column(name = "resturant_name", nullable = false)
    private String resturantName;

    @NotBlank(message = "Address is required")
    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Builder.Default
    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "delivery_time", length = 50)
    private String deliveryTime;

    @CreationTimestamp
    @Column(name = "created_ts", updatable = false)
    private LocalDateTime createdTs;

    @UpdateTimestamp
    @Column(name = "modify_ts")
    private LocalDateTime modifyTs;


    @Builder.Default
    @Column(name = "is_deleted")
    private boolean isDeleted = false;
}
