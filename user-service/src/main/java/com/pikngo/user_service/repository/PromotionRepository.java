package com.pikngo.user_service.repository;

import com.pikngo.user_service.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, UUID> {
    Optional<Promotion> findByPromoCode(String promoCode);
}
