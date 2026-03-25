package com.pikngo.user_service.service;

import com.pikngo.user_service.entity.MenuItem;
import java.util.List;
import java.util.UUID;

public interface MenuItemService {
    List<MenuItem> getMenuItemsByRestaurant(UUID restaurantId);
    MenuItem addMenuItem(MenuItem menuItem);
    MenuItem updateMenuItem(UUID id, MenuItem menuItem);
    void deleteMenuItem(UUID id);
}
