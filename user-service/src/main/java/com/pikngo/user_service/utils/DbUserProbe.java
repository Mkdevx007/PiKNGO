package com.pikngo.user_service.utils;

import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.entity.Restaurant;
import com.pikngo.user_service.entity.MenuItem;
import com.pikngo.user_service.repository.UserRepository;
import com.pikngo.user_service.repository.RestaurantRepository;
import com.pikngo.user_service.repository.MenuItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Optional;

@Component
public class DbUserProbe implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DbUserProbe.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    public DbUserProbe(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       RestaurantRepository restaurantRepository, MenuItemRepository menuItemRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
    }

    @Override
    public void run(String... args) {
        String adminPhone = "9999999999";
        log.info("Checking for admin user with phone: {}", adminPhone);

        Optional<User> existingAdmin = userRepository.findByPhoneNumber(adminPhone);
        if (existingAdmin.isEmpty()) {
            log.info("Admin user not found. Creating default admin...");
            User admin = User.builder()
                    .firstName("Super")
                    .lastName("Admin")
                    .email("admin@pikngo.com")
                    .phoneNumber(adminPhone)
                    .userPassword(passwordEncoder.encode("admin123"))
                    .role(User.UserRole.ADMIN)
                    .isActive(true)
                    .isDeleted(false)
                    .build();
            userRepository.save(admin);
            log.info("Default admin created successfully.");
        } else {
            log.info("Admin user already exists.");
        }

        // Check for test restaurant
        if (restaurantRepository.count() == 0) {
            log.info("No restaurants found. Creating default test restaurant...");
            Restaurant restaurant = new Restaurant();
            restaurant.setRestaurantName("PikNGo Premium Kitchen");
            restaurant.setAddress("Top tier multicuisine restaurant.");
            restaurant.setDeliveryTime("30-40 min");
            restaurant.setRating(4.8);
            restaurant.setActive(true);
            restaurantRepository.save(restaurant);
            log.info("Default test restaurant created successfully.");
        } else {
            log.info("Restaurants already exist in the database.");
        }

        // Fix null restaurant names
        restaurantRepository.findAll().forEach(restaurant -> {
            if (restaurant.getRestaurantName() == null || restaurant.getRestaurantName().isBlank()) {
                restaurant.setRestaurantName("PikNGo Premium Kitchen");
                restaurantRepository.save(restaurant);
                log.info("Fixed null name for restaurant id: {}", restaurant.getId());
            }
        });

        // Re-seed menu items for ALL restaurants that have fewer than 2 items
        log.info("Checking all restaurants for menu items...");
        restaurantRepository.findAll().forEach(restaurant -> {
            long itemCount = menuItemRepository.findByRestaurant(restaurant).size();
            if (itemCount < 3) {
                log.info("Re-seeding fresh menu items for: {}", restaurant.getRestaurantName());
                
                String category = restaurant.getCategory() != null ? restaurant.getCategory() : "General";
                
                if (category.equalsIgnoreCase("Italian")) {
                    seedItalian(restaurant);
                } else if (category.equalsIgnoreCase("Fast Food")) {
                    seedFastFood(restaurant);
                } else if (category.equalsIgnoreCase("Chinese") || category.equalsIgnoreCase("Asian")) {
                    seedAsian(restaurant);
                } else {
                    seedIndian(restaurant);
                }
            }
        });

        // Add additional sample restaurants if few exist
        if (restaurantRepository.count() < 6) {
            log.info("Adding more sample restaurants for variety...");
            
            Restaurant r1 = Restaurant.builder()
                .restaurantName("Pasta Paradise")
                .category("Italian")
                .address("Premium Italian Deli, Highway Block A")
                .imageUrl("https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80")
                .rating(4.7)
                .deliveryTime("25-35 min")
                .build();
            
            Restaurant r2 = Restaurant.builder()
                .restaurantName("Sushi Zen")
                .category("Asian")
                .address("Zen Garden, East Expressway")
                .imageUrl("https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80")
                .rating(4.9)
                .deliveryTime("40-50 min")
                .build();

            Restaurant r3 = Restaurant.builder()
                .restaurantName("The Taco Stand")
                .category("Mexican")
                .address("Spicy Junction, Metro Plaza")
                .imageUrl("https://images.unsplash.com/photo-1565299585323-38d6b08659d7?w=800&q=80")
                .rating(4.6)
                .deliveryTime("20-30 min")
                .build();

            Restaurant r4 = Restaurant.builder()
                .restaurantName("Green Garden Salads")
                .category("Healthy")
                .address("Organics Hub, Wellness Block")
                .imageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80")
                .rating(4.8)
                .deliveryTime("15-25 min")
                .build();

            Restaurant r5 = Restaurant.builder()
                .restaurantName("Mumbai Tadka")
                .category("Indian")
                .address("Spice Lane, Old City")
                .imageUrl("https://images.unsplash.com/photo-1585932231552-05b008d5df82?w=800&q=80")
                .rating(4.7)
                .deliveryTime("30-40 min")
                .build();

            restaurantRepository.save(r1);
            restaurantRepository.save(r2);
            restaurantRepository.save(r3);
            restaurantRepository.save(r4);
            restaurantRepository.save(r5);
            
            seedItalian(r1);
            seedAsian(r2);
            seedMexican(r3);
            seedHealthy(r4);
            seedIndian(r5);
        }
        
        log.info("Menu item check completed.");
    }

    private void seedIndian(Restaurant r) {
        menuItemRepository.save(MenuItem.builder()
            .itemName("Premium Butter Chicken").itemDescription("Rich creamy gravy with tender chicken.").itemPrice(new BigDecimal("350.00"))
            .itemCategory("North Indian").itemImageUrl("https://images.unsplash.com/photo-1603894584373-5ac82b6ae398?w=500").isAvailable(true).isVeg(false).restaurant(r).build());
        menuItemRepository.save(MenuItem.builder()
            .itemName("Paneer Tikka Masala").itemDescription("Grilled paneer in spicy tomato gravy.").itemPrice(new BigDecimal("280.00"))
            .itemCategory("North Indian").itemImageUrl("https://images.unsplash.com/photo-1596797038530-2c39fa81b4fc?w=500").isAvailable(true).isVeg(true).restaurant(r).build());
        menuItemRepository.save(MenuItem.builder()
            .itemName("Dal Makhani").itemDescription("Slow-cooked black lentils with cream.").itemPrice(new BigDecimal("220.00"))
            .itemCategory("North Indian").itemImageUrl("https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500").isAvailable(true).isVeg(true).restaurant(r).build());
    }

    private void seedItalian(Restaurant r) {
        menuItemRepository.save(MenuItem.builder()
            .itemName("Margherita Pizza").itemDescription("Fresh basil, mozzarella, and tomato.").itemPrice(new BigDecimal("399.00"))
            .itemCategory("Pizza").itemImageUrl("https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?w=500").isAvailable(true).isVeg(true).restaurant(r).build());
        menuItemRepository.save(MenuItem.builder()
            .itemName("Creamy Alfredo Pasta").itemDescription("Fettuccine in rich white sauce.").itemPrice(new BigDecimal("320.00"))
            .itemCategory("Pasta").itemImageUrl("https://images.unsplash.com/photo-1645112481338-3561ec819853?w=500").isAvailable(true).isVeg(true).restaurant(r).build());
        menuItemRepository.save(MenuItem.builder()
            .itemName("Truffle Mushroom Risotto").itemDescription("Arborio rice with wild mushrooms and truffle oil.").itemPrice(new BigDecimal("450.00"))
            .itemCategory("Main Course").itemImageUrl("https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500").isAvailable(true).isVeg(true).restaurant(r).build());
    }

    private void seedAsian(Restaurant r) {
        menuItemRepository.save(MenuItem.builder()
            .itemName("Signature Sushi Rolls").itemDescription("Fresh salmon and avocado rolls.").itemPrice(new BigDecimal("550.00"))
            .itemCategory("Sushi").itemImageUrl("https://images.unsplash.com/photo-1553621042-f6e147245754?w=500").isAvailable(true).isVeg(false).restaurant(r).build());
        menuItemRepository.save(MenuItem.builder()
            .itemName("Dynamic Dynamite Shrimp").itemDescription("Crispy shrimp tossed in spicy mayo.").itemPrice(new BigDecimal("420.00"))
            .itemCategory("Appetizer").itemImageUrl("https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500").isAvailable(true).isVeg(false).restaurant(r).build());
    }

    private void seedMexican(Restaurant r) {
        menuItemRepository.save(MenuItem.builder()
            .itemName("Zesty Taco Trio").itemDescription("Three soft tacos with choice of protein and salsa.").itemPrice(new BigDecimal("299.00"))
            .itemCategory("Tacos").itemImageUrl("https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500").isAvailable(true).isVeg(false).restaurant(r).build());
        menuItemRepository.save(MenuItem.builder()
            .itemName("Loaded Chicken Quesadilla").itemDescription("Cheese-filled tortilla with grilled chicken.").itemPrice(new BigDecimal("350.00"))
            .itemCategory("Entrée").itemImageUrl("https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=500").isAvailable(true).isVeg(false).restaurant(r).build());
    }

    private void seedHealthy(Restaurant r) {
        menuItemRepository.save(MenuItem.builder()
            .itemName("Quinoa Avocado Bowl").itemDescription("Nutrient-rich bowl with fresh veggies and nuts.").itemPrice(new BigDecimal("380.00"))
            .itemCategory("Salad").itemImageUrl("https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500").isAvailable(true).isVeg(true).restaurant(r).build());
        menuItemRepository.save(MenuItem.builder()
            .itemName("Greek Feta Salad").itemDescription("Classic Mediterranean salad with olives and feta.").itemPrice(new BigDecimal("320.00"))
            .itemCategory("Salad").itemImageUrl("https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500").isAvailable(true).isVeg(true).restaurant(r).build());
    }

    private void seedFastFood(Restaurant r) {
        menuItemRepository.save(MenuItem.builder()
            .itemName("Double Cheese Burger").itemDescription("Two flame-grilled patties with cheddar.").itemPrice(new BigDecimal("199.00"))
            .itemCategory("Burger").itemImageUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500").isAvailable(true).isVeg(false).restaurant(r).build());
        menuItemRepository.save(MenuItem.builder()
            .itemName("Crispy Peri-Peri Fries").itemDescription("Large portion of fries with spicy seasoning.").itemPrice(new BigDecimal("120.00"))
            .itemCategory("Sides").itemImageUrl("https://images.unsplash.com/photo-1573082833947-d87176f6b2e1?w=500").isAvailable(true).isVeg(true).restaurant(r).build());
    }
}
