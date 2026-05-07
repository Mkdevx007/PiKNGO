package com.pikngo.user_service.service;

import com.pikngo.user_service.entity.Order;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class LoyaltyService {

    private final UserRepository userRepository;

    public LoyaltyService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public Long awardPoints(Order order) {
        User user = order.getUser();
        if (user == null) return 0L;

        // Ratio: 10 points per 100 currency units
        BigDecimal totalAmount = order.getTotalAmount();
        long pointsToAward = totalAmount.divide(BigDecimal.valueOf(10)).longValue();

        Long currentPoints = user.getLoyaltyPoints();
        if (currentPoints == null) currentPoints = 0L;
        
        user.setLoyaltyPoints(currentPoints + pointsToAward);
        updateUserTier(user);
        
        userRepository.save(user);
        return pointsToAward;
    }

    private void updateUserTier(User user) {
        long points = user.getLoyaltyPoints();
        if (points >= 5000) {
            user.setVaultTier("ELITE");
        } else if (points >= 1500) {
            user.setVaultTier("GOLD");
        } else {
            user.setVaultTier("SILVER");
        }
    }
}
