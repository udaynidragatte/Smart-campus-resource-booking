CREATE DATABASE IF NOT EXISTS campusbook;
USE campusbook;

DROP TABLE IF EXISTS checkins;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS bus_locations;
DROP TABLE IF EXISTS buses;
DROP TABLE IF EXISTS principal_presence;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Student', 'Faculty', 'Admin') NOT NULL DEFAULT 'Student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE principal_presence (
  id INT AUTO_INCREMENT PRIMARY KEY,
  principal_name VARCHAR(120) NOT NULL,
  is_on_campus BOOLEAN NOT NULL DEFAULT FALSE,
  current_location VARCHAR(180),
  next_available_slot VARCHAR(120),
  notes TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE buses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  route_name VARCHAR(120) NOT NULL,
  driver_name VARCHAR(120) NOT NULL,
  status ENUM('On Route', 'Delayed', 'Arriving', 'Idle', 'Offline') NOT NULL DEFAULT 'Idle',
  next_stop VARCHAR(120),
  eta_minutes INT DEFAULT 0,
  speed_kmph INT DEFAULT 0,
  occupancy VARCHAR(20),
  stops JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE bus_locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bus_id INT NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bus_locations_bus FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
  INDEX idx_bus_location_latest (bus_id, recorded_at)
);

CREATE TABLE resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  type ENUM('Classroom', 'Lab', 'Seminar Hall', 'Court', 'Equipment') NOT NULL,
  capacity INT NOT NULL,
  location VARCHAR(180) NOT NULL,
  amenities JSON NOT NULL,
  status ENUM('Available', 'Pending', 'Booked', 'Maintenance') NOT NULL DEFAULT 'Available',
  projector_status ENUM('Working properly', 'Needs maintenance', 'Unavailable', 'Not applicable') NOT NULL DEFAULT 'Not applicable',
  image_url TEXT,
  utilization INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  resource_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  purpose TEXT NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') NOT NULL DEFAULT 'Pending',
  priority ENUM('Normal', 'Faculty priority') NOT NULL DEFAULT 'Normal',
  qr_payload TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  INDEX idx_booking_resource_time (resource_id, start_time, end_time),
  INDEX idx_booking_status (status)
);

CREATE TABLE checkins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  checkin_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  checkout_time DATETIME NULL,
  status ENUM('Checked In', 'Checked Out') NOT NULL DEFAULT 'Checked In',
  CONSTRAINT fk_checkins_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

