package com.pikngo.user_service.controller;

import com.pikngo.user_service.entity.MenuItem;
import com.pikngo.user_service.service.MenuItemService;
import com.pikngo.user_service.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/menu")
public class MenuItemController {

    private static final Logger log = LoggerFactory.getLogger(MenuItemController.class);
    private final MenuItemService menuItemService;

    public MenuItemController(MenuItemService menuItemService) {
        this.menuItemService = menuItemService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MenuItem>>> getMenu(@PathVariable UUID restaurantId) {
        log.info("Fetching menu for restaurant: {}", restaurantId);
        List<MenuItem> items = menuItemService.getMenuItemsByRestaurant(restaurantId);
        return ResponseEntity.ok(ApiResponse.success("Menu fetched successfully", items));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MenuItem>> addMenuItem(@PathVariable UUID restaurantId, @RequestBody MenuItem menuItem) {
        return ResponseEntity.ok(ApiResponse.success("Menu item added successfully", menuItemService.addMenuItem(restaurantId, menuItem)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MenuItem>> updateMenuItem(@PathVariable UUID id, @RequestBody MenuItem menuItem) {
        return ResponseEntity.ok(ApiResponse.success("Menu item updated successfully", menuItemService.updateMenuItem(id, menuItem)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@PathVariable UUID id) {
        menuItemService.deleteMenuItem(id);
        return ResponseEntity.ok(ApiResponse.success("Menu item deleted successfully", null));
    }
}
