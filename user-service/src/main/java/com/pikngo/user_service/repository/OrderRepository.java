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
    List<Order> findByStatusAndRiderIsNull(Order.OrderStatus status);
    List<Order> findByRiderIdOrderByCreatedTsDesc(UUID riderId);

    long countByIsSelfPickupFalse();
    long countByIsSelfPickupTrue();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED'")
    java.math.BigDecimal calculateTotalRevenue();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.restaurant.id = :restaurantId AND o.status = 'DELIVERED'")
    java.math.BigDecimal calculateRestaurantRevenue(UUID restaurantId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM Order o WHERE o.restaurant.id = :restaurantId")
    long countByRestaurantId(UUID restaurantId);

    @Query("SELECT mi.itemName, SUM(oi.quantity) FROM OrderItem oi JOIN oi.menuItem mi WHERE mi.restaurant.id = :restaurantId GROUP BY mi.itemName ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopItemsByRestaurant(UUID restaurantId, Pageable pageable);

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

    @Query(value = "SELECT CAST(created_ts AS DATE) as date, SUM(total_amount) as revenue, COUNT(*) as count " +
                   "FROM orders WHERE status = 'DELIVERED' AND created_ts >= CURRENT_DATE - INTERVAL '7 days' " +
                   "GROUP BY CAST(created_ts AS DATE) ORDER BY date ASC", nativeQuery = true)
    List<Object[]> findWeeklyRevenue();

    @Query(value = "SELECT status, COUNT(*) as count FROM orders GROUP BY status", nativeQuery = true)
    List<Object[]> findOrderStatusCounts();

    @Query(value = "SELECT r.restaurant_name as name, SUM(o.total_amount) as value " +
                   "FROM orders o JOIN restaurants r ON o.restaurant_id = r._id " +
                   "WHERE o.status = 'DELIVERED' " +
                   "GROUP BY r.restaurant_name ORDER BY value DESC LIMIT 5", nativeQuery = true)
    List<Object[]> findTopRestaurantsByRevenue();
}
