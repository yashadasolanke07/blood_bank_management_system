-- ============================================================================
-- Blood Bank Management System (BBMS) - Sample Seed Data
-- Database Target: MySQL 8.0+
-- File: database/sample_data.sql
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

-- 1. USERS
-- Standard mock password hash for 'Password123!' (Bcrypt)
SET @DEFAULT_PW = '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `email`, `password_hash`, `phone`, `gender`, `date_of_birth`, `address`, `role`) VALUES
(1, 'Admin', 'System', 'admin@bbms.org', @DEFAULT_PW, '+1-555-0101', 'OTHER', '1985-05-15', '100 Healthcare Blvd, Suite 400', 'ADMIN'),
(2, 'Dr. Robert', 'Chen', 'robert.chen@metrocivic.org', @DEFAULT_PW, '+1-555-0102', 'MALE', '1980-08-22', '12 Medical Center Way', 'BLOOD_BANK_STAFF'),
(3, 'Nurse Sarah', 'Jenkins', 'sjenkins@cityhealth.org', @DEFAULT_PW, '+1-555-0103', 'FEMALE', '1990-03-11', '45 Red Cross Plaza', 'HOSPITAL_STAFF'),
(4, 'Marcus', 'Vance', 'marcus.v@email.com', @DEFAULT_PW, '+1-555-0201', 'MALE', '1995-11-04', '742 Evergreen Terrace', 'DONOR'),
(5, 'Elena', 'Rostova', 'elena.rostova@email.com', @DEFAULT_PW, '+1-555-0202', 'FEMALE', '1998-02-18', '221B Baker St Apt 3', 'DONOR'),
(6, 'David', 'Kim', 'david.kim@email.com', @DEFAULT_PW, '+1-555-0203', 'MALE', '1992-07-29', '88 Maple Drive', 'DONOR'),
(7, 'Claire', 'Delacroix', 'claire.d@email.com', @DEFAULT_PW, '+1-555-0301', 'FEMALE', '1988-09-14', '304 Oakwood Ave', 'REQUESTER'),
(8, 'James', 'Wilson', 'jwilson@metrocoord.org', @DEFAULT_PW, '+1-555-0302', 'MALE', '1982-12-05', '500 Civic Hospital Wing', 'REQUESTER');

-- 2. DONORS
INSERT INTO `donors` (`donor_id`, `user_id`, `status`) VALUES
(1, 4, 'ELIGIBLE'),
(2, 5, 'ELIGIBLE'),
(3, 6, 'ELIGIBLE');

-- 3. DONOR_HEALTH
INSERT INTO `donor_health` (`health_id`, `donor_id`, `blood_group`, `height_cm`, `weight_kg`, `last_donation_date`, `has_addiction`, `addiction_details`, `medications`, `previous_illness`, `recent_surgery`) VALUES
(1, 1, 'O+', 178.50, 76.00, DATE_SUB(CURRENT_DATE, INTERVAL 120 DAY), FALSE, NULL, 'None', 'None', 'None'),
(2, 2, 'A-', 165.00, 58.50, DATE_SUB(CURRENT_DATE, INTERVAL 180 DAY), FALSE, NULL, 'Multivitamins', 'Seasonal Allergies', 'None'),
(3, 3, 'B+', 182.00, 82.00, NULL, FALSE, NULL, 'None', 'None', 'None');

-- 4. HOSPITALS
INSERT INTO `hospitals` (`hospital_id`, `name`, `license_number`, `phone`, `email`, `address`) VALUES
(1, 'City General Hospital', 'HOSP-LIC-2024-001', '+1-555-8001', 'admissions@citygeneral.org', '100 Medical Center Dr, Metro City'),
(2, 'Saint Jude Trauma & Care', 'HOSP-LIC-2024-002', '+1-555-8002', 'er@saintjudehealth.org', '450 Mercy Way, Metro City');

-- 5. BLOOD_BANKS
INSERT INTO `blood_banks` (`blood_bank_id`, `name`, `license_number`, `phone`, `email`, `address`) VALUES
(1, 'Central Metro Blood Bank', 'BB-LIC-2024-101', '+1-555-9001', 'inventory@metrobloodbank.org', '10 Lifeline Ave, Metro City'),
(2, 'Regional Red Ribbon Bank', 'BB-LIC-2024-102', '+1-555-9002', 'operations@redribbonblood.org', '88 Hope Boulevard, Metro City');

-- 6. BLOOD_BANK_STAFF
INSERT INTO `blood_bank_staff` (`user_id`, `blood_bank_id`, `designation`) VALUES
(2, 1, 'Lead Inventory Officer');

-- 7. APPOINTMENTS (Pre-screening)
INSERT INTO `appointments` (`appointment_id`, `donor_id`, `hospital_id`, `appointment_date`, `timeslot`, `appointment_status`) VALUES
(1, 1, 1, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), '09:00:00', 'COMPLETED'),
(2, 2, 1, DATE_SUB(CURRENT_DATE, INTERVAL 8 DAY), '10:30:00', 'COMPLETED'),
(3, 3, 2, DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), '14:00:00', 'COMPLETED');

-- 8. MEDICAL_TESTS (Completed with ELIGIBLE status)
INSERT INTO `medical_tests` (`test_id`, `appointment_id`, `donor_id`, `recorded_by`, `test_date`, `hemoglobin_level`, `blood_pressure_systolic`, `blood_pressure_diastolic`, `pulse_rate`, `temperature_celsius`, `result`, `eligibility`, `remarks`) VALUES
(1, 1, 1, 3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 10 DAY), 14.5, 120, 80, 72, 36.6, 'PASSED', 'ELIGIBLE', 'Donor in excellent physical health'),
(2, 2, 2, 3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 8 DAY), 13.2, 115, 75, 68, 36.7, 'PASSED', 'ELIGIBLE', 'Donor cleared for whole blood donation'),
(3, 3, 3, 3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 5 DAY), 15.0, 122, 78, 70, 36.5, 'PASSED', 'ELIGIBLE', 'First-time donor screened and cleared');

-- 9. DONATION_APPOINTMENTS
INSERT INTO `donation_appointments` (`donation_appt_id`, `medical_test_id`, `donor_id`, `hospital_id`, `appointment_date`, `time_slot`, `status`) VALUES
(1, 1, 1, 1, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), '09:30:00', 'COMPLETED'),
(2, 2, 2, 1, DATE_SUB(CURRENT_DATE, INTERVAL 8 DAY), '11:00:00', 'COMPLETED'),
(3, 3, 3, 2, DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), '14:30:00', 'COMPLETED');

-- 10. DONATIONS
INSERT INTO `donations` (`donation_id`, `donation_appt_id`, `donor_id`, `hospital_id`, `blood_group`, `donation_type`, `donation_date`, `quality`, `screening_status`, `total_volume_ml`) VALUES
(1, 1, 1, 1, 'O+', 'WHOLE_BLOOD', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 10 DAY), 'GOOD', 'CLEARED', 450.00),
(2, 2, 2, 1, 'A-', 'WHOLE_BLOOD', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 8 DAY), 'GOOD', 'CLEARED', 450.00),
(3, 3, 3, 2, 'B+', 'WHOLE_BLOOD', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 5 DAY), 'GOOD', 'CLEARED', 450.00);

-- 11. BLOOD_UNITS (Collected & Stored in Central Metro Blood Bank)
INSERT INTO `blood_units` (`unit_id`, `donation_id`, `blood_bank_id`, `unit_number`, `blood_group`, `component_type`, `volume_ml`, `collection_date`, `expiry_date`, `test_status`, `status`, `storage_location`) VALUES
(1, 1, 1, 'BBMS-2026-O-001', 'O+', 'PACKED_RED_CELLS', 250.00, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 32 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Refrigerated Cold Unit 1A'),
(2, 1, 1, 'BBMS-2026-O-002', 'O+', 'FRESH_FROZEN_PLASMA', 200.00, DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 355 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Deep Freezer -40C Shelf 2'),
(3, 2, 1, 'BBMS-2026-A-001', 'A-', 'PACKED_RED_CELLS', 250.00, DATE_SUB(CURRENT_DATE, INTERVAL 8 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 34 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Refrigerated Cold Unit 1B'),
(4, 3, 1, 'BBMS-2026-B-001', 'B+', 'PACKED_RED_CELLS', 250.00, DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 37 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Refrigerated Cold Unit 2A');

-- 12. REQUESTERS
INSERT INTO `requesters` (`requester_id`, `user_id`, `requester_type`, `registration_date`) VALUES
(1, 7, 'FAMILY_REPRESENTATIVE', DATE_SUB(CURRENT_DATE, INTERVAL 20 DAY)),
(2, 8, 'HOSPITAL_COORDINATOR', DATE_SUB(CURRENT_DATE, INTERVAL 15 DAY));

-- 13. BLOOD_REQUESTS
INSERT INTO `blood_requests` (`request_id`, `requester_id`, `blood_bank_id`, `hospital_id`, `patient_name`, `patient_mrn`, `blood_group`, `component_type`, `quantity_requested`, `urgency`, `request_date`, `required_by_date`, `status`) VALUES
(1, 1, 1, 1, 'Arthur Pendelton', 'MRN-90210', 'O+', 'PACKED_RED_CELLS', 1, 'URGENT', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), 'PARTIALLY_ALLOCATED'),
(2, 2, 1, 2, 'Sophia Martinez', 'MRN-84311', 'A-', 'PACKED_RED_CELLS', 1, 'NORMAL', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), 'PENDING');

-- 14. ALLOCATIONS (Unit 1 allocated to Request 1 by Staff User 2)
-- Note: inserting this trigger will automatically transition Unit 1 status to 'ALLOCATED'
INSERT INTO `allocations` (`allocation_id`, `request_id`, `unit_id`, `allocated_by`, `allocation_status`, `allocation_date`, `dispatch_date`, `notes`) VALUES
(1, 1, 1, 2, 'RESERVED', CURRENT_TIMESTAMP, NULL, 'Reserved for surgical emergency room patient Arthur Pendelton');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

