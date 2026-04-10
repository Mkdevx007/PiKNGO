package com.pikngo.user_service.service.impl;

import com.pikngo.user_service.entity.MenuItem;
import com.pikngo.user_service.repository.MenuItemRepository;
import com.pikngo.user_service.service.MenuItemService;
import com.pikngo.user_service.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class MenuItemServiceImpl implements MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;

    public MenuItemServiceImpl(MenuItemRepository menuItemRepository, RestaurantRepository restaurantRepository) {
        this.menuItemRepository = menuItemRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Override
    public List<MenuItem> getMenuItemsByRestaurant(UUID restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId);
    }

    @Override
    @Transactional
    public MenuItem addMenuItem(UUID restaurantId, MenuItem menuItem) {
        com.pikngo.user_service.entity.Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        menuItem.setRestaurant(restaurant);
        return menuItemRepository.save(menuItem);
    }

    @Override
    @Transactional
    public MenuItem updateMenuItem(UUID id, MenuItem menuItem) {
        MenuItem existing = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        
        existing.setItemName(menuItem.getItemName());
        existing.setItemDescription(menuItem.getItemDescription());
        existing.setItemPrice(menuItem.getItemPrice());
        existing.setItemCategory(menuItem.getItemCategory());
        existing.setItemImageUrl(menuItem.getItemImageUrl());
        existing.setAvailable(menuItem.isAvailable());
        existing.setVeg(menuItem.isVeg());
        
        return menuItemRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteMenuItem(UUID id) {
        menuItemRepository.deleteById(id);
    }
}
