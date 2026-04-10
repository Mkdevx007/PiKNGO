package com.pikngo.user_service.repository;

import com.pikngo.user_service.dto.TrendingItemDTO;
import com.pikngo.user_service.entity.Order;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUserIdOrderByCreatedTsDesc(UUID userId);
    List<Order> findByRestaurantIdOrderByCreatedTsDesc(UUID restaurantId);
    List<Order> findAllByOrderByCreatedTsDesc();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED'")
    java.math.BigDecimal calculateTotalRevenue();

    long countByIsSelfPickupTrue();
    long countByIsSelfPickupFalse();

    @Query("""
            SELECT new com.pikngo.user_service.dto.TrendingItemDTO(
                mi.id,
                mi.itemName,
                mi.itemCategory,
                mi.itemPrice,
                mi.itemImageUrl,
                mi.isVeg,
                r.id,
                r.restaurantName,
                r.rating,
                r.deliveryTime,
                SUM(oi.quantity)
            )
            FROM OrderItem oi
            JOIN oi.menuItem mi
            JOIN mi.restaurant r
            WHERE mi.isAvailable = true AND r.isActive = true AND r.isDeleted = false
            GROUP BY mi.id, mi.itemName, mi.itemCategory, mi.itemPrice,
                     mi.itemImageUrl, mi.isVeg, r.id, r.restaurantName, r.rating, r.deliveryTime
            ORDER BY SUM(oi.quantity) DESC
            """)
    List<TrendingItemDTO> findTopTrendingItems(Pageable pageable);
}
