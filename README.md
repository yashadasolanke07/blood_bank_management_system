# Blood Bank Management System (BBMS) - Database

A robust, enterprise-grade MySQL 8.0+ relational database for a Blood Bank Management System with strict data-integrity triggers, automated inventory sync, and analytical views.

---

## Repository Structure

```text
blood_bank_management_system/
├── database/
│   ├── schema.sql          # MySQL 8.0 DDL (Tables, Constraints, Triggers, Views)
│   └── sample_data.sql     # Fictional seed records for testing
├── erdiagram.jpeg          # Conceptual Entity-Relationship Diagram
├── .gitignore              # Git rules preventing accidental leaks
└── README.md               # Database setup and documentation
```

---

## 🗄️ Database Setup for You and Your Teammates

Each team member maintains their own local replica of `blood_bank_db`.

### Prerequisites
- **MySQL Server 8.0+** installed on Windows.
- The `mysql` command available in PowerShell / Command Prompt.

---

### Step 1: Import Schema (Create Tables, Triggers & Views)

Run this command in PowerShell from the project folder:

```powershell
Get-Content database/schema.sql -Raw | mysql -u root -p
```
*(Enter your MySQL root password when prompted)*.

---

### Step 2: Import Sample Test Records

Run this command to populate the database with realistic test data:

```powershell
Get-Content database/sample_data.sql -Raw | mysql -u root -p
```

---

### Step 3: Verify the Installation

Run this command to confirm all objects were created:

```powershell
mysql -u root -p -t -e "USE blood_bank_db; SELECT 'TABLES' AS object_type, count(*) AS total_count FROM information_schema.tables WHERE table_schema = 'blood_bank_db' AND table_type = 'BASE TABLE' UNION ALL SELECT 'VIEWS' AS object_type, count(*) AS total_count FROM information_schema.views WHERE table_schema = 'blood_bank_db' UNION ALL SELECT 'TRIGGERS' AS object_type, count(*) AS total_count FROM information_schema.triggers WHERE trigger_schema = 'blood_bank_db';"
```

**Expected Output:**
```text
+-------------+-------------+
| object_type | total_count |
+-------------+-------------+
| TABLES      |          14 |
| VIEWS       |           4 |
| TRIGGERS    |           5 |
+-------------+-------------+
```

---

## 📊 Database Architecture Overview

### Relational Tables (14)
1. **`users`**: Central authentication and profile entity (Admins, Staff, Donors, Requesters).
2. **`donors`**: 1:1 specialization of `users` for blood donors.
3. **`donor_health`**: 1:1 medical metrics and PHI (blood group, height, weight, donation history).
4. **`hospitals`**: Healthcare facilities conducting screenings or receiving blood units.
5. **`blood_banks`**: Storage and distribution hubs.
6. **`blood_bank_staff`**: M:N resolution assigning staff users to specific blood banks.
7. **`appointments`**: Initial screening and consultation appointments booked by donors.
8. **`medical_tests`**: Pre-donation clinical screening records (hemoglobin, BP, pulse).
9. **`donation_appointments`**: Scheduled blood collection appointments following test clearance.
10. **`donations`**: Physical blood draw sessions.
11. **`blood_units`**: Individual blood bags with unique barcode/ISBT unit numbers.
12. **`requesters`**: 1:1 specialization of `users` placing blood requests.
13. **`blood_requests`**: Blood requests with urgency, quantity, and required blood components.
14. **`allocations`**: Reservation and dispatch of specific blood units to requests.

### Views (4)
- **`v_available_blood_inventory`**: Real-time stock count of tested, non-expired, available blood units grouped by bank and component.
- **`v_request_fulfillment_summary`**: Tracks pending vs fulfilled quantities for every blood request.
- **`v_donor_health_authorized`**: Clinical history for authorized medical personnel.
- **`v_donor_health_anonymized`**: De-identified, hashed health data for research and statistics.

### Automated Triggers (5)
- **`trg_users_check_dob_before_insert` / `_update`**: Blocks future dates of birth.
- **`trg_validate_unit_before_allocation`**: Strictly validates that units are tested (`NEGATIVE_CLEARED`), unexpired, available, and match the requested blood group and component before allocation.
- **`trg_sync_unit_after_allocation_insert`**: Automatically marks blood units as `ALLOCATED` upon reservation.
- **`trg_sync_unit_after_allocation_update`**: Automatically restores unit status to `AVAILABLE` if an allocation is cancelled or returned, or marks it `TRANSFUSED`.
