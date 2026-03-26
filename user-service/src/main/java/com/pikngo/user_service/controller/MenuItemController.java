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
        System.out.println("Fetching menu for restaurant: " + restaurantId);
        List<MenuItem> items = menuItemService.getMenuItemsByRestaurant(restaurantId);
        System.out.println("Found " + items.size() + " items");
        return ResponseEntity.ok(items);
    }

    @PostMapping
    public ResponseEntity<MenuItem> addMenuItem(@PathVariable UUID restaurantId, @RequestBody MenuItem menuItem) {
        return ResponseEntity.ok(menuItemService.addMenuItem(restaurantId, menuItem));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable UUID restaurantId, @PathVariable UUID id, @RequestBody MenuItem menuItem) {
        return ResponseEntity.ok(menuItemService.updateMenuItem(id, menuItem));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable UUID restaurantId, @PathVariable UUID id) {
        menuItemService.deleteMenuItem(id);
        return ResponseEntity.ok().build();
    }
}
