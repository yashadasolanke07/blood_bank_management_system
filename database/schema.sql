-- ============================================================================
-- Blood Bank Management System (BBMS) - Database Schema
-- Database Target: MySQL 8.0+
-- File: database/schema.sql
-- ============================================================================

-- Disable foreign key checks during initialization
SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS, UNIQUE_CHECKS = 0;
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS = 0;
SET @OLD_SQL_MODE = @@SQL_MODE, SQL_MODE = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';

-- Create Database
CREATE DATABASE IF NOT EXISTS `blood_bank_db`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `blood_bank_db`;

-- Drop existing views if any
DROP VIEW IF EXISTS `v_donor_health_anonymized`;
DROP VIEW IF EXISTS `v_donor_health_authorized`;
DROP VIEW IF EXISTS `v_available_blood_inventory`;
DROP VIEW IF EXISTS `v_request_fulfillment_summary`;

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS `allocations`;
DROP TABLE IF EXISTS `blood_requests`;
DROP TABLE IF EXISTS `requesters`;
DROP TABLE IF EXISTS `blood_units`;
DROP TABLE IF EXISTS `donations`;
DROP TABLE IF EXISTS `donation_appointments`;
DROP TABLE IF EXISTS `medical_tests`;
DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `blood_bank_staff`;
DROP TABLE IF EXISTS `blood_banks`;
DROP TABLE IF EXISTS `hospitals`;
DROP TABLE IF EXISTS `donor_health`;
DROP TABLE IF EXISTS `donors`;
DROP TABLE IF EXISTS `users`;

-- 1. USERS TABLE :- Core identity entity for authentication and profile management across roles.
CREATE TABLE `users` (
    `user_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL COMMENT 'Bcrypt or Argon2 hash',
    `phone` VARCHAR(20) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    `date_of_birth` DATE NOT NULL,
    `address` TEXT NOT NULL,
    `role` ENUM('DONOR', 'REQUESTER', 'BLOOD_BANK_STAFF', 'HOSPITAL_STAFF', 'ADMIN') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `uq_users_email` (`email`),
    UNIQUE KEY `uq_users_phone` (`phone`),
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. DONORS TABLE :- Specialization of User. Inherits core identity from `users`.
CREATE TABLE `donors` (
    `donor_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `status` ENUM('ACTIVE', 'ELIGIBLE', 'TEMPORARILY_DEFERRED', 'PERMANENTLY_DEFERRED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`donor_id`),
    UNIQUE KEY `uq_donors_user_id` (`user_id`),
    INDEX `idx_donors_status` (`status`),
    CONSTRAINT `fk_donors_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. DONOR_HEALTH TABLE :- Holds protected health information (PHI) for donors.(1-1)
CREATE TABLE `donor_health` (
    `health_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `donor_id` INT UNSIGNED NOT NULL,
    `blood_group` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    `height_cm` DECIMAL(5, 2) NOT NULL,
    `weight_kg` DECIMAL(5, 2) NOT NULL,
    `last_donation_date` DATE NULL,
    `has_addiction` BOOLEAN NOT NULL DEFAULT FALSE,
    `addiction_details` VARCHAR(255) NULL,
    `medications` TEXT NULL COMMENT 'Encrypted or restricted medical prescription details',
    `previous_illness` TEXT NULL COMMENT 'Encrypted or restricted prior conditions',
    `recent_surgery` TEXT NULL COMMENT 'Encrypted or restricted surgical history',
    `is_phi_encrypted` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Indicates application-level encryption for sensitive fields',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`health_id`),
    UNIQUE KEY `uq_donor_health_donor_id` (`donor_id`),
    INDEX `idx_donor_health_blood_group` (`blood_group`),
    CONSTRAINT `fk_donor_health_donor` FOREIGN KEY (`donor_id`)
        REFERENCES `donors` (`donor_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `chk_donor_height` CHECK (`height_cm` BETWEEN 50.0 AND 260.0),
    CONSTRAINT `chk_donor_weight` CHECK (`weight_kg` >= 45.00) -- Medical threshold for safe blood donation
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. HOSPITALS TABLE :- Medical institutions that conduct screening/collection or request blood units.
CREATE TABLE `hospitals` (
    `hospital_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `license_number` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `address` TEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`hospital_id`),
    UNIQUE KEY `uq_hospitals_license` (`license_number`),
    UNIQUE KEY `uq_hospitals_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BLOOD_BANKS TABLE :- Storage facilities managing blood units and inventory distribution.
CREATE TABLE `blood_banks` (
    `blood_bank_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `license_number` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `address` TEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`blood_bank_id`),
    UNIQUE KEY `uq_blood_banks_license` (`license_number`),
    UNIQUE KEY `uq_blood_banks_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BLOOD_BANK_STAFF TABLE :- Resolves the ER diagram 'managed-by' relationship between blood bank & staff users.
CREATE TABLE `blood_bank_staff` (
    `user_id` INT UNSIGNED NOT NULL,
    `blood_bank_id` INT UNSIGNED NOT NULL,
    `designation` VARCHAR(50) NOT NULL DEFAULT 'Blood Bank Officer',
    `assigned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `blood_bank_id`),
    CONSTRAINT `fk_bbs_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_bbs_bank` FOREIGN KEY (`blood_bank_id`)
        REFERENCES `blood_banks` (`blood_bank_id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. APPOINTMENTS TABLE (Pre-Donation Screening Appointments) :- Represents a donor booking an appointment at a hospital/center for screening.
CREATE TABLE `appointments` (
    `appointment_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `donor_id` INT UNSIGNED NOT NULL,
    `hospital_id` INT UNSIGNED NOT NULL,
    `appointment_date` DATE NOT NULL,
    `timeslot` TIME NOT NULL,
    `appointment_status` ENUM('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`appointment_id`),
    INDEX `idx_appointments_donor` (`donor_id`),
    INDEX `idx_appointments_hospital` (`hospital_id`),
    INDEX `idx_appointments_date_status` (`appointment_date`, `appointment_status`),
    CONSTRAINT `fk_appt_donor` FOREIGN KEY (`donor_id`)
        REFERENCES `donors` (`donor_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_appt_hospital` FOREIGN KEY (`hospital_id`)
        REFERENCES `hospitals` (`hospital_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. MEDICAL_TESTS TABLE :- Medical screening records generated from an appointment before blood draw. (Recorded by a medical staff user.)
CREATE TABLE `medical_tests` (
    `test_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `appointment_id` INT UNSIGNED NOT NULL,
    `donor_id` INT UNSIGNED NOT NULL,
    `recorded_by` INT UNSIGNED NOT NULL COMMENT 'Staff user ID who performed/recorded screening',
    `test_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `hemoglobin_level` DECIMAL(4, 1) NULL COMMENT 'g/dL, standard donor requirement >= 12.5',
    `blood_pressure_systolic` SMALLINT UNSIGNED NULL,
    `blood_pressure_diastolic` SMALLINT UNSIGNED NULL,
    `pulse_rate` SMALLINT UNSIGNED NULL,
    `temperature_celsius` DECIMAL(4, 2) NULL,
    `result` ENUM('PASSED', 'FAILED', 'INCONCLUSIVE', 'PENDING') NOT NULL DEFAULT 'PENDING',
    `eligibility` ENUM('ELIGIBLE', 'TEMPORARILY_DEFERRED', 'PERMANENTLY_DEFERRED') NOT NULL,
    `deferral_until_date` DATE NULL,
    `remarks` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`test_id`),
    INDEX `idx_med_tests_appointment` (`appointment_id`),
    INDEX `idx_med_tests_donor` (`donor_id`),
    INDEX `idx_med_tests_recorder` (`recorded_by`),
    CONSTRAINT `fk_med_appt` FOREIGN KEY (`appointment_id`)
        REFERENCES `appointments` (`appointment_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_med_donor` FOREIGN KEY (`donor_id`)
        REFERENCES `donors` (`donor_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_med_recorder` FOREIGN KEY (`recorded_by`)
        REFERENCES `users` (`user_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `chk_hemoglobin` CHECK (`hemoglobin_level` IS NULL OR `hemoglobin_level` >= 0.0),
    CONSTRAINT `chk_bp_systolic` CHECK (`blood_pressure_systolic` IS NULL OR `blood_pressure_systolic` BETWEEN 50 AND 260),
    CONSTRAINT `chk_bp_diastolic` CHECK (`blood_pressure_diastolic` IS NULL OR `blood_pressure_diastolic` BETWEEN 30 AND 180),
    CONSTRAINT `chk_temperature` CHECK (`temperature_celsius` IS NULL OR `temperature_celsius` BETWEEN 34.00 AND 42.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. DONATION_APPOINTMENTS TABLE :- Actual blood collection appointment scheduled following successful medical testing.
CREATE TABLE `donation_appointments` (
    `donation_appt_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `medical_test_id` INT UNSIGNED NOT NULL,
    `donor_id` INT UNSIGNED NOT NULL,
    `hospital_id` INT UNSIGNED NOT NULL,
    `appointment_date` DATE NOT NULL,
    `time_slot` TIME NOT NULL,
    `status` ENUM('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`donation_appt_id`),
    UNIQUE KEY `uq_don_appt_test` (`medical_test_id`),
    INDEX `idx_don_appt_donor` (`donor_id`),
    INDEX `idx_don_appt_hospital` (`hospital_id`),
    CONSTRAINT `fk_don_appt_test` FOREIGN KEY (`medical_test_id`)
        REFERENCES `medical_tests` (`test_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_don_appt_donor` FOREIGN KEY (`donor_id`)
        REFERENCES `donors` (`donor_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_don_appt_hospital` FOREIGN KEY (`hospital_id`)
        REFERENCES `hospitals` (`hospital_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. DONATIONS TABLE :- The physical donation session resulting from a donation appointment.
CREATE TABLE `donations` (
    `donation_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `donation_appt_id` INT UNSIGNED NOT NULL,
    `donor_id` INT UNSIGNED NOT NULL,
    `hospital_id` INT UNSIGNED NOT NULL,
    `blood_group` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    `donation_type` ENUM('WHOLE_BLOOD', 'PLATELETS', 'PLASMA', 'DOUBLE_RED_CELLS') NOT NULL DEFAULT 'WHOLE_BLOOD',
    `donation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `quality` ENUM('GOOD', 'ACCEPTABLE', 'SUBSTANDARD', 'REJECTED') NOT NULL DEFAULT 'GOOD',
    `screening_status` ENUM('PENDING', 'TESTING', 'CLEARED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `total_volume_ml` DECIMAL(6, 2) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`donation_id`),
    UNIQUE KEY `uq_donations_appt` (`donation_appt_id`),
    INDEX `idx_donations_donor` (`donor_id`),
    INDEX `idx_donations_hospital` (`hospital_id`),
    INDEX `idx_donations_date` (`donation_date`),
    CONSTRAINT `fk_donation_appt` FOREIGN KEY (`donation_appt_id`)
        REFERENCES `donation_appointments` (`donation_appt_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_donation_donor` FOREIGN KEY (`donor_id`)
        REFERENCES `donors` (`donor_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_donation_hospital` FOREIGN KEY (`hospital_id`)
        REFERENCES `hospitals` (`hospital_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `chk_donation_volume` CHECK (`total_volume_ml` > 0.0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. BLOOD_UNITS TABLE :- Individual blood bags/components produced from a single donation (1:N).
CREATE TABLE `blood_units` (
    `unit_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `donation_id` INT UNSIGNED NOT NULL COMMENT 'One donation produces multiple blood units',
    `blood_bank_id` INT UNSIGNED NOT NULL,
    `unit_number` VARCHAR(50) NOT NULL COMMENT 'Unique barcode / ISBT 128 unit identifier',
    `blood_group` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    `component_type` ENUM('WHOLE_BLOOD', 'PACKED_RED_CELLS', 'FRESH_FROZEN_PLASMA', 'PLATELETS', 'CRYOPRECIPITATE') NOT NULL,
    `volume_ml` DECIMAL(6, 2) NOT NULL,
    `collection_date` DATE NOT NULL,
    `expiry_date` DATE NOT NULL,
    `test_status` ENUM('PENDING', 'NEGATIVE_CLEARED', 'POSITIVE_INFECTIOUS', 'DISCARDED') NOT NULL DEFAULT 'PENDING',
    `status` ENUM('AVAILABLE', 'ALLOCATED', 'TRANSFUSED', 'EXPIRED', 'DISCARDED', 'QUARANTINED') NOT NULL DEFAULT 'QUARANTINED',
    `storage_location` VARCHAR(100) NULL COMMENT 'e.g., Freezer-1, Shelf-B',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`unit_id`),
    UNIQUE KEY `uq_blood_units_number` (`unit_number`),
    INDEX `idx_blood_units_donation` (`donation_id`),
    INDEX `idx_blood_units_bank` (`blood_bank_id`),
    INDEX `idx_blood_units_lookup` (`blood_group`, `component_type`, `status`, `expiry_date`),
    CONSTRAINT `fk_unit_donation` FOREIGN KEY (`donation_id`)
        REFERENCES `donations` (`donation_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_unit_bank` FOREIGN KEY (`blood_bank_id`)
        REFERENCES `blood_banks` (`blood_bank_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `chk_unit_dates` CHECK (`expiry_date` >= `collection_date`),
    CONSTRAINT `chk_unit_volume` CHECK (`volume_ml` > 0.0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. REQUESTERS TABLE :- Specialization of User. Can be an individual patient, relative, or coordinator.
CREATE TABLE `requesters` (
    `requester_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `requester_type` ENUM('INDIVIDUAL_PATIENT', 'FAMILY_REPRESENTATIVE', 'HOSPITAL_COORDINATOR') NOT NULL DEFAULT 'INDIVIDUAL_PATIENT',
    `registration_date` DATE NOT NULL DEFAULT (CURRENT_DATE),
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`requester_id`),
    UNIQUE KEY `uq_requesters_user_id` (`user_id`),
    CONSTRAINT `fk_requesters_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. BLOOD_REQUESTS TABLE :- Blood supply requests placed by requesters to specific blood banks for patients.
CREATE TABLE `blood_requests` (
    `request_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `requester_id` INT UNSIGNED NOT NULL,
    `blood_bank_id` INT UNSIGNED NOT NULL,
    `hospital_id` INT UNSIGNED NOT NULL COMMENT 'Destination hospital where patient is admitted',
    `patient_name` VARCHAR(100) NOT NULL,
    `patient_mrn` VARCHAR(50) NULL COMMENT 'Medical Record Number / Admission ID',
    `blood_group` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    `component_type` ENUM('WHOLE_BLOOD', 'PACKED_RED_CELLS', 'FRESH_FROZEN_PLASMA', 'PLATELETS', 'CRYOPRECIPITATE') NOT NULL,
    `quantity_requested` SMALLINT UNSIGNED NOT NULL,
    `urgency` ENUM('NORMAL', 'URGENT', 'EMERGENCY') NOT NULL DEFAULT 'NORMAL',
    `request_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `required_by_date` DATETIME NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'PARTIALLY_ALLOCATED', 'FULFILLED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`request_id`),
    INDEX `idx_blood_req_requester` (`requester_id`),
    INDEX `idx_blood_req_bank` (`blood_bank_id`),
    INDEX `idx_blood_req_hospital` (`hospital_id`),
    INDEX `idx_blood_req_status_urgency` (`status`, `urgency`, `request_date`),
    CONSTRAINT `fk_req_requester` FOREIGN KEY (`requester_id`)
        REFERENCES `requesters` (`requester_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_req_bank` FOREIGN KEY (`blood_bank_id`)
        REFERENCES `blood_banks` (`blood_bank_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_req_hospital` FOREIGN KEY (`hospital_id`)
        REFERENCES `hospitals` (`hospital_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `chk_quantity_requested` CHECK (`quantity_requested` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. ALLOCATIONS TABLE :- Records allocation of blood units to requests.
CREATE TABLE `allocations` (
    `allocation_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `request_id` INT UNSIGNED NOT NULL COMMENT 'One request has multiple allocations',
    `unit_id` INT UNSIGNED NOT NULL COMMENT 'The specific blood unit allocated',
    `allocated_by` INT UNSIGNED NOT NULL COMMENT 'Blood bank staff user ID who allocated',
    `allocation_status` ENUM('RESERVED', 'DISPATCHED', 'TRANSFUSED', 'CANCELLED', 'RETURNED') NOT NULL DEFAULT 'RESERVED',
    `allocation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `dispatch_date` DATETIME NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Generated column to strictly enforce at most one active allocation per unit
    `active_unit_id` INT UNSIGNED GENERATED ALWAYS AS (
        CASE
            WHEN `allocation_status` IN ('RESERVED', 'DISPATCHED') THEN `unit_id`
            ELSE NULL
        END
    ) STORED,

    PRIMARY KEY (`allocation_id`),
    INDEX `idx_allocations_request` (`request_id`),
    INDEX `idx_allocations_unit` (`unit_id`),
    INDEX `idx_allocations_staff` (`allocated_by`),
    INDEX `idx_allocations_status` (`allocation_status`),

    -- Task 9: Guarantee no concurrent active allocation for the same blood unit
    UNIQUE KEY `uq_active_unit_allocation` (`active_unit_id`),

    CONSTRAINT `fk_alloc_request` FOREIGN KEY (`request_id`)
        REFERENCES `blood_requests` (`request_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_alloc_unit` FOREIGN KEY (`unit_id`)
        REFERENCES `blood_units` (`unit_id`)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT `fk_alloc_staff` FOREIGN KEY (`allocated_by`)
        REFERENCES `users` (`user_id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. TRIGGERS FOR DATA INTEGRITY AND REAL-TIME SYNC

DELIMITER $$

-- Trigger 0: Prevent future date of birth on users
DROP TRIGGER IF EXISTS `trg_users_check_dob_before_insert`$$
CREATE TRIGGER `trg_users_check_dob_before_insert`
BEFORE INSERT ON `users`
FOR EACH ROW
BEGIN
    IF NEW.`date_of_birth` > CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: User date_of_birth cannot be in the future.';
    END IF;
END$$

DROP TRIGGER IF EXISTS `trg_users_check_dob_before_update`$$
CREATE TRIGGER `trg_users_check_dob_before_update`
BEFORE UPDATE ON `users`
FOR EACH ROW
BEGIN
    IF NEW.`date_of_birth` > CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: User date_of_birth cannot be in the future.';
    END IF;
END$$

-- Trigger 1: Validate unit eligibility before allocation
DROP TRIGGER IF EXISTS `trg_validate_unit_before_allocation`$$
CREATE TRIGGER `trg_validate_unit_before_allocation`
BEFORE INSERT ON `allocations`
FOR EACH ROW
BEGIN
    DECLARE v_unit_status VARCHAR(20);
    DECLARE v_test_status VARCHAR(30);
    DECLARE v_expiry_date DATE;
    DECLARE v_unit_bank_id INT UNSIGNED;
    DECLARE v_request_bank_id INT UNSIGNED;
    DECLARE v_unit_blood_group VARCHAR(10);
    DECLARE v_unit_component VARCHAR(30);
    DECLARE v_request_blood_group VARCHAR(10);
    DECLARE v_request_component VARCHAR(30);

    -- Fetch unit details
    SELECT `status`, `test_status`, `expiry_date`, `blood_bank_id`, `blood_group`, `component_type`
    INTO v_unit_status, v_test_status, v_expiry_date, v_unit_bank_id, v_unit_blood_group, v_unit_component
    FROM `blood_units`
    WHERE `unit_id` = NEW.`unit_id`;

    -- Fetch request details
    SELECT `blood_bank_id`, `blood_group`, `component_type`
    INTO v_request_bank_id, v_request_blood_group, v_request_component
    FROM `blood_requests`
    WHERE `request_id` = NEW.`request_id`;

    -- Check if allocating an active status
    IF NEW.`allocation_status` IN ('RESERVED', 'DISPATCHED') THEN
        -- Prevent allocating non-cleared units
        IF v_test_status != 'NEGATIVE_CLEARED' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Error: Cannot allocate blood unit that has not passed mandatory infectious disease testing (NEGATIVE_CLEARED).';
        END IF;

        -- Prevent allocating expired units
        IF v_expiry_date < CURRENT_DATE THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Error: Cannot allocate an expired blood unit.';
        END IF;

        -- Prevent allocating if unit is not currently AVAILABLE
        IF v_unit_status != 'AVAILABLE' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Error: Blood unit is not available for allocation.';
        END IF;

        -- Ensure unit belongs to the same blood bank servicing the request
        IF v_unit_bank_id != v_request_bank_id THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Error: Blood unit does not belong to the blood bank handling this request.';
        END IF;

        -- Ensure unit blood group matches the requested blood group
        IF v_unit_blood_group != v_request_blood_group THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Error: Blood unit blood group does not match the requested blood group.';
        END IF;

        -- Ensure component type matches the request
        IF v_unit_component != v_request_component THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Error: Blood unit component type does not match the requested component.';
        END IF;
    END IF;
END$$

-- Trigger 2: Sync blood unit status after allocation insert
DROP TRIGGER IF EXISTS `trg_sync_unit_after_allocation_insert`$$
CREATE TRIGGER `trg_sync_unit_after_allocation_insert`
AFTER INSERT ON `allocations`
FOR EACH ROW
BEGIN
    IF NEW.`allocation_status` IN ('RESERVED', 'DISPATCHED') THEN
        UPDATE `blood_units`
        SET `status` = 'ALLOCATED'
        WHERE `unit_id` = NEW.`unit_id`;
    END IF;
END$$

-- Trigger 3: Sync blood unit status upon allocation update
DROP TRIGGER IF EXISTS `trg_sync_unit_after_allocation_update`$$
CREATE TRIGGER `trg_sync_unit_after_allocation_update`
AFTER UPDATE ON `allocations`
FOR EACH ROW
BEGIN
    -- If allocation cancelled or returned, return unit to AVAILABLE
    IF NEW.`allocation_status` IN ('CANCELLED', 'RETURNED')
       AND OLD.`allocation_status` IN ('RESERVED', 'DISPATCHED') THEN
        UPDATE `blood_units`
        SET `status` = 'AVAILABLE'
        WHERE `unit_id` = NEW.`unit_id`;
    -- If unit was transfused
    ELSEIF NEW.`allocation_status` = 'TRANSFUSED' THEN
        UPDATE `blood_units`
        SET `status` = 'TRANSFUSED'
        WHERE `unit_id` = NEW.`unit_id`;
    -- If allocation reactivated to RESERVED or DISPATCHED
    ELSEIF NEW.`allocation_status` IN ('RESERVED', 'DISPATCHED')
       AND OLD.`allocation_status` NOT IN ('RESERVED', 'DISPATCHED') THEN
        UPDATE `blood_units`
        SET `status` = 'ALLOCATED'
        WHERE `unit_id` = NEW.`unit_id`;
    END IF;
END$$

DELIMITER ;

-- 16. VIEWS & ACCESS PROTECTION

-- View A: Anonymized donor health view for analytics / reports (Task 10 protection)
CREATE OR REPLACE VIEW `v_donor_health_anonymized` AS
SELECT
    dh.`health_id`,
    SHA2(CONCAT(dh.`donor_id`, 'BBMS_SALT_2026'), 256) AS `anonymized_donor_ref`,
    dh.`blood_group`,
    dh.`height_cm`,
    dh.`weight_kg`,
    ROUND(dh.`weight_kg` / POW(dh.`height_cm` / 100, 2), 2) AS `calculated_bmi`,
    dh.`last_donation_date`,
    dh.`has_addiction`,
    dh.`created_at`
FROM `donor_health` dh;

-- View B: Authorized medical screening view (for doctors / medical officers only)
CREATE OR REPLACE VIEW `v_donor_health_authorized` AS
SELECT
    u.`user_id`,
    d.`donor_id`,
    CONCAT(u.`first_name`, ' ', u.`last_name`) AS `donor_full_name`,
    TIMESTAMPDIFF(YEAR, u.`date_of_birth`, CURRENT_DATE) AS `donor_age`,
    u.`gender`,
    u.`phone`,
    dh.`blood_group`,
    dh.`height_cm`,
    dh.`weight_kg`,
    dh.`last_donation_date`,
    dh.`has_addiction`,
    dh.`addiction_details`,
    dh.`medications`,
    dh.`previous_illness`,
    dh.`recent_surgery`,
    d.`status` AS `donor_status`
FROM `donors` d
JOIN `users` u ON d.`user_id` = u.`user_id`
LEFT JOIN `donor_health` dh ON d.`donor_id` = dh.`donor_id`;

-- View C: Real-time available blood inventory by Blood Bank
CREATE OR REPLACE VIEW `v_available_blood_inventory` AS
SELECT
    bb.`blood_bank_id`,
    bb.`name` AS `blood_bank_name`,
    bu.`blood_group`,
    bu.`component_type`,
    COUNT(bu.`unit_id`) AS `available_units_count`,
    MIN(bu.`expiry_date`) AS `earliest_expiry_date`
FROM `blood_units` bu
JOIN `blood_banks` bb ON bu.`blood_bank_id` = bb.`blood_bank_id`
WHERE bu.`status` = 'AVAILABLE'
  AND bu.`test_status` = 'NEGATIVE_CLEARED'
  AND bu.`expiry_date` >= CURRENT_DATE
GROUP BY bb.`blood_bank_id`, bb.`name`, bu.`blood_group`, bu.`component_type`;

-- View D: Request fulfillment summary tracking allocations
CREATE OR REPLACE VIEW `v_request_fulfillment_summary` AS
SELECT
    br.`request_id`,
    br.`patient_name`,
    br.`blood_group`,
    br.`component_type`,
    br.`quantity_requested`,
    COUNT(CASE WHEN a.`allocation_status` IN ('RESERVED', 'DISPATCHED', 'TRANSFUSED') THEN a.`allocation_id` END) AS `units_allocated_count`,
    (br.`quantity_requested` - COUNT(CASE WHEN a.`allocation_status` IN ('RESERVED', 'DISPATCHED', 'TRANSFUSED') THEN a.`allocation_id` END)) AS `remaining_units_needed`,
    br.`urgency`,
    br.`status` AS `request_status`,
    br.`required_by_date`
FROM `blood_requests` br
LEFT JOIN `allocations` a ON br.`request_id` = a.`request_id`
GROUP BY br.`request_id`, br.`patient_name`, br.`blood_group`, br.`component_type`,
         br.`quantity_requested`, br.`urgency`, br.`status`, br.`required_by_date`;

-- Restore system configurations
SET SQL_MODE = @OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;

