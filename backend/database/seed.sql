USE campusbook;

INSERT INTO users (name, email, password, role) VALUES
('Student Demo', 'student@campusbook.edu', '$2a$10$E36VVI2RABYs2l0I4ZWPq.a1Q70kVkeUYrmNKoHy/GoPfm2GOhYr6', 'Student'),
('Faculty Demo', 'faculty@campusbook.edu', '$2a$10$JZBa3EGSfyldZWEYGl8yku8Z1IBvcBLYEEiahi1k51Z65ByDb34iG', 'Faculty'),
('Admin Demo', 'admin@campusbook.edu', '$2a$10$Wz1f.Dl21DLcwLAu7k3y8es3BVS2UW/bN.oo0ly6ABaZF0CAw8fma', 'Admin');

INSERT INTO resources (name, type, capacity, location, amenities, status, projector_status, image_url, utilization)
VALUES
('Classroom 1', 'Classroom', 56, 'Academic Block, Floor 1', JSON_ARRAY('Smart Board', 'Projector', 'WiFi'), 'Available', 'Working properly', 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80', 42),
('Classroom 2', 'Classroom', 64, 'Academic Block, Floor 1', JSON_ARRAY('Whiteboard', 'Podium', 'AC'), 'Booked', 'Working properly', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80', 77),
('Classroom 3', 'Classroom', 72, 'Academic Block, Floor 2', JSON_ARRAY('Projector', 'Recording', 'WiFi'), 'Pending', 'Needs maintenance', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80', 61),
('CS Lab 1', 'Lab', 40, 'Research Block, Floor 1', JSON_ARRAY('GPU Workstations', 'Projector', 'High-speed WiFi'), 'Available', 'Not applicable', 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1200&q=80', 70),
('CS Lab 2', 'Lab', 48, 'Research Block, Floor 2', JSON_ARRAY('Lab Benches', 'Safety Kit', 'Whiteboard'), 'Booked', 'Not applicable', 'https://images.unsplash.com/photo-1581093458791-9d15482442f6?auto=format&fit=crop&w=1200&q=80', 82),
('Seminar Hall A', 'Seminar Hall', 180, 'Admin Block, Floor 1', JSON_ARRAY('Stage', 'Audio System', 'Recording'), 'Pending', 'Not applicable', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80', 64),
('Basketball Court', 'Court', 30, 'Sports Complex, Floor 1', JSON_ARRAY('Floodlights', 'Changing Room', 'Scoreboard'), 'Available', 'Not applicable', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80', 49);

INSERT INTO bookings (user_id, resource_id, start_time, end_time, purpose, status, priority, qr_payload)
VALUES
(2, 4, '2026-05-10 10:00:00', '2026-05-10 12:00:00', 'ML workshop', 'Approved', 'Faculty priority', 'BK-1-CSLAB1'),
(1, 6, '2026-05-10 14:00:00', '2026-05-10 16:00:00', 'Club orientation', 'Pending', 'Normal', NULL),
(1, 7, '2026-05-11 17:00:00', '2026-05-11 18:30:00', 'Inter-department practice', 'Approved', 'Normal', 'BK-3-COURT');

INSERT INTO principal_presence (principal_name, is_on_campus, current_location, next_available_slot, notes)
VALUES ('Dr. Meera Krishnan', TRUE, 'Administration Block, Principal Office', '2:30 PM - 3:15 PM', 'Available for approved student/faculty appointments after lunch.');

INSERT INTO buses (code, route_name, driver_name, status, next_stop, eta_minutes, speed_kmph, occupancy, stops)
VALUES
('BUS-01', 'Hostel Loop', 'Ravi Kumar', 'On Route', 'Library Gate', 6, 28, '34/48', JSON_ARRAY('Main Gate', 'Admin Block', 'Library Gate', 'Hostel A', 'Sports Complex')),
('BUS-02', 'City Pickup', 'Anita Rao', 'Delayed', 'Main Gate', 14, 18, '41/48', JSON_ARRAY('City Stop', 'Metro Point', 'Main Gate', 'Academic Block', 'Labs Block')),
('BUS-03', 'Labs Express', 'Suresh Nair', 'Arriving', 'Research Block', 2, 12, '22/42', JSON_ARRAY('Main Gate', 'CSE Block', 'Research Block', 'Seminar Hall', 'Parking Bay'));

INSERT INTO bus_locations (bus_id, latitude, longitude)
VALUES
(1, 17.4450000, 78.3490000),
(2, 17.4520000, 78.3560000),
(3, 17.4410000, 78.3460000);
