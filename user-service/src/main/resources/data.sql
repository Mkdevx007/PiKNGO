-- Test User: password is 'password'
INSERT INTO users (_id, first_name, last_name, email, phone_number, user_password, role, is_active, is_deleted)
VALUES ('e1a2b3c4-e5f6-7890-abcd-ef1234567899', 'Admin', 'User', 'admin@pikngo.com', '9999999999', '$2a$10$OOV2Gh68FWuVndMuKMhvJ.3S63ZjvgtGTF3uAuup/497kbJIgbliK', 'ADMIN', true, false)
ON CONFLICT DO NOTHING;

-- Existing Restaurants
INSERT INTO restaurants (_id, resturant_name, address, latitude, longitude, is_active, is_deleted, category, rating, delivery_time, image_url)
VALUES ('d1a2b3c4-e5f6-7890-abcd-ef1234567890', 'Highway King - Jaipur', 'NH-8, Jaipur - Delhi Highway', 26.9124, 75.7873, true, false, 'North Indian', 4.8, '20-25 min', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b')
ON CONFLICT DO NOTHING;

INSERT INTO restaurants (_id, resturant_name, address, latitude, longitude, is_active, is_deleted, category, rating, delivery_time, image_url)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567891', 'Haldiram - Gurgaon', 'Sector 34, Gurgaon', 28.4595, 77.0266, true, false, 'Indian Snacks', 4.6, '15-20 min', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe')
ON CONFLICT DO NOTHING;

-- Additional Restaurants
INSERT INTO restaurants (_id, resturant_name, address, latitude, longitude, is_active, is_deleted, category, rating, delivery_time)
VALUES 
(gen_random_uuid(), 'Old Rao Dhaba', 'NH-8, Manesar, Gurgaon', 28.3533, 76.9168, true, false, 'Regional', 4.4, '30 min'),
(gen_random_uuid(), 'McD - Behror', 'Neemrana, NH-8, Rajasthan', 27.8872, 76.2801, true, false, 'Fast Food', 4.2, '15 min'),
(gen_random_uuid(), 'Burger King - Surat', 'Surat-Mumbai Highway, Gujarat', 21.1702, 72.8311, true, false, 'Fast Food', 4.1, '20 min'),
(gen_random_uuid(), 'Vithal Kamat - Manor', 'NH-48, Palghar, Maharashtra', 19.7226, 72.9366, true, false, 'Pure Veg', 4.5, '25 min'),
(gen_random_uuid(), 'Hotel Kinara - Lonavala', 'Old Mumbai-Pune Highway', 18.7557, 73.4091, true, false, 'Family Dining', 4.7, '35 min'),
(gen_random_uuid(), 'Sunny Da Dhaba', 'Old Mumbai Pune Highway, Pune', 18.7523, 73.4414, true, false, 'Dhaba', 4.3, '40 min')
ON CONFLICT DO NOTHING;

-- Menu Items
INSERT INTO menu_items (id, name, price, description, category, restaurant_id, created_at)
VALUES ('b1a2b3c4-e5f6-7890-abcd-ef1234567892', 'Dal Makhani', 320, 'Premium black lentils.', 'Main', 'd1a2b3c4-e5f6-7890-abcd-ef1234567890', now())
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (id, name, price, description, category, restaurant_id, created_at)
VALUES ('b1a2b3c4-e5f6-7890-abcd-ef1234567893', 'Chole Bhature', 180, 'Classic chickpeas.', 'Main', 'a1b2c3d4-e5f6-7890-abcd-ef1234567891', now())
ON CONFLICT DO NOTHING;
