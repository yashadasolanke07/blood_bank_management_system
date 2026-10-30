-- ============================================================================
-- Blood Bank Management System (HemoCare BBMS)
-- Sample Seed Data: Strictly Aligned with Frontend Operations & UI Models
-- Target Engine: MySQL 8.0+
-- File: database/sample_data.sql
-- ============================================================================

USE `blood_bank_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- Clean existing data
TRUNCATE TABLE `allocations`;
TRUNCATE TABLE `blood_requests`;
TRUNCATE TABLE `blood_units`;
TRUNCATE TABLE `donations`;
TRUNCATE TABLE `clinical_checkups`;
TRUNCATE TABLE `donors`;
TRUNCATE TABLE `hospitals`;
TRUNCATE TABLE `staff_users`;

-- ----------------------------------------------------------------------------
-- 1. PARTNER HOSPITALS (Multiple Healthcare Facilities in Network)
-- ----------------------------------------------------------------------------
INSERT INTO `hospitals` (`hospital_id`, `name`, `license_number`, `phone`, `email`, `city`, `address`, `status`)
VALUES 
(1, 'City General Hospital', 'HOSP-LIC-MH-101', '+91-20-2612-1000', 'citygeneral@hospital.org', 'Pune', '100 Medical Center Dr, Pune', 'Verified'),
(2, 'Saint Jude Trauma & Care', 'HOSP-LIC-MH-102', '+91-20-2612-2000', 'saintjude@hospital.org', 'Pune', '450 Mercy Way, Pune', 'Verified'),
(3, 'Mercy Pediatric & Emergency', 'HOSP-LIC-MH-103', '+91-20-2612-3000', 'mercy@hospital.org', 'Pune', '12 Hope Parkway, Pune', 'Verified'),
(4, 'Ruby Hall Clinic Blood Center', 'HOSP-LIC-MH-104', '+91-20-2612-4000', 'rubyhall@hospital.org', 'Pune', '40 Sassoon Road, Pune', 'Verified');

-- ----------------------------------------------------------------------------
-- 2. STAFF USERS (Authentication for Hospital Staff & Central Blood Bank Staff)
-- ----------------------------------------------------------------------------
INSERT INTO `staff_users` (`user_id`, `email`, `password_hash`, `full_name`, `phone`, `role`, `facility_name`)
VALUES 
(1, 'admin@centralbloodbank.org', SHA2('password123', 256), 'Dr. Robert Chen', '+91-20-2612-3456', 'BLOOD_BANK_STAFF', 'Central Blood Bank Hub'),
(2, 'hospital@citycare.org', SHA2('password123', 256), 'Nurse Sarah Jenkins', '+91-20-2612-1001', 'HOSPITAL_STAFF', 'City General Hospital'),
(3, 'nurse@saintjude.org', SHA2('password123', 256), 'Dr. Gregory House', '+91-20-2612-2001', 'HOSPITAL_STAFF', 'Saint Jude Trauma & Care'),
(4, 'admin@bbms.org', SHA2('password123', 256), 'System Administrator', '+91-99999-00000', 'ADMIN', 'Central Blood Bank Hub');

-- ----------------------------------------------------------------------------
-- 3. DONORS (Walk-in Citizens Registered by Hospitals)
-- ----------------------------------------------------------------------------
INSERT INTO `donors` (`donor_id`, `full_name`, `blood_group`, `age`, `gender`, `phone`, `city`, `address`, `weight_kg`, `height_cm`, `has_addiction`, `addiction_details`, `medications`, `previous_illness`, `recent_surgery`, `last_donation_date`, `status`)
VALUES
(1, 'Aarav Sharma', 'O+', 28, 'MALE', '9822011001', 'Pune', 'Kothrud, Pune', 72.0, 175.0, 0, 'None', 'None', 'None', 'None', '2026-08-10', 'ACTIVE'),
(2, 'Priya Patel', 'A+', 24, 'FEMALE', '9822011002', 'Pune', 'Viman Nagar, Pune', 58.0, 162.0, 0, 'None', 'None', 'None', 'None', '2026-07-15', 'ACTIVE'),
(3, 'Rohan Deshmukh', 'B+', 32, 'MALE', '9822011003', 'Pune', 'Baner, Pune', 78.0, 180.0, 0, 'None', 'None', 'None', 'None', '2026-06-20', 'ACTIVE'),
(4, 'Ananya Iyer', 'AB+', 26, 'FEMALE', '9822011004', 'Pune', 'Aundh, Pune', 54.0, 158.0, 0, 'None', 'None', 'None', 'None', '2026-09-01', 'ACTIVE'),
(5, 'Vikram Malhotra', 'O-', 35, 'MALE', '9822011005', 'Pune', 'Koregaon Park, Pune', 82.0, 178.0, 0, 'None', 'None', 'None', 'None', '2026-05-12', 'ACTIVE'),
(6, 'Neha Kulkarni', 'A-', 29, 'FEMALE', '9822011006', 'Pune', 'Shivajinagar, Pune', 60.0, 165.0, 0, 'None', 'None', 'None', 'None', '2026-07-28', 'ACTIVE'),
(7, 'Siddharth Joshi', 'B-', 31, 'MALE', '9822011007', 'Pune', 'Hadapsar, Pune', 75.0, 172.0, 0, 'None', 'None', 'None', 'None', '2026-08-04', 'ACTIVE'),
(8, 'Tanvi Shah', 'AB-', 27, 'FEMALE', '9822011008', 'Pune', 'Kalyani Nagar, Pune', 56.0, 160.0, 0, 'None', 'None', 'None', 'None', '2026-09-15', 'ACTIVE'),
(9, 'Noah Taylor', 'O+', 30, 'MALE', '9822011009', 'Pune', 'Camp, Pune', 64.0, 170.0, 0, 'None', 'None', 'Recent dental surgery & mild anemia', 'Dental extraction', NULL, 'ACTIVE'),
(10, 'Yashada Solanke', 'O+', 23, 'FEMALE', '9822011010', 'Pune', 'FC Road, Pune', 62.0, 168.0, 0, 'None', 'None', 'None', 'None', '2026-08-22', 'ACTIVE'),
(11, 'Sharvari Sawarkar', 'A+', 22, 'FEMALE', '9822011011', 'Pune', 'JM Road, Pune', 57.0, 164.0, 0, 'None', 'None', 'None', 'None', '2026-09-10', 'ACTIVE'),
(12, 'Shrushti Zanjare', 'B+', 23, 'FEMALE', '9822011012', 'Pune', 'Model Colony, Pune', 55.0, 160.0, 0, 'None', 'None', 'None', 'None', '2026-09-18', 'ACTIVE');

-- ----------------------------------------------------------------------------
-- 4. CLINICAL CHECKUPS (Vitals & Medical Examination Conducted by Hospital)
-- ----------------------------------------------------------------------------
INSERT INTO `clinical_checkups` (`checkup_id`, `donor_id`, `hospital_id`, `appointment_status`, `checkup_date`, `time_slot`, `hemoglobin_level`, `bp_systolic`, `bp_diastolic`, `temperature_celsius`, `pulse_rate`, `decision`, `remarks`)
VALUES
(1, 1, 1, 'COMPLETED', '2026-08-10', '09:30:00', 14.8, 120, 80, 36.6, 72, 'ACCEPTED', 'Optimal physiological vitals, cleared to donate'),
(2, 2, 1, 'COMPLETED', '2026-07-15', '10:00:00', 13.9, 118, 78, 36.5, 70, 'ACCEPTED', 'Normal hemoglobin and BP, passed screening'),
(3, 3, 2, 'COMPLETED', '2026-06-20', '10:30:00', 15.2, 122, 82, 36.7, 74, 'ACCEPTED', 'Clinically fit for whole blood donation'),
(4, 4, 2, 'COMPLETED', '2026-09-01', '11:00:00', 13.5, 115, 75, 36.6, 72, 'ACCEPTED', 'Passed hospital medical checkup'),
(5, 5, 3, 'COMPLETED', '2026-05-12', '09:00:00', 15.6, 125, 80, 36.4, 68, 'ACCEPTED', 'Excellent physical condition, universal donor cleared'),
(6, 6, 3, 'COMPLETED', '2026-07-28', '11:30:00', 14.1, 120, 80, 36.6, 72, 'ACCEPTED', 'Normal clinical parameters'),
(7, 7, 4, 'COMPLETED', '2026-08-04', '09:45:00', 14.9, 124, 82, 36.5, 75, 'ACCEPTED', 'Fit for collection'),
(8, 8, 4, 'COMPLETED', '2026-09-15', '10:15:00', 13.2, 116, 76, 36.6, 71, 'ACCEPTED', 'Cleared for collection'),
(9, 9, 1, 'COMPLETED', '2026-10-01', '10:00:00', 10.4, 145, 95, 37.8, 88, 'REJECTED', 'Low hemoglobin (10.4 g/dL) & recent dental surgery. Deferral for 30 days.'),
(10, 10, 1, 'COMPLETED', '2026-08-22', '09:30:00', 14.2, 120, 80, 36.6, 72, 'ACCEPTED', 'Passed clinical checkup'),
(11, 11, 2, 'COMPLETED', '2026-09-10', '10:00:00', 13.8, 118, 78, 36.5, 70, 'ACCEPTED', 'Normal vitals, cleared'),
(12, 12, 1, 'COMPLETED', '2026-09-18', '11:00:00', 14.0, 120, 80, 36.6, 72, 'ACCEPTED', 'Clinically cleared');

-- ----------------------------------------------------------------------------
-- 5. DONATIONS (Blood Collections Conducted at Hospital for Accepted Donors)
-- ----------------------------------------------------------------------------
INSERT INTO `donations` (`donation_id`, `donor_id`, `hospital_id`, `blood_group`, `units_collected`, `total_volume_ml`, `donation_date`, `screening_status`)
VALUES
(1, 1, 1, 'O+', 1, 450.00, '2026-08-10', 'CLEARED'),
(2, 2, 1, 'A+', 1, 450.00, '2026-07-15', 'CLEARED'),
(3, 3, 2, 'B+', 1, 450.00, '2026-06-20', 'CLEARED'),
(4, 4, 2, 'AB+', 1, 450.00, '2026-09-01', 'CLEARED'),
(5, 5, 3, 'O-', 1, 450.00, '2026-05-12', 'CLEARED'),
(6, 6, 3, 'A-', 1, 450.00, '2026-07-28', 'CLEARED'),
(7, 7, 4, 'B-', 1, 450.00, '2026-08-04', 'CLEARED'),
(8, 8, 4, 'AB-', 1, 450.00, '2026-09-15', 'CLEARED'),
(9, 10, 1, 'O+', 1, 450.00, '2026-08-22', 'CLEARED'),
(10, 11, 2, 'A+', 1, 450.00, '2026-09-10', 'CLEARED'),
(11, 12, 1, 'B+', 1, 450.00, '2026-09-18', 'CLEARED');

-- ----------------------------------------------------------------------------
-- 6. BLOOD UNITS (Bags in Central Blood Bank Cold Storage)
-- Note: Units 16, 17, 18 are inserted as AVAILABLE, then flipped to ALLOCATED via allocations
-- ----------------------------------------------------------------------------
INSERT INTO `blood_units` (`unit_id`, `donation_id`, `unit_number`, `blood_group`, `component_type`, `volume_ml`, `collection_date`, `expiry_date`, `test_status`, `status`, `storage_location`)
VALUES
-- Available units ready for allocation in Central Blood Bank
(1, 1, 'BBMS-2026-O-001', 'O+', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 35 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 1'),
(2, 1, 'BBMS-2026-O-002', 'O+', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 1'),
(3, 5, 'BBMS-2026-O-003', 'O-', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 28 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 1'),
(4, 5, 'BBMS-2026-O-004', 'O-', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 32 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 1'),
(5, 2, 'BBMS-2026-A-005', 'A+', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 25 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 2'),
(6, 2, 'BBMS-2026-A-006', 'A+', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 35 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 2'),
(7, 6, 'BBMS-2026-A-007', 'A-', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 22 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 2'),
(8, 3, 'BBMS-2026-B-008', 'B+', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 33 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 3'),
(9, 3, 'BBMS-2026-B-009', 'B+', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 35 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 3'),
(10, 7, 'BBMS-2026-B-010', 'B-', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 26 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 3'),
(11, 4, 'BBMS-2026-AB-011', 'AB+', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 34 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 4'),
(12, 8, 'BBMS-2026-AB-012', 'AB-', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 20 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 4'),
(13, 9, 'BBMS-2026-O-013', 'O+', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 35 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 1'),
(14, 10, 'BBMS-2026-A-014', 'A+', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 35 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 2'),
(15, 11, 'BBMS-2026-B-015', 'B+', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 35 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 3'),
-- Pre-allocated historical units (fulfilled by seed allocations 1, 2, 3)
(16, 1, 'BBMS-2026-O-ALC1', 'O+', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 1'),
(17, 2, 'BBMS-2026-A-ALC2', 'A+', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 18 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 2'),
(18, 3, 'BBMS-2026-B-ALC3', 'B+', 'PACKED_RED_CELLS', 250.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 20 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 3');

-- ----------------------------------------------------------------------------
-- 7. BLOOD REQUESTS (Patient Blood Requisitions from Partner Hospitals)
-- ----------------------------------------------------------------------------
INSERT INTO `blood_requests` (`request_id`, `hospital_id`, `patient_name`, `patient_mrn`, `blood_group`, `component_type`, `quantity_requested`, `priority`, `request_date`, `required_date`, `notes`, `status`, `source_facility_name`, `transit_status`)
VALUES
-- Fulfilled Requisitions (Allotted From Central Blood Bank)
(1, 1, 'Kavita Menon', 'MRN-2026-4401', 'O+', 'PACKED_RED_CELLS', 1, 'Urgent', '2026-10-25', '2026-10-26', 'Emergency trauma blood request', 'Fulfilled', 'Central Blood Bank', 'IN_TRANSIT'),
(2, 2, 'Rajesh Gupta', 'MRN-2026-4402', 'A+', 'PACKED_RED_CELLS', 1, 'Emergency', '2026-10-26', '2026-10-26', 'Cardiac surgery crossmatch', 'Fulfilled', 'Central Blood Bank', 'IN_TRANSIT'),
(3, 3, 'Aditi Rao', 'MRN-2026-4403', 'B+', 'PACKED_RED_CELLS', 1, 'Normal', '2026-10-27', '2026-10-28', 'Oncology support', 'Fulfilled', 'Central Blood Bank', 'DELIVERED'),
-- Pending Requisitions (Awaiting Central Blood Bank Allotment)
(4, 1, 'Meera Nair', 'MRN-2026-5501', 'O+', 'PACKED_RED_CELLS', 1, 'Urgent', CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY), 'Post-partum hemorrhage management', 'Pending', NULL, NULL),
(5, 2, 'Devendra Patil', 'MRN-2026-5502', 'A+', 'PACKED_RED_CELLS', 1, 'Normal', CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), 'Scheduled orthopedic knee replacement', 'Pending', NULL, NULL),
(6, 3, 'Sunita Kadam', 'MRN-2026-5503', 'B+', 'PACKED_RED_CELLS', 1, 'Emergency', CURRENT_DATE, CURRENT_DATE, 'Acute internal GI bleeding', 'Pending', NULL, NULL),
(7, 4, 'Arjun Sen', 'MRN-2026-5504', 'AB+', 'PACKED_RED_CELLS', 1, 'Normal', CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY), 'Elective spinal procedure', 'Pending', NULL, NULL),
(8, 1, 'Farhan Qureshi', 'MRN-2026-5505', 'O-', 'PACKED_RED_CELLS', 1, 'Emergency', CURRENT_DATE, CURRENT_DATE, 'Pediatric ICU blood transfusion needed', 'Pending', NULL, NULL);

-- ----------------------------------------------------------------------------
-- 8. ALLOCATIONS (Linking Fulfilled Requests to Blood Bags)
-- Inserting these automatically triggers trg_sync_unit_after_allocation_insert to flip units 16, 17, 18 to ALLOCATED
-- ----------------------------------------------------------------------------
INSERT INTO `allocations` (`allocation_id`, `request_id`, `unit_id`, `allocated_by`, `source_facility`, `destination_hospital`, `dispatch_date`, `allocation_status`, `notes`)
VALUES
(1, 1, 16, 1, 'Central Blood Bank', 'City General Hospital', '2026-10-25 14:30:00', 'DISPATCHED', 'Allotted from Central Blood Bank to City General Hospital'),
(2, 2, 17, 1, 'Central Blood Bank', 'Saint Jude Trauma & Care', '2026-10-26 11:15:00', 'DISPATCHED', 'Allotted from Central Blood Bank to Saint Jude Trauma & Care'),
(3, 3, 18, 1, 'Central Blood Bank', 'Mercy Pediatric & Emergency', '2026-10-27 16:45:00', 'COMPLETED', 'Allotted from Central Blood Bank to Mercy Pediatric & Emergency');

SET FOREIGN_KEY_CHECKS = 1;
