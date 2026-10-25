from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from config import DB_CONFIG

app = Flask(__name__)
CORS(app)

def get_db():
    return mysql.connector.connect(**DB_CONFIG)

ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

# Standard Red Blood Cell compatibility matrix (Recipient -> prioritized allowed donor groups)
BLOOD_COMPATIBILITY = {
    'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
    'AB-': ['AB-', 'A-', 'B-', 'O-'],
    'A+':  ['A+', 'A-', 'O+', 'O-'],
    'A-':  ['A-', 'O-'],
    'B+':  ['B+', 'B-', 'O+', 'O-'],
    'B-':  ['B-', 'O-'],
    'O+':  ['O+', 'O-'],
    'O-':  ['O-'],
}

# 1. INVENTORY (Live stock from blood_units)
@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                bu.blood_group AS blood,
                COUNT(bu.unit_id) AS units,
                DATE_FORMAT(MIN(bu.expiry_date), '%Y-%m-%d') AS expiry
            FROM blood_units bu
            WHERE bu.status = 'AVAILABLE'
              AND bu.test_status = 'NEGATIVE_CLEARED'
              AND bu.expiry_date >= CURRENT_DATE
            GROUP BY bu.blood_group
        """)
        db_rows = {row['blood']: row for row in cur.fetchall()}

        result = []
        for bg in ALL_BLOOD_GROUPS:
            if bg in db_rows:
                result.append({
                    'blood': bg,
                    'units': int(db_rows[bg]['units']),
                    'minimum': 10,
                    'expiry': db_rows[bg]['expiry'] or '2026-11-30'
                })
            else:
                result.append({
                    'blood': bg,
                    'units': 0,
                    'minimum': 10,
                    'expiry': 'Out of Stock'
                })

        return jsonify(result)
    finally:
        cur.close()
        conn.close()

@app.route('/api/inventory/by-hospital', methods=['GET'])
def get_inventory_by_hospital():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                hospital_id,
                hospital_name,
                `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`,
                total_units
            FROM v_hospital_blood_inventory
            ORDER BY hospital_name
        """)
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        conn.close()

# 2. DONORS
@app.route('/api/donors', methods=['GET'])
def get_donors():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT
                CONCAT('D-', donor_id) AS id,
                donor_full_name AS name,
                blood_group AS blood,
                donor_age AS age,
                phone,
                'Pune' AS city,
                DATE_FORMAT(last_donation_date, '%Y-%m-%d') AS lastDonation,
                IF(donor_status IN ('ACTIVE','ELIGIBLE'), 'Active', 'Inactive') AS status
            FROM v_donor_health_authorized
            ORDER BY donor_id DESC
        """)
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.route('/api/donors', methods=['POST'])
def add_donor():
    data = request.get_json()
    conn = get_db()
    cur = conn.cursor()
    try:
        parts = data['name'].strip().split(' ', 1)
        first = parts[0]
        last = parts[1] if len(parts) > 1 else 'Donor'

        cur.execute("""
            INSERT INTO users
                (first_name, last_name, email, password_hash,
                 phone, gender, date_of_birth, address, role)
            VALUES (%s, %s, %s,
                '$2a$12$dummyhashforcollegedemo',
                %s, 'OTHER',
                DATE_SUB(CURRENT_DATE, INTERVAL %s YEAR),
                %s, 'DONOR')
        """, (first, last,
              f"donor_{data['phone']}@bbms.org",
              data['phone'],
              int(data.get('age', 25)),
              data.get('city', 'Pune')))
        user_id = cur.lastrowid

        cur.execute("INSERT INTO donors (user_id, status) VALUES (%s, 'ACTIVE')", (user_id,))
        donor_id = cur.lastrowid

        cur.execute("""
            INSERT INTO donor_health
                (donor_id, blood_group, height_cm, weight_kg, last_donation_date)
            VALUES (%s, %s, 170.0, 65.0, %s)
        """, (donor_id, data['blood'], data.get('lastDonation') or None))

        conn.commit()
        return jsonify({'success': True, 'id': f'D-{donor_id}'}), 201
    except Exception as exc:
        conn.rollback()
        return jsonify({'error': str(exc)}), 400
    finally:
        cur.close()
        conn.close()

# 3. REQUESTS
@app.route('/api/requests', methods=['GET'])
def get_requests():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT
                CONCAT('REQ-', r.request_id) AS id,
                r.patient_name AS patient,
                h.name AS hospital,
                r.blood_group AS blood,
                r.quantity_requested AS units,
                DATE_FORMAT(r.required_by_date, '%Y-%m-%d') AS date,
                CASE r.urgency
                    WHEN 'EMERGENCY' THEN 'Emergency'
                    WHEN 'URGENT' THEN 'Urgent'
                    ELSE 'Normal'
                END AS priority,
                CASE r.status
                    WHEN 'FULFILLED' THEN 'Fulfilled'
                    WHEN 'APPROVED' THEN 'Approved'
                    WHEN 'PARTIALLY_ALLOCATED' THEN 'Approved'
                    WHEN 'CANCELLED' THEN 'Rejected'
                    WHEN 'REJECTED' THEN 'Rejected'
                    ELSE 'Pending'
                END AS status
            FROM blood_requests r
            JOIN hospitals h ON r.hospital_id = h.hospital_id
            ORDER BY r.request_id DESC
        """)
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.route('/api/requests', methods=['POST'])
def add_request():
    data = request.get_json()
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        urgency = 'URGENT' if data.get('priority') == 'Urgent' else 'NORMAL'
        
        hospital_name = data.get('hospital', '').strip()
        cur.execute("SELECT hospital_id FROM hospitals WHERE name LIKE %s LIMIT 1", (f"%{hospital_name}%",))
        h_row = cur.fetchone()
        hospital_id = h_row['hospital_id'] if h_row else 1

        cur.execute("""
            INSERT INTO blood_requests
                (requester_id, blood_bank_id, hospital_id, patient_name,
                 blood_group, component_type, quantity_requested, urgency,
                 request_date, required_by_date, status)
            VALUES (1, 1, %s, %s, %s, 'PACKED_RED_CELLS', %s, %s,
                    CURRENT_TIMESTAMP, DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), 'PENDING')
        """, (hospital_id, data['patient'], data['blood'], int(data.get('units', 1)), urgency))

        request_id = cur.lastrowid
        conn.commit()
        return jsonify({'success': True, 'id': f'REQ-{request_id}'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

@app.route('/api/requests/<int:req_id>/status', methods=['PATCH'])
def update_request_status(req_id):
    data = request.get_json()
    new_status = data.get('status', '').upper()
    if new_status == 'APPROVED': db_status = 'APPROVED'
    elif new_status == 'REJECTED': db_status = 'REJECTED'
    elif new_status == 'PENDING': db_status = 'PENDING'
    else: return jsonify({'error': 'Invalid status'}), 400

    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("UPDATE blood_requests SET status = %s WHERE request_id = %s", (db_status, req_id))
        conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

@app.route('/api/requests/<int:req_id>/fulfill', methods=['POST'])
def fulfill_request(req_id):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("SELECT blood_group, component_type, blood_bank_id, quantity_requested, status FROM blood_requests WHERE request_id = %s", (req_id,))
        req_row = cur.fetchone()
        if not req_row:
            return jsonify({'error': 'Request not found'}), 404

        patient_bg = req_row['blood_group']
        req_component = req_row['component_type'] or 'PACKED_RED_CELLS'
        req_bank_id = req_row['blood_bank_id'] or 1
        compatible_groups = BLOOD_COMPATIBILITY.get(patient_bg, [patient_bg])

        placeholders = ', '.join(['%s'] * len(compatible_groups))
        field_order = ', '.join(['%s'] * len(compatible_groups))

        # Prefer exact match first, then compatible donor groups, matching component type and servicing blood bank, nearest expiring unit (FEFO)
        query = f"""
            SELECT unit_id, blood_group, component_type FROM blood_units
            WHERE blood_group IN ({placeholders})
              AND component_type = %s
              AND blood_bank_id = %s
              AND status = 'AVAILABLE'
              AND test_status = 'NEGATIVE_CLEARED'
              AND expiry_date >= CURRENT_DATE
            ORDER BY FIELD(blood_group, {field_order}), expiry_date ASC
            LIMIT 1
        """
        params = list(compatible_groups) + [req_component, req_bank_id] + list(compatible_groups)
        cur.execute(query, tuple(params))
        unit = cur.fetchone()

        if not unit:
            return jsonify({'error': f"No available or compatible {req_component} units in stock for {patient_bg}"}), 400

        cur.execute("""
            INSERT INTO allocations (request_id, unit_id, allocated_by, allocation_status)
            VALUES (%s, %s, 4, 'RESERVED')
        """, (req_id, unit['unit_id']))

        cur.execute("UPDATE blood_requests SET status = 'FULFILLED' WHERE request_id = %s", (req_id,))

        conn.commit()

        is_exact = (unit['blood_group'] == patient_bg)
        msg = f"Allocated exact match ({unit['blood_group']}) unit #{unit['unit_id']}." if is_exact else f"Allocated compatible donor ({unit['blood_group']}) unit #{unit['unit_id']} for {patient_bg} patient."

        return jsonify({
            'success': True,
            'allocated_unit_id': unit['unit_id'],
            'allocated_blood_group': unit['blood_group'],
            'message': msg
        })
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

# 4. DONATIONS (GET & POST)
@app.route('/api/donations', methods=['GET'])
def get_donations():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT
                CONCAT('DON-', d.donation_id) AS id,
                CONCAT(u.first_name, ' ', u.last_name) AS donor,
                d.blood_group AS blood,
                1 AS units,
                DATE_FORMAT(d.donation_date, '%Y-%m-%d') AS date,
                h.name AS location
            FROM donations d
            JOIN donors dn ON d.donor_id = dn.donor_id
            JOIN users u ON dn.user_id = u.user_id
            JOIN hospitals h ON d.hospital_id = h.hospital_id
            ORDER BY d.donation_id DESC
        """)
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.route('/api/donations', methods=['POST'])
def add_donation():
    data = request.get_json()
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        donor_name = data.get('donor', '').strip()
        blood_group = data.get('blood', 'O+').strip()
        units_to_add = int(data.get('units', 1))

        # 1. Match donor
        cur.execute("""
            SELECT d.donor_id, d.user_id
            FROM donors d
            JOIN users u ON d.user_id = u.user_id
            WHERE CONCAT(u.first_name, ' ', u.last_name) LIKE %s
            LIMIT 1
        """, (f"%{donor_name}%",))
        donor_row = cur.fetchone()
        
        if donor_row:
            donor_id = donor_row['donor_id']
        else:
            cur.execute("SELECT donor_id FROM donors ORDER BY donor_id DESC LIMIT 1")
            fallback = cur.fetchone()
            donor_id = fallback['donor_id'] if fallback else 1

        # 2. Match hospital
        loc_name = data.get('location', '').strip()
        cur.execute("SELECT hospital_id FROM hospitals WHERE name LIKE %s LIMIT 1", (f"%{loc_name}%",))
        h_row = cur.fetchone()
        hospital_id = h_row['hospital_id'] if h_row else 1

        # 3. Create pre-screening appointment
        cur.execute("""
            INSERT INTO appointments
                (donor_id, hospital_id, appointment_date, timeslot, appointment_status)
            VALUES (%s, %s, CURRENT_DATE, '09:00:00', 'COMPLETED')
        """, (donor_id, hospital_id))
        pre_appt_id = cur.lastrowid

        # 4. Create medical test cleared entry
        cur.execute("""
            INSERT INTO medical_tests
                (appointment_id, donor_id, recorded_by, test_date, hemoglobin_level,
                 blood_pressure_systolic, blood_pressure_diastolic, pulse_rate,
                 temperature_celsius, result, eligibility)
            VALUES (%s, %s, 8, CURRENT_TIMESTAMP, 14.5, 120, 80, 72, 36.6, 'PASSED', 'ELIGIBLE')
        """, (pre_appt_id, donor_id))
        med_test_id = cur.lastrowid

        # 5. Create donation appointment using unique test_id
        cur.execute("""
            INSERT INTO donation_appointments
                (medical_test_id, donor_id, hospital_id, appointment_date, time_slot, status)
            VALUES (%s, %s, %s, CURRENT_DATE, '10:00:00', 'COMPLETED')
        """, (med_test_id, donor_id, hospital_id))
        don_appt_id = cur.lastrowid

        # 6. Insert donation session
        cur.execute("""
            INSERT INTO donations
                (donation_appt_id, donor_id, hospital_id, blood_group, donation_type,
                 donation_date, quality, screening_status, total_volume_ml)
            VALUES (%s, %s, %s, %s, 'WHOLE_BLOOD', CURRENT_TIMESTAMP, 'GOOD', 'CLEARED', %s)
        """, (don_appt_id, donor_id, hospital_id, blood_group, units_to_add * 450.0))
        donation_id = cur.lastrowid

        # 7. Add blood units with unique barcodes
        import time
        ts = int(time.time())
        for i in range(units_to_add):
            unit_code = f"BBMS-{donation_id}-{i+1}-{ts}"
            cur.execute("""
                INSERT INTO blood_units
                    (donation_id, blood_bank_id, unit_number, blood_group, component_type,
                     volume_ml, collection_date, expiry_date, test_status, status, storage_location)
                VALUES (%s, 1, %s, %s, 'PACKED_RED_CELLS', 250.0, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 35 DAY),
                        'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 1')
            """, (donation_id, unit_code, blood_group))

        # 8. Update donor last donation date
        cur.execute("UPDATE donor_health SET last_donation_date = CURRENT_DATE WHERE donor_id = %s", (donor_id,))

        conn.commit()
        return jsonify({'success': True, 'id': f'DON-{donation_id}'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

# 5. HOSPITALS
@app.route('/api/hospitals', methods=['GET'])
def get_hospitals():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT
                CONCAT('H-', hospital_id) AS id,
                name,
                'Dr. In-Charge' AS contact,
                phone,
                address AS city,
                'Verified' AS status
            FROM hospitals
            ORDER BY hospital_id
        """)
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.route('/api/hospitals', methods=['POST'])
def add_hospital():
    import time
    data = request.get_json()
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        name = data.get('name', '').strip()
        phone = data.get('phone', '9876543210').strip()
        city = data.get('city', 'Pune').strip()
        ts = int(time.time())
        license_num = f"LIC-{ts}"
        email = f"contact_{ts}@hospital.org"

        cur.execute("""
            INSERT INTO hospitals (name, license_number, phone, email, address)
            VALUES (%s, %s, %s, %s, %s)
        """, (name, license_num, phone, email, city))
        h_id = cur.lastrowid
        conn.commit()
        return jsonify({'success': True, 'id': f"H-{h_id}"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    app.run(port=5000, debug=True)
