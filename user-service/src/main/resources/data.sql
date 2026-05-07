-- Test User: password is 'password'
INSERT INTO users (_id, first_name, last_name, email, phone_number, user_password, role, is_active, is_deleted)
VALUES ('e1a2b3c4-e5f6-7890-abcd-ef1234567899', 'Admin', 'User', 'admin@pikngo.com', '9999999999', '$2a$10$OOV2Gh68FWuVndMuKMhvJ.3S63ZjvgtGTF3uAuup/497kbJIgbliK', 'ADMIN', true, false)
ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';

INSERT INTO users (_id, first_name, last_name, email, phone_number, user_password, role, is_active, is_deleted)
VALUES (gen_random_uuid(), 'Dev', 'Admin', 'welcomedevil006@gmail.com', '8888888888', '$2a$10$OOV2Gh68FWuVndMuKMhvJ.3S63ZjvgtGTF3uAuup/497kbJIgbliK', 'ADMIN', true, false)
ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';

-- Insert Dummy Restaurants across major hubs
INSERT INTO restaurants (_id, restaurant_name, address, latitude, longitude, image_url, category, rating, delivery_time, is_active, is_deleted)
VALUES
('f2b3c4d5-e6f7-8901-abcd-ef1234567891', 'Biryani Blues', '123 Main Street, New Delhi', 28.6139, 77.2090, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0', 'Indian', 4.5, '30 min', true, false),
('f2b3c4d5-e6f7-8901-abcd-ef1234567892', 'Pizza Hut', '456 Elm Street, New Delhi', 28.6200, 77.2100, 'https://images.unsplash.com/photo-1513104890138-7c749659a591', 'Italian', 4.2, '45 min', true, false),
('f2b3c4d5-e6f7-8901-abcd-ef1234567893', 'Burger King', '789 Oak Street, New Delhi', 28.6250, 77.2150, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add', 'Fast Food', 4.0, '25 min', true, false),
('f2b3c4d5-e6f7-8901-abcd-ef1234567894', 'The Taj Mahal Palace', 'Apollo Bunder, Colaba, Mumbai', 18.9217, 72.8333, 'https://images.unsplash.com/photo-1566073771259-6a8506099945', 'Indian', 4.9, '50 min', true, false),
('f2b3c4d5-e6f7-8901-abcd-ef1234567895', 'Marine Drive Social', 'Intercontinental, Marine Drive, Mumbai', 18.9322, 72.8228, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b', 'Fast Food', 4.4, '35 min', true, false),
('f2b3c4d5-e6f7-8901-abcd-ef1234567896', 'Deccan Delight', 'FC Road, Deccan Gymkhana, Pune', 18.5173, 73.8400, 'https://images.unsplash.com/photo-1552566626-52f8b828add9', 'Indian', 4.6, '20 min', true, false),
('f2b3c4d5-e6f7-8901-abcd-ef1234567897', 'IT Park Hub', 'Hinjewadi Phase 1, Pune', 18.5913, 73.7389, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5', 'Chinese', 4.3, '30 min', true, false)
ON CONFLICT (_id) DO NOTHING;

-- Insert Menu Items (Fixed schema alignment: item_name, item_price, etc.)
INSERT INTO menu_items (id, item_name, item_price, item_description, item_category, restaurant_id, is_available, is_veg)
VALUES
-- Biryani Blues
(gen_random_uuid(), 'Hyderabadi Chicken Biryani', 350.0, 'Authentic spicy Hyderabadi biryani with juicy chicken.', 'Main Course', 'f2b3c4d5-e6f7-8901-abcd-ef1234567891', true, false),
(gen_random_uuid(), 'Mutton Galouti Kebab', 450.0, 'Melt-in-mouth mutton kebabs served with mint chutney.', 'Starter', 'f2b3c4d5-e6f7-8901-abcd-ef1234567891', true, false),
-- Pizza Hut
(gen_random_uuid(), 'Margherita Pizza', 299.0, 'Classic tomato sauce, mozzarella, and fresh basil.', 'Main Course', 'f2b3c4d5-e6f7-8901-abcd-ef1234567892', true, true),
(gen_random_uuid(), 'Pepperoni Feast', 499.0, 'Loaded with double pepperoni and extra cheese.', 'Main Course', 'f2b3c4d5-e6f7-8901-abcd-ef1234567892', true, false),
-- Burger King
(gen_random_uuid(), 'Whopper Junior', 189.0, 'Flame-grilled beef patty with fresh veggies.', 'Main Course', 'f2b3c4d5-e6f7-8901-abcd-ef1234567893', true, false),
(gen_random_uuid(), 'Crispy Chicken Fries', 149.0, 'Lightly breaded white meat chicken, seasoned to perfection.', 'Side', 'f2b3c4d5-e6f7-8901-abcd-ef1234567893', true, false),
-- The Taj Mahal Palace (Mumbai)
(gen_random_uuid(), 'Shahi Tukda Premium', 550.0, 'Rich bread pudding dessert with saffron and nuts.', 'Dessert', 'f2b3c4d5-e6f7-8901-abcd-ef1234567894', true, true),
(gen_random_uuid(), 'Lobster Thermidor', 1850.0, 'Classic French dish with cream and cheese.', 'Main Course', 'f2b3c4d5-e6f7-8901-abcd-ef1234567894', true, false),
-- Marine Drive Social (Mumbai)
(gen_random_uuid(), 'Death Wing Platter', 650.0, 'Spicy buffalo wings with blue cheese dip.', 'Starter', 'f2b3c4d5-e6f7-8901-abcd-ef1234567895', true, false),
(gen_random_uuid(), 'Gunpowder Calamari', 450.0, 'Fried calamari with south Indian spices.', 'Starter', 'f2b3c4d5-e6f7-8901-abcd-ef1234567895', true, false),
-- Deccan Delight (Pune)
(gen_random_uuid(), 'Misal Pav Extreme', 120.0, 'Spicy sprout curry served with soft pav.', 'Snack', 'f2b3c4d5-e6f7-8901-abcd-ef1234567896', true, true),
(gen_random_uuid(), 'Puran Poli with Ghee', 150.0, 'Sweet flatbread made of lentils and jaggery.', 'Dessert', 'f2b3c4d5-e6f7-8901-abcd-ef1234567896', true, true),
-- IT Park Hub (Pune)
(gen_random_uuid(), 'Schezwan Noodles', 220.0, 'Spicy stir-fried noodles with veggies.', 'Main Course', 'f2b3c4d5-e6f7-8901-abcd-ef1234567897', true, true),
(gen_random_uuid(), 'Honey Chilli Potato', 180.0, 'Crispy potatoes tossed in sweet and spicy sauce.', 'Starter', 'f2b3c4d5-e6f7-8901-abcd-ef1234567897', true, true);

-- Insert Promotions
INSERT INTO promotions (code, discount_percent, is_active, expiry_date) 
VALUES ('WELCOME50', 50.0, true, '2026-12-31 23:59:59+00'), 
       ('PIKNGO20', 20.0, true, '2026-12-31 23:59:59+00')
ON CONFLICT (code) DO NOTHING;
