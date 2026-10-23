-- ============================================================================
-- Blood Bank Management System (BBMS) - Comprehensive Sample Seed Data
-- Database Target: MySQL 8.0+
-- File: database/sample_data.sql
-- Dataset: 37 Users (Donors, Requesters, Staff, Admins), Hospitals, Banks,
--          Appointments, Clinical Tests, Blood Units, Requests & Allocations
-- ============================================================================

USE `blood_bank_db`;

-- Temporarily disable foreign keys for clean data loading
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS = 0;

-- Clean existing data in reverse dependency order
DELETE FROM `allocations`;
DELETE FROM `blood_requests`;
DELETE FROM `requesters`;
DELETE FROM `blood_units`;
DELETE FROM `donations`;
DELETE FROM `donation_appointments`;
DELETE FROM `medical_tests`;
DELETE FROM `appointments`;
DELETE FROM `blood_bank_staff`;
DELETE FROM `blood_banks`;
DELETE FROM `hospitals`;
DELETE FROM `donor_health`;
DELETE FROM `donors`;
DELETE FROM `users`;

-- Reset auto-increments
ALTER TABLE `users` AUTO_INCREMENT = 1;
ALTER TABLE `donors` AUTO_INCREMENT = 1;
ALTER TABLE `donor_health` AUTO_INCREMENT = 1;
ALTER TABLE `hospitals` AUTO_INCREMENT = 1;
ALTER TABLE `blood_banks` AUTO_INCREMENT = 1;
ALTER TABLE `appointments` AUTO_INCREMENT = 1;
ALTER TABLE `medical_tests` AUTO_INCREMENT = 1;
ALTER TABLE `donation_appointments` AUTO_INCREMENT = 1;
ALTER TABLE `donations` AUTO_INCREMENT = 1;
ALTER TABLE `blood_units` AUTO_INCREMENT = 1;
ALTER TABLE `requesters` AUTO_INCREMENT = 1;
ALTER TABLE `blood_requests` AUTO_INCREMENT = 1;
ALTER TABLE `allocations` AUTO_INCREMENT = 1;

-- Default password hash for 'Password123!' (Bcrypt)
SET @DEFAULT_PW = '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

-- ----------------------------------------------------------------------------
-- 1. USERS (37 Persons: 3 Admins, 4 Bank Staff, 4 Hospital Staff, 20 Donors, 6 Requesters)
-- ----------------------------------------------------------------------------
INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `email`, `password_hash`, `phone`, `gender`, `date_of_birth`, `address`, `role`) VALUES
-- System Administrators
(1, 'Admin', 'System', 'admin@bbms.org', @DEFAULT_PW, '+1-555-0101', 'OTHER', '1985-05-15', '100 Healthcare Blvd, Suite 400', 'ADMIN'),
(2, 'Sarah', 'Connor', 'sconnor@bbms.org', @DEFAULT_PW, '+1-555-0102', 'FEMALE', '1988-03-20', '102 Tech Plaza, Sector 4', 'ADMIN'),
(3, 'Alexander', 'Pierce', 'apierce@bbms.org', @DEFAULT_PW, '+1-555-0103', 'MALE', '1982-11-12', '45 Executive Center Way', 'ADMIN'),

-- Blood Bank Staff
(4, 'Dr. Robert', 'Chen', 'robert.chen@metroblood.org', @DEFAULT_PW, '+1-555-0111', 'MALE', '1980-08-22', '12 Medical Center Way', 'BLOOD_BANK_STAFF'),
(5, 'Jessica', 'Alba', 'jalba@redribbon.org', @DEFAULT_PW, '+1-555-0112', 'FEMALE', '1991-04-14', '88 Hope Boulevard, Apt 4B', 'BLOOD_BANK_STAFF'),
(6, 'Vikram', 'Malhotra', 'vmalhotra@metroblood.org', @DEFAULT_PW, '+1-555-0113', 'MALE', '1987-09-30', '34 Harbor View St', 'BLOOD_BANK_STAFF'),
(7, 'Emily', 'Watson', 'ewatson@lifeline.org', @DEFAULT_PW, '+1-555-0114', 'FEMALE', '1993-01-19', '19 Sunrise Ave', 'BLOOD_BANK_STAFF'),

-- Hospital Staff / Screening Officers
(8, 'Nurse Sarah', 'Jenkins', 'sjenkins@citygeneral.org', @DEFAULT_PW, '+1-555-0121', 'FEMALE', '1990-03-11', '45 Red Cross Plaza', 'HOSPITAL_STAFF'),
(9, 'Dr. Gregory', 'House', 'ghouse@saintjude.org', @DEFAULT_PW, '+1-555-0122', 'MALE', '1975-06-11', '221 Baker Street', 'HOSPITAL_STAFF'),
(10, 'Dr. Allison', 'Cameron', 'acameron@mercycare.org', @DEFAULT_PW, '+1-555-0123', 'FEMALE', '1989-10-05', '14 Princeton Plains', 'HOSPITAL_STAFF'),
(11, 'Nurse David', 'Palmer', 'dpalmer@citygeneral.org', @DEFAULT_PW, '+1-555-0124', 'MALE', '1994-07-25', '77 Civic Center Rd', 'HOSPITAL_STAFF'),

-- Donors (20 Persons)
(12, 'Marcus', 'Vance', 'marcus.v@email.com', @DEFAULT_PW, '+1-555-0201', 'MALE', '1995-11-04', '742 Evergreen Terrace', 'DONOR'),
(13, 'Elena', 'Rostova', 'elena.rostova@email.com', @DEFAULT_PW, '+1-555-0202', 'FEMALE', '1998-02-18', '221B Baker St Apt 3', 'DONOR'),
(14, 'David', 'Kim', 'david.kim@email.com', @DEFAULT_PW, '+1-555-0203', 'MALE', '1992-07-29', '88 Maple Drive', 'DONOR'),
(15, 'Priya', 'Sharma', 'priya.sharma@email.com', @DEFAULT_PW, '+1-555-0204', 'FEMALE', '1996-05-14', '14 Lotus Garden Way', 'DONOR'),
(16, 'Carlos', 'Mendoza', 'carlos.m@email.com', @DEFAULT_PW, '+1-555-0205', 'MALE', '1989-12-03', '520 Mission St', 'DONOR'),
(17, 'Aisha', 'Khan', 'aisha.khan@email.com', @DEFAULT_PW, '+1-555-0206', 'FEMALE', '1997-08-21', '33 Crescent Park', 'DONOR'),
(18, 'Liam', 'OConnor', 'liam.oc@email.com', @DEFAULT_PW, '+1-555-0207', 'MALE', '1993-04-17', '19 Dublin Road', 'DONOR'),
(19, 'Chloe', 'Dupont', 'chloe.dupont@email.com', @DEFAULT_PW, '+1-555-0208', 'FEMALE', '2000-09-09', '8 Rue Lafayette', 'DONOR'),
(20, 'Kavita', 'Patel', 'kavita.p@email.com', @DEFAULT_PW, '+1-555-0209', 'FEMALE', '1994-01-28', '104 Gandhi Nagar', 'DONOR'),
(21, 'Lucas', 'Silva', 'lucas.silva@email.com', @DEFAULT_PW, '+1-555-0210', 'MALE', '1991-03-15', '41 Paulista Ave', 'DONOR'),
(22, 'Hannah', 'Schmidt', 'hannah.s@email.com', @DEFAULT_PW, '+1-555-0211', 'FEMALE', '1995-06-23', '67 Berliner Str', 'DONOR'),
(23, 'Ahmed', 'Mansoor', 'ahmed.m@email.com', @DEFAULT_PW, '+1-555-0212', 'MALE', '1990-10-18', '21 Palm Jumeirah St', 'DONOR'),
(24, 'Grace', 'Hopper', 'grace.h@email.com', @DEFAULT_PW, '+1-555-0213', 'FEMALE', '1987-12-09', '101 Binary Lane', 'DONOR'),
(25, 'Samuel', 'Jackson', 'samuel.j@email.com', @DEFAULT_PW, '+1-555-0214', 'MALE', '1986-07-04', '99 Sunset Blvd', 'DONOR'),
(26, 'Mei', 'Ling', 'mei.ling@email.com', @DEFAULT_PW, '+1-555-0215', 'FEMALE', '1999-11-30', '88 Victoria Peak Rd', 'DONOR'),
(27, 'Tariq', 'Ziyad', 'tariq.z@email.com', @DEFAULT_PW, '+1-555-0216', 'MALE', '1994-04-05', '15 Andalus Court', 'DONOR'),
(28, 'Olivia', 'Brown', 'olivia.b@email.com', @DEFAULT_PW, '+1-555-0217', 'FEMALE', '1996-08-16', '210 Riverbend Way', 'DONOR'),
(29, 'Benjamin', 'Franklin', 'ben.f@email.com', @DEFAULT_PW, '+1-555-0218', 'MALE', '1992-01-17', '1706 Liberty St', 'DONOR'),
(30, 'Deepa', 'Nair', 'deepa.nair@email.com', @DEFAULT_PW, '+1-555-0219', 'FEMALE', '1993-05-27', '5 Backwater Boulevard', 'DONOR'),
(31, 'Noah', 'Taylor', 'noah.taylor@email.com', @DEFAULT_PW, '+1-555-0220', 'MALE', '1997-02-14', '73 Highland Ave', 'DONOR'),

-- Requesters (6 Persons)
(32, 'Claire', 'Delacroix', 'claire.d@email.com', @DEFAULT_PW, '+1-555-0301', 'FEMALE', '1988-09-14', '304 Oakwood Ave', 'REQUESTER'),
(33, 'James', 'Wilson', 'jwilson@metrocoord.org', @DEFAULT_PW, '+1-555-0302', 'MALE', '1982-12-05', '500 Civic Hospital Wing', 'REQUESTER'),
(34, 'Sunita', 'Rao', 'sunita.rao@email.com', @DEFAULT_PW, '+1-555-0303', 'FEMALE', '1979-04-20', '12 Shivaji Park', 'REQUESTER'),
(35, 'George', 'Costanza', 'george.c@email.com', @DEFAULT_PW, '+1-555-0304', 'MALE', '1984-06-08', '1344 Queens Blvd', 'REQUESTER'),
(36, 'Fatima', 'Al-Sayed', 'fatima.s@email.com', @DEFAULT_PW, '+1-555-0305', 'FEMALE', '1991-10-12', '77 Corniche Road', 'REQUESTER'),
(37, 'Anthony', 'Hopkins', 'ahopkins@email.com', @DEFAULT_PW, '+1-555-0306', 'MALE', '1976-12-31', '90 Margam Road', 'REQUESTER');

-- ----------------------------------------------------------------------------
-- 2. HOSPITALS (3 Facilities)
-- ----------------------------------------------------------------------------
INSERT INTO `hospitals` (`hospital_id`, `name`, `license_number`, `phone`, `email`, `address`) VALUES
(1, 'City General Hospital', 'HOSP-LIC-2024-001', '+1-555-8001', 'admissions@citygeneral.org', '100 Medical Center Dr, Metro City'),
(2, 'Saint Jude Trauma & Care', 'HOSP-LIC-2024-002', '+1-555-8002', 'er@saintjudehealth.org', '450 Mercy Way, Metro City'),
(3, 'Mercy Pediatric & Emergency', 'HOSP-LIC-2024-003', '+1-555-8003', 'pediatrics@mercycare.org', '12 Hope Parkway, Metro City');

-- ----------------------------------------------------------------------------
-- 3. BLOOD BANKS (3 Storage & Distribution Hubs)
-- ----------------------------------------------------------------------------
INSERT INTO `blood_banks` (`blood_bank_id`, `name`, `license_number`, `phone`, `email`, `address`) VALUES
(1, 'Central Metro Blood Bank', 'BB-LIC-2024-101', '+1-555-9001', 'inventory@metrobloodbank.org', '10 Lifeline Ave, Metro City'),
(2, 'Regional Red Ribbon Bank', 'BB-LIC-2024-102', '+1-555-9002', 'operations@redribbonblood.org', '88 Hope Boulevard, Metro City'),
(3, 'Lifeline Community Blood Center', 'BB-LIC-2024-103', '+1-555-9003', 'stock@lifelineblood.org', '200 Community Plaza, Metro City');

-- ----------------------------------------------------------------------------
-- 4. BLOOD BANK STAFF ASSIGNMENTS
-- ----------------------------------------------------------------------------
INSERT INTO `blood_bank_staff` (`user_id`, `blood_bank_id`, `designation`) VALUES
(4, 1, 'Lead Inventory Officer'),
(5, 2, 'Senior Blood Bank Technologist'),
(6, 1, 'Quality Assurance Manager'),
(7, 3, 'Blood Bank Operations Officer');

-- ----------------------------------------------------------------------------
-- 5. DONORS (20 Profiles Linked to Users 12-31)
-- ----------------------------------------------------------------------------
INSERT INTO `donors` (`donor_id`, `user_id`, `status`) VALUES
(1, 12, 'ELIGIBLE'),
(2, 13, 'ELIGIBLE'),
(3, 14, 'ELIGIBLE'),
(4, 15, 'ELIGIBLE'),
(5, 16, 'ELIGIBLE'),
(6, 17, 'ELIGIBLE'),
(7, 18, 'ELIGIBLE'),
(8, 19, 'ELIGIBLE'),
(9, 20, 'ELIGIBLE'),
(10, 21, 'ELIGIBLE'),
(11, 22, 'ELIGIBLE'),
(12, 23, 'ELIGIBLE'),
(13, 24, 'ELIGIBLE'),
(14, 25, 'ELIGIBLE'),
(15, 26, 'ELIGIBLE'),
(16, 27, 'ELIGIBLE'),
(17, 28, 'ELIGIBLE'),
(18, 29, 'ELIGIBLE'),
(19, 30, 'ELIGIBLE'),
(20, 31, 'TEMPORARILY_DEFERRED');

-- ----------------------------------------------------------------------------
-- 6. DONOR HEALTH (PHI & Metrics Covering All 8 Blood Groups)
-- ----------------------------------------------------------------------------
INSERT INTO `donor_health` (`health_id`, `donor_id`, `blood_group`, `height_cm`, `weight_kg`, `last_donation_date`, `has_addiction`, `addiction_details`, `medications`, `previous_illness`, `recent_surgery`) VALUES
(1, 1, 'O+', 178.50, 76.00, DATE_SUB(CURRENT_DATE, INTERVAL 120 DAY), FALSE, NULL, 'None', 'None', 'None'),
(2, 2, 'A-', 165.00, 58.50, DATE_SUB(CURRENT_DATE, INTERVAL 180 DAY), FALSE, NULL, 'Multivitamins', 'Seasonal Allergies', 'None'),
(3, 3, 'B+', 182.00, 82.00, NULL, FALSE, NULL, 'None', 'None', 'None'),
(4, 4, 'B-', 160.00, 52.00, DATE_SUB(CURRENT_DATE, INTERVAL 95 DAY), FALSE, NULL, 'None', 'None', 'None'),
(5, 5, 'AB+', 175.00, 70.00, DATE_SUB(CURRENT_DATE, INTERVAL 150 DAY), FALSE, NULL, 'None', 'None', 'None'),
(6, 6, 'O-', 168.00, 64.00, DATE_SUB(CURRENT_DATE, INTERVAL 110 DAY), FALSE, NULL, 'None', 'None', 'None'),
(7, 7, 'A+', 180.00, 79.00, DATE_SUB(CURRENT_DATE, INTERVAL 130 DAY), FALSE, NULL, 'None', 'None', 'None'),
(8, 8, 'AB-', 162.00, 55.00, NULL, FALSE, NULL, 'None', 'None', 'None'),
(9, 9, 'O+', 158.00, 53.00, DATE_SUB(CURRENT_DATE, INTERVAL 140 DAY), FALSE, NULL, 'None', 'None', 'None'),
(10, 10, 'A+', 177.00, 74.00, DATE_SUB(CURRENT_DATE, INTERVAL 100 DAY), FALSE, NULL, 'None', 'None', 'None'),
(11, 11, 'B+', 170.00, 68.00, DATE_SUB(CURRENT_DATE, INTERVAL 200 DAY), FALSE, NULL, 'None', 'None', 'None'),
(12, 12, 'O-', 185.00, 88.00, DATE_SUB(CURRENT_DATE, INTERVAL 92 DAY), FALSE, NULL, 'None', 'None', 'None'),
(13, 13, 'A-', 167.00, 61.00, DATE_SUB(CURRENT_DATE, INTERVAL 160 DAY), FALSE, NULL, 'None', 'None', 'None'),
(14, 14, 'B-', 173.00, 72.00, NULL, FALSE, NULL, 'None', 'None', 'None'),
(15, 15, 'AB+', 164.00, 57.00, DATE_SUB(CURRENT_DATE, INTERVAL 115 DAY), FALSE, NULL, 'None', 'None', 'None'),
(16, 16, 'O+', 181.00, 80.00, DATE_SUB(CURRENT_DATE, INTERVAL 105 DAY), FALSE, NULL, 'None', 'None', 'None'),
(17, 17, 'A+', 169.00, 63.00, DATE_SUB(CURRENT_DATE, INTERVAL 175 DAY), FALSE, NULL, 'None', 'None', 'None'),
(18, 18, 'B+', 176.00, 75.00, DATE_SUB(CURRENT_DATE, INTERVAL 145 DAY), FALSE, NULL, 'None', 'None', 'None'),
(19, 19, 'O-', 163.00, 56.00, DATE_SUB(CURRENT_DATE, INTERVAL 190 DAY), FALSE, NULL, 'None', 'None', 'None'),
(20, 20, 'AB-', 179.00, 69.00, NULL, FALSE, NULL, 'Antibiotics', 'Recent dental extraction', 'None');

-- ----------------------------------------------------------------------------
-- 7. APPOINTMENTS (Pre-screening Visits)
-- ----------------------------------------------------------------------------
INSERT INTO `appointments` (`appointment_id`, `donor_id`, `hospital_id`, `appointment_date`, `timeslot`, `appointment_status`) VALUES
(1, 1, 1, DATE_SUB(CURRENT_DATE, INTERVAL 15 DAY), '09:00:00', 'COMPLETED'),
(2, 2, 1, DATE_SUB(CURRENT_DATE, INTERVAL 14 DAY), '09:30:00', 'COMPLETED'),
(3, 3, 2, DATE_SUB(CURRENT_DATE, INTERVAL 12 DAY), '10:00:00', 'COMPLETED'),
(4, 4, 2, DATE_SUB(CURRENT_DATE, INTERVAL 11 DAY), '10:30:00', 'COMPLETED'),
(5, 5, 1, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), '11:00:00', 'COMPLETED'),
(6, 6, 3, DATE_SUB(CURRENT_DATE, INTERVAL 9 DAY), '11:30:00', 'COMPLETED'),
(7, 7, 3, DATE_SUB(CURRENT_DATE, INTERVAL 8 DAY), '14:00:00', 'COMPLETED'),
(8, 8, 1, DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY), '14:30:00', 'COMPLETED'),
(9, 9, 2, DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY), '15:00:00', 'COMPLETED'),
(10, 10, 2, DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), '15:30:00', 'COMPLETED'),
(11, 11, 1, DATE_SUB(CURRENT_DATE, INTERVAL 4 DAY), '09:00:00', 'COMPLETED'),
(12, 12, 3, DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY), '09:30:00', 'COMPLETED'),
(13, 13, 1, DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), '10:00:00', 'COMPLETED'),
(14, 14, 2, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), '10:30:00', 'COMPLETED'),
(15, 20, 1, DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), '11:00:00', 'COMPLETED');

-- ----------------------------------------------------------------------------
-- 8. MEDICAL TESTS (Clinical Screening by Hospital Staff)
-- ----------------------------------------------------------------------------
INSERT INTO `medical_tests` (`test_id`, `appointment_id`, `donor_id`, `recorded_by`, `test_date`, `hemoglobin_level`, `blood_pressure_systolic`, `blood_pressure_diastolic`, `pulse_rate`, `temperature_celsius`, `result`, `eligibility`, `remarks`) VALUES
(1, 1, 1, 8, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 15 DAY), 14.8, 120, 80, 72, 36.6, 'PASSED', 'ELIGIBLE', 'Excellent physical condition'),
(2, 2, 2, 8, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 14 DAY), 13.5, 116, 76, 70, 36.7, 'PASSED', 'ELIGIBLE', 'Cleared for whole blood collection'),
(3, 3, 3, 9, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 12 DAY), 15.2, 122, 78, 68, 36.5, 'PASSED', 'ELIGIBLE', 'First-time donor cleared'),
(4, 4, 4, 9, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 11 DAY), 13.1, 110, 72, 74, 36.6, 'PASSED', 'ELIGIBLE', 'Normal donor screening'),
(5, 5, 5, 8, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 10 DAY), 14.2, 124, 82, 76, 36.8, 'PASSED', 'ELIGIBLE', 'Cleared for apheresis / whole blood'),
(6, 6, 6, 10, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 9 DAY), 15.0, 118, 78, 69, 36.5, 'PASSED', 'ELIGIBLE', 'Universal donor (O-) cleared'),
(7, 7, 7, 10, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 8 DAY), 14.6, 125, 80, 72, 36.7, 'PASSED', 'ELIGIBLE', 'Cleared for collection'),
(8, 8, 8, 8, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 7 DAY), 13.8, 114, 74, 71, 36.6, 'PASSED', 'ELIGIBLE', 'Cleared without restriction'),
(9, 9, 9, 9, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 6 DAY), 13.4, 118, 76, 75, 36.8, 'PASSED', 'ELIGIBLE', 'Fit for whole blood donation'),
(10, 10, 10, 9, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 5 DAY), 14.9, 122, 79, 70, 36.5, 'PASSED', 'ELIGIBLE', 'Cleared'),
(11, 11, 11, 8, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 4 DAY), 14.1, 120, 80, 72, 36.6, 'PASSED', 'ELIGIBLE', 'Cleared'),
(12, 12, 12, 10, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 3 DAY), 15.6, 126, 82, 68, 36.7, 'PASSED', 'ELIGIBLE', 'Universal donor cleared'),
(13, 13, 13, 11, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 DAY), 13.6, 115, 75, 74, 36.5, 'PASSED', 'ELIGIBLE', 'Cleared'),
(14, 14, 14, 9, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), 14.3, 119, 78, 73, 36.6, 'PASSED', 'ELIGIBLE', 'Cleared'),
(15, 15, 20, 8, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 DAY), 11.2, 135, 88, 85, 37.8, 'FAILED', 'TEMPORARILY_DEFERRED', 'Low hemoglobin and recent dental surgery');

-- ----------------------------------------------------------------------------
-- 9. DONATION APPOINTMENTS (Confirmed Sessions for Cleared Donors)
-- ----------------------------------------------------------------------------
INSERT INTO `donation_appointments` (`donation_appt_id`, `medical_test_id`, `donor_id`, `hospital_id`, `appointment_date`, `time_slot`, `status`) VALUES
(1, 1, 1, 1, DATE_SUB(CURRENT_DATE, INTERVAL 15 DAY), '09:45:00', 'COMPLETED'),
(2, 2, 2, 1, DATE_SUB(CURRENT_DATE, INTERVAL 14 DAY), '10:15:00', 'COMPLETED'),
(3, 3, 3, 2, DATE_SUB(CURRENT_DATE, INTERVAL 12 DAY), '10:45:00', 'COMPLETED'),
(4, 4, 4, 2, DATE_SUB(CURRENT_DATE, INTERVAL 11 DAY), '11:15:00', 'COMPLETED'),
(5, 5, 5, 1, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), '11:45:00', 'COMPLETED'),
(6, 6, 6, 3, DATE_SUB(CURRENT_DATE, INTERVAL 9 DAY), '12:15:00', 'COMPLETED'),
(7, 7, 7, 3, DATE_SUB(CURRENT_DATE, INTERVAL 8 DAY), '14:45:00', 'COMPLETED'),
(8, 8, 8, 1, DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY), '15:15:00', 'COMPLETED'),
(9, 9, 9, 2, DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY), '15:45:00', 'COMPLETED'),
(10, 10, 10, 2, DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), '16:15:00', 'COMPLETED'),
(11, 11, 11, 1, DATE_SUB(CURRENT_DATE, INTERVAL 4 DAY), '09:45:00', 'COMPLETED'),
(12, 12, 12, 3, DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY), '10:15:00', 'COMPLETED');

-- ----------------------------------------------------------------------------
-- 10. DONATIONS (12 Physical Collection Sessions)
-- ----------------------------------------------------------------------------
INSERT INTO `donations` (`donation_id`, `donation_appt_id`, `donor_id`, `hospital_id`, `blood_group`, `donation_type`, `donation_date`, `quality`, `screening_status`, `total_volume_ml`) VALUES
(1, 1, 1, 1, 'O+', 'WHOLE_BLOOD', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 15 DAY), 'GOOD', 'CLEARED', 450.00),
(2, 2, 2, 1, 'A-', 'WHOLE_BLOOD', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 14 DAY), 'GOOD', 'CLEARED', 450.00),
(3, 3, 3, 2, 'B+', 'WHOLE_BLOOD', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 12 DAY), 'GOOD', 'CLEARED', 450.00),
(4, 4, 4, 2, 'B-', 'WHOLE_BLOOD', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 11 DAY), 'GOOD', 'CLEARED', 450.00),
(5, 5, 5, 1, 'AB+', 'WHOLE_BLOOD', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 10 DAY), 'GOOD', 'CLEARED', 450.00),
(6, 6, 6, 3, 'O-', 'WHOLE_BLOOD', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 9 DAY), 'GOOD', 'CLEARED', 450.00),
(7, 7, 7, 3, 'A+', 'WHOLE_BLOOD', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 8 DAY), 'GOOD', 'CLEARED', 450.00),
(8, 8, 8, 1, 'AB-', 'WHOLE_BLOOD', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 7 DAY), 'GOOD', 'CLEARED', 450.00),
(9, 9, 9, 2, 'O+', 'WHOLE_BLOOD', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 6 DAY), 'GOOD', 'CLEARED', 450.00),
(10, 10, 10, 2, 'A+', 'WHOLE_BLOOD', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 5 DAY), 'GOOD', 'CLEARED', 450.00),
(11, 11, 11, 1, 'B+', 'WHOLE_BLOOD', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 4 DAY), 'GOOD', 'CLEARED', 450.00),
(12, 12, 12, 3, 'O-', 'WHOLE_BLOOD', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 3 DAY), 'GOOD', 'CLEARED', 450.00);

-- ----------------------------------------------------------------------------
-- 11. BLOOD UNITS (Processed Bags Stored in Blood Banks)
-- ----------------------------------------------------------------------------
INSERT INTO `blood_units` (`unit_id`, `donation_id`, `blood_bank_id`, `unit_number`, `blood_group`, `component_type`, `volume_ml`, `collection_date`, `expiry_date`, `test_status`, `status`, `storage_location`) VALUES
-- Donation 1 (O+)
(1, 1, 1, 'BBMS-2026-O-001', 'O+', 'PACKED_RED_CELLS', 250.00, DATE_SUB(CURRENT_DATE, INTERVAL 15 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 27 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Room Unit 1A'),
(2, 1, 1, 'BBMS-2026-O-002', 'O+', 'FRESH_FROZEN_PLASMA', 200.00, DATE_SUB(CURRENT_DATE, INTERVAL 15 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 350 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Deep Freeze Bay 1'),

-- Donation 2 (A-)
(3, 2, 1, 'BBMS-2026-A-001', 'A-', 'PACKED_RED_CELLS', 250.00, DATE_SUB(CURRENT_DATE, INTERVAL 14 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 28 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Room Unit 1B'),
(4, 2, 1, 'BBMS-2026-A-002', 'A-', 'PLATELETS', 50.00, DATE_SUB(CURRENT_DATE, INTERVAL 14 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Agitator Rack 2'),

-- Donation 3 (B+)
(5, 3, 2, 'BBMS-2026-B-001', 'B+', 'PACKED_RED_CELLS', 250.00, DATE_SUB(CURRENT_DATE, INTERVAL 12 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Room Unit 2A'),
(6, 3, 2, 'BBMS-2026-B-002', 'B+', 'FRESH_FROZEN_PLASMA', 200.00, DATE_SUB(CURRENT_DATE, INTERVAL 12 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 353 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Deep Freeze Bay 2'),

-- Donation 4 (B-)
(7, 4, 2, 'BBMS-2026-B-003', 'B-', 'PACKED_RED_CELLS', 250.00, DATE_SUB(CURRENT_DATE, INTERVAL 11 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 31 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Room Unit 2B'),

-- Donation 5 (AB+)
(8, 5, 1, 'BBMS-2026-AB-001', 'AB+', 'PACKED_RED_CELLS', 250.00, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 32 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Room Unit 1C'),
(9, 5, 1, 'BBMS-2026-AB-002', 'AB+', 'PLATELETS', 50.00, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Agitator Rack 1'),

-- Donation 6 (O- Universal Donor)
(10, 6, 1, 'BBMS-2026-O-003', 'O-', 'PACKED_RED_CELLS', 250.00, DATE_SUB(CURRENT_DATE, INTERVAL 9 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 33 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Room Unit 1A - Emergency Shelf'),
(11, 6, 1, 'BBMS-2026-O-004', 'O-', 'FRESH_FROZEN_PLASMA', 200.00, DATE_SUB(CURRENT_DATE, INTERVAL 9 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 356 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Deep Freeze Bay 1'),

-- Donation 7 (A+)
(12, 7, 3, 'BBMS-2026-A-003', 'A+', 'PACKED_RED_CELLS', 250.00, DATE_SUB(CURRENT_DATE, INTERVAL 8 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 34 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Room Unit 3A'),
(13, 7, 3, 'BBMS-2026-A-004', 'A+', 'FRESH_FROZEN_PLASMA', 200.00, DATE_SUB(CURRENT_DATE, INTERVAL 8 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 357 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Deep Freeze Bay 3'),

-- Donation 8 (AB-)
(14, 8, 1, 'BBMS-2026-AB-003', 'AB-', 'PACKED_RED_CELLS', 250.00, DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 35 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Room Unit 1C'),

-- Donation 9 (O+)
(15, 9, 2, 'BBMS-2026-O-005', 'O+', 'PACKED_RED_CELLS', 250.00, DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 36 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Room Unit 2A'),

-- Donation 10 (A+)
(16, 10, 2, 'BBMS-2026-A-005', 'A+', 'PACKED_RED_CELLS', 250.00, DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 37 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Room Unit 2B'),

-- Donation 11 (B+)
(17, 11, 1, 'BBMS-2026-B-004', 'B+', 'PACKED_RED_CELLS', 250.00, DATE_SUB(CURRENT_DATE, INTERVAL 4 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 38 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Room Unit 1B'),

-- Donation 12 (O-)
(18, 12, 3, 'BBMS-2026-O-006', 'O-', 'PACKED_RED_CELLS', 250.00, DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 39 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Room Unit 3A - Emergency Shelf');

-- ----------------------------------------------------------------------------
-- 12. REQUESTERS (6 Profiles Linked to Users 32-37)
-- ----------------------------------------------------------------------------
INSERT INTO `requesters` (`requester_id`, `user_id`, `requester_type`, `registration_date`) VALUES
(1, 32, 'FAMILY_REPRESENTATIVE', DATE_SUB(CURRENT_DATE, INTERVAL 45 DAY)),
(2, 33, 'HOSPITAL_COORDINATOR', DATE_SUB(CURRENT_DATE, INTERVAL 40 DAY)),
(3, 34, 'INDIVIDUAL_PATIENT', DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)),
(4, 35, 'FAMILY_REPRESENTATIVE', DATE_SUB(CURRENT_DATE, INTERVAL 25 DAY)),
(5, 36, 'HOSPITAL_COORDINATOR', DATE_SUB(CURRENT_DATE, INTERVAL 15 DAY)),
(6, 37, 'INDIVIDUAL_PATIENT', DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY));

-- ----------------------------------------------------------------------------
-- 13. BLOOD REQUESTS (Clinical Patient Blood Requests)
-- ----------------------------------------------------------------------------
INSERT INTO `blood_requests` (`request_id`, `requester_id`, `blood_bank_id`, `hospital_id`, `patient_name`, `patient_mrn`, `blood_group`, `component_type`, `quantity_requested`, `urgency`, `request_date`, `required_by_date`, `status`, `notes`) VALUES
(1, 1, 1, 1, 'Arthur Pendelton', 'MRN-90210', 'O+', 'PACKED_RED_CELLS', 1, 'URGENT', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), 'PARTIALLY_ALLOCATED', 'Cardiac bypass surgery prep'),
(2, 2, 1, 2, 'Sophia Martinez', 'MRN-84311', 'A-', 'PACKED_RED_CELLS', 1, 'NORMAL', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), 'PENDING', 'Orthopedic knee reconstruction'),
(3, 3, 2, 2, 'Rajesh Khanna', 'MRN-77102', 'B+', 'PACKED_RED_CELLS', 1, 'EMERGENCY', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), 'PARTIALLY_ALLOCATED', 'Trauma ward acute hemorrhage'),
(4, 4, 1, 1, 'Eleanor Vance', 'MRN-66014', 'O-', 'PACKED_RED_CELLS', 1, 'EMERGENCY', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), 'PARTIALLY_ALLOCATED', 'ICU postpartum hemorrhage'),
(5, 5, 3, 3, 'William Davis', 'MRN-55291', 'A+', 'PACKED_RED_CELLS', 1, 'NORMAL', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY), 'PENDING', 'Oncology chemotherapy support'),
(6, 6, 1, 1, 'Natalia Romanova', 'MRN-44109', 'AB+', 'PLATELETS', 1, 'URGENT', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY), 'PARTIALLY_ALLOCATED', 'Severe thrombocytopenia');

-- ----------------------------------------------------------------------------
-- 14. ALLOCATIONS (Active reservations triggering inventory status synchronization)
-- ----------------------------------------------------------------------------
-- Unit 1 (O+ PACKED_RED_CELLS) allocated to Request 1 by Staff User 4 at Blood Bank 1
INSERT INTO `allocations` (`allocation_id`, `request_id`, `unit_id`, `allocated_by`, `allocation_status`, `allocation_date`, `dispatch_date`, `notes`) VALUES
(1, 1, 1, 4, 'RESERVED', CURRENT_TIMESTAMP, NULL, 'Reserved for Arthur Pendelton cardiac bypass'),
-- Unit 5 (B+ PACKED_RED_CELLS) allocated to Request 3 by Staff User 5 at Blood Bank 2
(2, 3, 5, 5, 'RESERVED', CURRENT_TIMESTAMP, NULL, 'Emergency dispatch for trauma patient Rajesh Khanna'),
-- Unit 10 (O- PACKED_RED_CELLS) allocated to Request 4 by Staff User 4 at Blood Bank 1
(3, 4, 10, 4, 'RESERVED', CURRENT_TIMESTAMP, NULL, 'Urgent allocation for ICU patient Eleanor Vance'),
-- Unit 9 (AB+ PLATELETS) allocated to Request 6 by Staff User 4 at Blood Bank 1
(4, 6, 9, 4, 'RESERVED', CURRENT_TIMESTAMP, NULL, 'Platelet pack reserved for Natalia Romanova');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
