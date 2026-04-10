-- Test User: password is 'password'
INSERT INTO users (_id, first_name, last_name, email, phone_number, user_password, role, is_active, is_deleted)
VALUES ('e1a2b3c4-e5f6-7890-abcd-ef1234567899', 'Admin', 'User', 'admin@pikngo.com', '9999999999', '$2a$10$OOV2Gh68FWuVndMuKMhvJ.3S63ZjvgtGTF3uAuup/497kbJIgbliK', 'ADMIN', true, false)
ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';

INSERT INTO users (_id, first_name, last_name, email, phone_number, user_password, role, is_active, is_deleted)
VALUES (gen_random_uuid(), 'Dev', 'Admin', 'welcomedevil006@gmail.com', '8888888888', '$2a$10$OOV2Gh68FWuVndMuKMhvJ.3S63ZjvgtGTF3uAuup/497kbJIgbliK', 'ADMIN', true, false)
ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';

-- Insert Dummy Restaurants
INSERT INTO restaurants (_id, restaurant_name, address, latitude, longitude, image_url, category, rating, delivery_time, is_active, is_deleted)
VALUES
('f2b3c4d5-e6f7-8901-abcd-ef1234567891', 'Biryani Blues', '123 Main Street, New Delhi', 28.6139, 77.2090, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0', 'Indian', 4.5, '30 min', true, false),
('f2b3c4d5-e6f7-8901-abcd-ef1234567892', 'Pizza Hut', '456 Elm Street, New Delhi', 28.6200, 77.2100, 'https://images.unsplash.com/photo-1513104890138-7c749659a591', 'Italian', 4.2, '45 min', true, false),
('f2b3c4d5-e6f7-8901-abcd-ef1234567893', 'Burger King', '789 Oak Street, New Delhi', 28.6250, 77.2150, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add', 'Fast Food', 4.0, '25 min', true, false)
ON CONFLICT (_id) DO NOTHING;

-- Insert Menu Items
INSERT INTO menu_items (id, name, price, description, category, restaurant_id)
VALUES
(gen_random_uuid(), 'Hyderabadi Chicken Biryani', 350.0, 'Authentic spicy Hyderabadi biryani with juicy chicken.', 'Main Course', 'f2b3c4d5-e6f7-8901-abcd-ef1234567891'),
(gen_random_uuid(), 'Mutton Galouti Kebab', 450.0, 'Melt-in-mouth mutton kebabs served with mint chutney.', 'Starter', 'f2b3c4d5-e6f7-8901-abcd-ef1234567891'),
(gen_random_uuid(), 'Margherita Pizza', 299.0, 'Classic tomato sauce, mozzarella, and fresh basil.', 'Main Course', 'f2b3c4d5-e6f7-8901-abcd-ef1234567892'),
(gen_random_uuid(), 'Pepperoni Feast', 499.0, 'Loaded with double pepperoni and extra cheese.', 'Main Course', 'f2b3c4d5-e6f7-8901-abcd-ef1234567892'),
(gen_random_uuid(), 'Whopper Junior', 189.0, 'Flame-grilled beef patty with fresh veggies.', 'Main Course', 'f2b3c4d5-e6f7-8901-abcd-ef1234567893'),
(gen_random_uuid(), 'Crispy Chicken Fries', 149.0, 'Lightly breaded white meat chicken, seasoned to perfection.', 'Side', 'f2b3c4d5-e6f7-8901-abcd-ef1234567893');

-- Insert Promotions
INSERT INTO promotions (code, discount_percent, is_active, expiry_date) 
VALUES ('WELCOME50', 50.0, true, '2026-12-31 23:59:59+00'), 
       ('PIKNGO20', 20.0, true, '2026-12-31 23:59:59+00')
ON CONFLICT (code) DO NOTHING;
