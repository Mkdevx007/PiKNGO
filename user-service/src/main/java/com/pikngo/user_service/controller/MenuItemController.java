package com.pikngo.user_service.controller;

import com.pikngo.user_service.entity.MenuItem;
import com.pikngo.user_service.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/menu")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    @GetMapping
    public ResponseEntity<List<MenuItem>> getMenu(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(menuItemService.getMenuItemsByRestaurant(restaurantId));
    }

    @PostMapping
    public ResponseEntity<MenuItem> addMenuItem(@PathVariable UUID restaurantId, @RequestBody MenuItem menuItem) {
        // Simple set for now, in real case we would fetch restaurant
        return ResponseEntity.ok(menuItemService.addMenuItem(menuItem));
    }
}
