-- Test User: password is 'password'
INSERT INTO users (_id, first_name, last_name, email, phone_number, user_password, role, is_active, is_deleted)
VALUES ('e1a2b3c4-e5f6-7890-abcd-ef1234567899', 'Admin', 'User', 'admin@pikngo.com', '9999999999', '$2a$10$OOV2Gh68FWuVndMuKMhvJ.3S63ZjvgtGTF3uAuup/497kbJIgbliK', 'ADMIN', true, false)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (_id, first_name, last_name, email, phone_number, user_password, role, is_active, is_deleted)
VALUES (gen_random_uuid(), 'Dev', 'Admin', 'welcomedevil006@gmail.com', '8888888888', '$2a$10$OOV2Gh68FWuVndMuKMhvJ.3S63ZjvgtGTF3uAuup/497kbJIgbliK', 'ADMIN', true, false)
ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';

-- No dummy restaurants or menu items. Only admin users.
-- To clear existing data once, these lines will run on backend restart:
DELETE FROM order_items;
DELETE FROM menu_items;
DELETE FROM orders;
DELETE FROM restaurants;
