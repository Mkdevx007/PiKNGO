package com.pikngo.user_service.controller;

import com.pikngo.user_service.entity.GlobalSetting;
import com.pikngo.user_service.entity.Promotion;
import com.pikngo.user_service.repository.GlobalSettingRepository;
import com.pikngo.user_service.repository.PromotionRepository;
import com.pikngo.user_service.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/settings")
public class AdminSettingsController {

    private final GlobalSettingRepository settingRepository;
    private final PromotionRepository promotionRepository;

    public AdminSettingsController(GlobalSettingRepository settingRepository, PromotionRepository promotionRepository) {
        this.settingRepository = settingRepository;
        this.promotionRepository = promotionRepository;
    }

    // --- Global Settings ---

    @GetMapping("/global")
    public ResponseEntity<ApiResponse<GlobalSetting>> getGlobalSettings() {
        GlobalSetting settings = settingRepository.findById(1L)
                .orElse(GlobalSetting.builder()
                        .id(1L)
                        .platformName("PikNGo Premium")
                        .maintenanceMode(false)
                        .deliveryFee(45.0)
                        .taxPercentage(5.0)
                        .build());
        return ResponseEntity.ok(ApiResponse.success("Global settings fetched", settings));
    }

    @PutMapping("/global")
    public ResponseEntity<ApiResponse<GlobalSetting>> updateGlobalSettings(@RequestBody GlobalSetting newSettings) {
        newSettings.setId(1L); // Always override the singleton config row
        GlobalSetting saved = settingRepository.save(newSettings);
        return ResponseEntity.ok(ApiResponse.success("Global settings updated", saved));
    }

    // --- Promotions ---

    @GetMapping("/promotions")
    public ResponseEntity<ApiResponse<List<Promotion>>> getAllPromotions() {
        return ResponseEntity.ok(ApiResponse.success("Promotions fetched", promotionRepository.findAll()));
    }

    @PostMapping("/promotions")
    public ResponseEntity<ApiResponse<Promotion>> createPromotion(@RequestBody Promotion promotion) {
        return ResponseEntity.ok(ApiResponse.success("Promotion created", promotionRepository.save(promotion)));
    }

    @PutMapping("/promotions/{id}")
    public ResponseEntity<ApiResponse<Promotion>> updatePromotion(@PathVariable UUID id, @RequestBody Promotion newPromo) {
        return promotionRepository.findById(id).map(existing -> {
            existing.setTitle(newPromo.getTitle());
            existing.setDescription(newPromo.getDescription());
            existing.setPromoCode(newPromo.getPromoCode());
            existing.setDiscountPercentage(newPromo.getDiscountPercentage());
            existing.setExpiryDate(newPromo.getExpiryDate());
            existing.setActive(newPromo.isActive());
            return ResponseEntity.ok(ApiResponse.success("Promotion updated", promotionRepository.save(existing)));
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Promotion not found")));
    }

    @DeleteMapping("/promotions/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePromotion(@PathVariable UUID id) {
        if (!promotionRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Promotion not found"));
        }
        promotionRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Promotion deleted", null));
    }
}
