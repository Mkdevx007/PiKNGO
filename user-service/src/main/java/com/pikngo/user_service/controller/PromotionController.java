package com.pikngo.user_service.controller;

import com.pikngo.user_service.dto.ApiResponse;
import com.pikngo.user_service.entity.Promotion;
import com.pikngo.user_service.repository.PromotionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/promotions")
public class PromotionController {

    private final PromotionRepository promotionRepository;

    public PromotionController(PromotionRepository promotionRepository) {
        this.promotionRepository = promotionRepository;
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Promotion>> validatePromo(@RequestParam String code) {
        return promotionRepository.findByCodeIgnoreCaseAndIsActiveTrue(code)
                .map(promo -> {
                    if (promo.getExpiryDate() != null && promo.getExpiryDate().isBefore(LocalDateTime.now())) {
                        return ResponseEntity.ok(ApiResponse.<Promotion>error("Promo code expired"));
                    }
                    return ResponseEntity.ok(ApiResponse.success("Promo code applied", promo));
                })
                .orElse(ResponseEntity.ok(ApiResponse.<Promotion>error("Invalid promo code")));
    }
}
