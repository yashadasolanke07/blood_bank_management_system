-- ============================================================================
-- Blood Bank Management System (HemoCare BBMS)
-- Database Schema: Strictly Aligned with Frontend Operations & UI Models
-- Target Engine: MySQL 8.0+
-- File: database/schema.sql
-- ============================================================================

SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS, UNIQUE_CHECKS = 0;
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS = 0;
SET @OLD_SQL_MODE = @@SQL_MODE, SQL_MODE = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';

CREATE DATABASE IF NOT EXISTS `blood_bank_db`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `blood_bank_db`;

-- ----------------------------------------------------------------------------
-- Drop existing views
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS `v_hospital_blood_inventory`;
DROP VIEW IF EXISTS `v_available_blood_inventory`;

-- ----------------------------------------------------------------------------
-- Drop existing triggers
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_validate_allocation_before_insert`;
DROP TRIGGER IF EXISTS `trg_sync_unit_after_allocation_insert`;
DROP TRIGGER IF EXISTS `trg_sync_unit_after_allocation_update`;

-- ----------------------------------------------------------------------------
-- Drop existing tables in reverse dependency order
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `allocations`;
DROP TABLE IF EXISTS `blood_requests`;
DROP TABLE IF EXISTS `blood_units`;
DROP TABLE IF EXISTS `donations`;
DROP TABLE IF EXISTS `clinical_checkups`;
DROP TABLE IF EXISTS `donors`;
DROP TABLE IF EXISTS `hospitals`;
DROP TABLE IF EXISTS `staff_users`;
DROP TABLE IF EXISTS `central_blood_bank`;

-- ============================================================================
-- 1. STAFF USERS (Authentication & Role Portal Switching)
-- Frontend: Login Modal, Topbar Profile, Role-Based Route Guards
-- ============================================================================
CREATE TABLE `staff_users` (
    `user_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(120) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(25) NOT NULL,
    `role` ENUM('HOSPITAL_STAFF', 'BLOOD_BANK_STAFF', 'ADMIN') NOT NULL,
    `facility_name` VARCHAR(150) NOT NULL DEFAULT 'Central Blood Bank Hub',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `uq_staff_email` (`email`),
    INDEX `idx_staff_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. PARTNER HOSPITALS (Healthcare Facilities Network)
-- Frontend: Partner Hospitals Screen (/hospitals) & Registration Modal
-- ============================================================================
CREATE TABLE `hospitals` (
    `hospital_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `license_number` VARCHAR(60) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `city` VARCHAR(80) NOT NULL DEFAULT 'Pune',
    `address` TEXT NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Verified',
    PRIMARY KEY (`hospital_id`),
    UNIQUE KEY `uq_hospitals_license` (`license_number`),
    INDEX `idx_hospitals_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. DONORS (Walk-in Citizens Intake & Medical History)
-- Frontend: Donors Screen (/donors), Add Donor Modal & Donor Vitals Modal
-- ============================================================================
CREATE TABLE `donors` (
    `donor_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(120) NOT NULL,
    `blood_group` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    `age` TINYINT UNSIGNED NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL DEFAULT 'MALE',
    `phone` VARCHAR(30) NOT NULL,
    `city` VARCHAR(80) NOT NULL DEFAULT 'Pune',
    `address` TEXT,
    `weight_kg` DECIMAL(5,2) NOT NULL,
    `height_cm` DECIMAL(5,2) NOT NULL,
    `has_addiction` BOOLEAN NOT NULL DEFAULT FALSE,
    `addiction_details` VARCHAR(255) DEFAULT 'None',
    `medications` TEXT,
    `previous_illness` TEXT,
    `recent_surgery` TEXT,
    `last_donation_date` DATE DEFAULT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`donor_id`),
    INDEX `idx_donors_blood` (`blood_group`),
    INDEX `idx_donors_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. CLINICAL CHECKUPS (Pre-Donation Appointments & Examination)
-- Frontend: Conduct Checkup Modal (/donors), Status & Decision Badges
-- ============================================================================
CREATE TABLE `clinical_checkups` (
    `checkup_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `donor_id` INT UNSIGNED NOT NULL,
    `hospital_id` INT UNSIGNED NOT NULL,
    `appointment_status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    `checkup_date` DATE NOT NULL,
    `time_slot` TIME NOT NULL DEFAULT '09:30:00',
    `hemoglobin_level` DECIMAL(4,1) DEFAULT 14.0,
    `bp_systolic` SMALLINT UNSIGNED DEFAULT 120,
    `bp_diastolic` SMALLINT UNSIGNED DEFAULT 80,
    `temperature_celsius` DECIMAL(4,2) DEFAULT 36.6,
    `pulse_rate` SMALLINT UNSIGNED DEFAULT 72,
    `decision` ENUM('ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'ACCEPTED',
    `remarks` TEXT,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`checkup_id`),
    INDEX `idx_checkups_donor` (`donor_id`),
    INDEX `idx_checkups_hospital` (`hospital_id`),
    INDEX `idx_checkups_decision` (`decision`),
    CONSTRAINT `fk_checkup_donor` FOREIGN KEY (`donor_id`) REFERENCES `donors` (`donor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_checkup_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`hospital_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `chk_bp_systolic` CHECK (`bp_systolic` IS NULL OR `bp_systolic` BETWEEN 50 AND 260),
    CONSTRAINT `chk_bp_diastolic` CHECK (`bp_diastolic` IS NULL OR `bp_diastolic` BETWEEN 30 AND 180),
    CONSTRAINT `chk_hemoglobin` CHECK (`hemoglobin_level` IS NULL OR `hemoglobin_level` >= 0.0),
    CONSTRAINT `chk_temperature` CHECK (`temperature_celsius` IS NULL OR `temperature_celsius` BETWEEN 34.00 AND 42.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. DONATIONS (Blood Collections Conducted for Accepted Donors)
-- Frontend: Blood Collections Screen (/donations) & Collection Modal
-- ============================================================================
CREATE TABLE `donations` (
    `donation_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `donor_id` INT UNSIGNED NOT NULL,
    `hospital_id` INT UNSIGNED NOT NULL,
    `blood_group` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    `units_collected` INT UNSIGNED NOT NULL DEFAULT 1,
    `total_volume_ml` DECIMAL(6,2) NOT NULL DEFAULT 450.00,
    `donation_date` DATE NOT NULL,
    `screening_status` ENUM('CLEARED', 'TESTING', 'REJECTED') NOT NULL DEFAULT 'CLEARED',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`donation_id`),
    INDEX `idx_donations_donor` (`donor_id`),
    INDEX `idx_donations_hospital` (`hospital_id`),
    INDEX `idx_donations_date` (`donation_date`),
    CONSTRAINT `fk_donation_donor` FOREIGN KEY (`donor_id`) REFERENCES `donors` (`donor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_donation_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`hospital_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `chk_donation_volume` CHECK (`total_volume_ml` > 0.0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. BLOOD UNITS (Central Cold Storage Inventory Bags)
-- Frontend: Blood Inventory Screen (/inventory) & FEFO Expiry Ledger
-- ============================================================================
CREATE TABLE `blood_units` (
    `unit_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `donation_id` INT UNSIGNED DEFAULT NULL,
    `unit_number` VARCHAR(60) NOT NULL,
    `blood_group` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    `component_type` ENUM('PACKED_RED_CELLS', 'WHOLE_BLOOD', 'PLATELETS', 'PLASMA') NOT NULL DEFAULT 'PACKED_RED_CELLS',
    `volume_ml` DECIMAL(6,2) NOT NULL DEFAULT 250.00,
    `collection_date` DATE NOT NULL,
    `expiry_date` DATE NOT NULL,
    `test_status` ENUM('NEGATIVE_CLEARED', 'PENDING', 'POSITIVE_REJECTED') NOT NULL DEFAULT 'NEGATIVE_CLEARED',
    `status` ENUM('AVAILABLE', 'ALLOCATED') NOT NULL DEFAULT 'AVAILABLE',
    `storage_location` VARCHAR(100) NOT NULL DEFAULT 'Cold Storage Bay 1',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`unit_id`),
    UNIQUE KEY `uq_unit_number` (`unit_number`),
    INDEX `idx_units_lookup` (`blood_group`, `component_type`, `status`, `expiry_date`),
    CONSTRAINT `fk_unit_donation` FOREIGN KEY (`donation_id`) REFERENCES `donations` (`donation_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. BLOOD REQUESTS (Patient Blood Requisitions Submitted by Hospitals)
-- Frontend: Requisitions Screen (/requests) & Create Requisition Modal
-- ============================================================================
CREATE TABLE `blood_requests` (
    `request_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `hospital_id` INT UNSIGNED NOT NULL,
    `patient_name` VARCHAR(120) NOT NULL,
    `patient_mrn` VARCHAR(60) NOT NULL,
    `blood_group` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    `component_type` ENUM('PACKED_RED_CELLS', 'WHOLE_BLOOD', 'PLATELETS', 'PLASMA') NOT NULL DEFAULT 'PACKED_RED_CELLS',
    `quantity_requested` INT UNSIGNED NOT NULL DEFAULT 1,
    `priority` ENUM('Emergency', 'Urgent', 'Normal') NOT NULL DEFAULT 'Normal',
    `request_date` DATE NOT NULL,
    `required_date` DATE NOT NULL,
    `notes` TEXT,
    `status` ENUM('Pending', 'Fulfilled', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `source_facility_name` VARCHAR(150) DEFAULT NULL,
    `transit_status` ENUM('IN_TRANSIT', 'DELIVERED') DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`request_id`),
    INDEX `idx_req_hospital` (`hospital_id`),
    INDEX `idx_req_status` (`status`),
    INDEX `idx_req_blood` (`blood_group`),
    CONSTRAINT `fk_req_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`hospital_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. ALLOCATIONS (Dispatches from Central Blood Bank to Hospitals)
-- Frontend: "Allot Blood" Action & Dispatch History on (/requests)
-- ============================================================================
CREATE TABLE `allocations` (
    `allocation_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `request_id` INT UNSIGNED NOT NULL,
    `unit_id` INT UNSIGNED NOT NULL,
    `allocated_by` INT UNSIGNED NOT NULL,
    `source_facility` VARCHAR(150) NOT NULL DEFAULT 'Central Blood Bank',
    `destination_hospital` VARCHAR(150) NOT NULL,
    `dispatch_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `allocation_status` ENUM('DISPATCHED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DISPATCHED',
    `notes` TEXT,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`allocation_id`),
    UNIQUE KEY `uq_allocation_request_unit` (`request_id`, `unit_id`),
    INDEX `idx_alc_request` (`request_id`),
    INDEX `idx_alc_unit` (`unit_id`),
    CONSTRAINT `fk_alc_request` FOREIGN KEY (`request_id`) REFERENCES `blood_requests` (`request_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_alc_unit` FOREIGN KEY (`unit_id`) REFERENCES `blood_units` (`unit_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_alc_staff` FOREIGN KEY (`allocated_by`) REFERENCES `staff_users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- VIEWS (Directly Rendered on Frontend Dashboard & Inventory Screens)
-- ============================================================================

-- View 1: Available inventory totals by blood group (Used by /inventory cards)
CREATE VIEW `v_available_blood_inventory` AS
SELECT 
    `blood_group`,
    COUNT(*) AS `units_available`,
    MIN(`expiry_date`) AS `earliest_expiry`
FROM `blood_units`
WHERE `status` = 'AVAILABLE'
  AND `test_status` = 'NEGATIVE_CLEARED'
  AND `expiry_date` >= CURRENT_DATE
GROUP BY `blood_group`;

-- View 2: Hospital-wise blood stock distribution (Used by /inventory table)
CREATE VIEW `v_hospital_blood_inventory` AS
SELECT 
    h.`hospital_id`,
    h.`name` AS `hospital_name`,
    SUM(CASE WHEN bu.`blood_group` = 'A+'  AND bu.`status` = 'AVAILABLE' THEN 1 ELSE 0 END) AS `A+`,
    SUM(CASE WHEN bu.`blood_group` = 'A-'  AND bu.`status` = 'AVAILABLE' THEN 1 ELSE 0 END) AS `A-`,
    SUM(CASE WHEN bu.`blood_group` = 'B+'  AND bu.`status` = 'AVAILABLE' THEN 1 ELSE 0 END) AS `B+`,
    SUM(CASE WHEN bu.`blood_group` = 'B-'  AND bu.`status` = 'AVAILABLE' THEN 1 ELSE 0 END) AS `B-`,
    SUM(CASE WHEN bu.`blood_group` = 'AB+' AND bu.`status` = 'AVAILABLE' THEN 1 ELSE 0 END) AS `AB+`,
    SUM(CASE WHEN bu.`blood_group` = 'AB-' AND bu.`status` = 'AVAILABLE' THEN 1 ELSE 0 END) AS `AB-`,
    SUM(CASE WHEN bu.`blood_group` = 'O+'  AND bu.`status` = 'AVAILABLE' THEN 1 ELSE 0 END) AS `O+`,
    SUM(CASE WHEN bu.`blood_group` = 'O-'  AND bu.`status` = 'AVAILABLE' THEN 1 ELSE 0 END) AS `O-`,
    COUNT(bu.`unit_id`) AS `total_units`
FROM `hospitals` h
LEFT JOIN `donations` d ON h.`hospital_id` = d.`hospital_id`
LEFT JOIN `blood_units` bu ON d.`donation_id` = bu.`donation_id` AND bu.`status` = 'AVAILABLE'
GROUP BY h.`hospital_id`, h.`name`;

-- ============================================================================
-- TRIGGERS (Automated Clinical Safety & Real-Time Status Synchronization)
-- ============================================================================
DELIMITER $$

-- Trigger 1: Validate Allocation Safety & ABO/Rh Compatibility before insertion
CREATE TRIGGER `trg_validate_allocation_before_insert`
BEFORE INSERT ON `allocations`
FOR EACH ROW
BEGIN
    DECLARE v_unit_status VARCHAR(20);
    DECLARE v_test_status VARCHAR(25);
    DECLARE v_expiry_date DATE;
    DECLARE v_unit_bg VARCHAR(10);
    DECLARE v_unit_comp VARCHAR(30);
    DECLARE v_req_bg VARCHAR(10);
    DECLARE v_req_comp VARCHAR(30);

    SELECT `status`, `test_status`, `expiry_date`, `blood_group`, `component_type`
    INTO v_unit_status, v_test_status, v_expiry_date, v_unit_bg, v_unit_comp
    FROM `blood_units`
    WHERE `unit_id` = NEW.`unit_id`;

    SELECT `blood_group`, `component_type`
    INTO v_req_bg, v_req_comp
    FROM `blood_requests`
    WHERE `request_id` = NEW.`request_id`;

    IF NEW.`allocation_status` = 'DISPATCHED' THEN
        -- 1. Ensure unit is available
        IF v_unit_status != 'AVAILABLE' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Clinical Safety Violation: Blood unit is not available in storage.';
        END IF;

        -- 2. Ensure unit has passed infectious disease testing
        IF v_test_status != 'NEGATIVE_CLEARED' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Clinical Safety Violation: Blood unit has not passed negative disease clearance.';
        END IF;

        -- 3. Ensure unit is unexpired
        IF v_expiry_date < CURRENT_DATE THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Clinical Safety Violation: Cannot allocate an expired blood unit.';
        END IF;

        -- 4. Enforce strict ABO/Rh compatibility
        IF NOT (
            (v_req_bg = 'AB+') OR
            (v_req_bg = 'AB-' AND v_unit_bg IN ('AB-', 'A-', 'B-', 'O-')) OR
            (v_req_bg = 'A+'  AND v_unit_bg IN ('A+', 'A-', 'O+', 'O-')) OR
            (v_req_bg = 'A-'  AND v_unit_bg IN ('A-', 'O-')) OR
            (v_req_bg = 'B+'  AND v_unit_bg IN ('B+', 'B-', 'O+', 'O-')) OR
            (v_req_bg = 'B-'  AND v_unit_bg IN ('B-', 'O-')) OR
            (v_req_bg = 'O+'  AND v_unit_bg IN ('O+', 'O-')) OR
            (v_req_bg = 'O-'  AND v_unit_bg = 'O-')
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Clinical Safety Violation: Unit blood group is not compatible with patient ABO/Rh.';
        END IF;

        -- 5. Enforce component matching
        IF v_unit_comp != v_req_comp THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Clinical Safety Violation: Blood unit component type does not match request.';
        END IF;
    END IF;
END$$

-- Trigger 2: Automatically flip unit status to ALLOCATED upon allocation
CREATE TRIGGER `trg_sync_unit_after_allocation_insert`
AFTER INSERT ON `allocations`
FOR EACH ROW
BEGIN
    IF NEW.`allocation_status` = 'DISPATCHED' THEN
        UPDATE `blood_units`
        SET `status` = 'ALLOCATED'
        WHERE `unit_id` = NEW.`unit_id`;
    END IF;
END$$

-- Trigger 3: Return unit to AVAILABLE if allocation is cancelled
CREATE TRIGGER `trg_sync_unit_after_allocation_update`
AFTER UPDATE ON `allocations`
FOR EACH ROW
BEGIN
    IF NEW.`allocation_status` = 'CANCELLED' AND OLD.`allocation_status` = 'DISPATCHED' THEN
        UPDATE `blood_units`
        SET `status` = 'AVAILABLE'
        WHERE `unit_id` = NEW.`unit_id`;
    END IF;
END$$

DELIMITER ;

SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
SET SQL_MODE = @OLD_SQL_MODE;
