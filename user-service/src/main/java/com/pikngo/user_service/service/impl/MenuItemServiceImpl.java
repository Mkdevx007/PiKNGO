package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.entity.MenuItem;
import com.pikngo.user_service.repository.MenuItemRepository;
import com.pikngo.user_service.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuItemServiceImpl implements MenuItemService {

    private final MenuItemRepository menuItemRepository;

    @Override
    public List<MenuItem> getMenuItemsByRestaurant(UUID restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId);
    }

    @Override
    public MenuItem addMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }

    @Override
    public MenuItem updateMenuItem(UUID id, MenuItem menuItem) {
        MenuItem existing = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        
        existing.setName(menuItem.getName());
        existing.setDescription(menuItem.getDescription());
        existing.setPrice(menuItem.getPrice());
        existing.setCategory(menuItem.getCategory());
        existing.setImageUrl(menuItem.getImageUrl());
        existing.setAvailable(menuItem.isAvailable());
        existing.setVeg(menuItem.isVeg());
        
        return menuItemRepository.save(existing);
    }

    @Override
    public void deleteMenuItem(UUID id) {
        menuItemRepository.deleteById(id);
    }
}
