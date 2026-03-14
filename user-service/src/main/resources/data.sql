INSERT INTO restaurants (_id, resturant_name, address, latitude, longitude, is_active, is_deleted)
VALUES 
(gen_random_uuid(), 'Highway King - Jaipur', 'NH-8, Jaipur - Delhi Highway', 26.9124, 75.7873, true, false),
(gen_random_uuid(), 'Haldiram - Gurgaon', 'Sector 34, Gurgaon, Delhi-Jaipur Highway', 28.4595, 77.0266, true, false),
(gen_random_uuid(), 'Old Rao Dhaba', 'NH-8, Manesar, Gurgaon', 28.3533, 76.9168, true, false),
(gen_random_uuid(), 'McD - Behror', 'Neemrana, NH-8, Rajasthan', 27.8872, 76.2801, true, false),
(gen_random_uuid(), 'Burger King - Surat', 'Surat-Mumbai Highway, Gujarat', 21.1702, 72.8311, true, false),
(gen_random_uuid(), 'Vithal Kamat - Manor', 'NH-48, Palghar, Maharashtra', 19.7226, 72.9366, true, false),
(gen_random_uuid(), 'Hotel Kinara - Lonavala', 'Old Mumbai-Pune Highway', 18.7557, 73.4091, true, false),
(gen_random_uuid(), 'Sunny Da Dhaba', 'Old Mumbai Pune Highway, Pune', 18.7523, 73.4414, true, false);
