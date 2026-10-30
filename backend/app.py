"""
HemoCare Blood Bank Management System (BBMS) - Schema-Aligned Backend API Server
Target: MySQL 8.0+ / Flask REST API
All returned JSON keys strictly match the 9 schema tables.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from config import DB_CONFIG
import time

app = Flask(__name__)
CORS(app)

def get_db():
    return mysql.connector.connect(**DB_CONFIG)

BLOOD_COMPATIBILITY = {
    'O+':  ['O+', 'O-'],
    'O-':  ['O-'],
    'A+':  ['A+', 'A-', 'O+', 'O-'],
    'A-':  ['A-', 'O-'],
    'B+':  ['B+', 'B-', 'O+', 'O-'],
    'B-':  ['B-', 'O-'],
    'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
    'AB-': ['AB-', 'A-', 'B-', 'O-']
}

# ============================================================================
# 1. INVENTORY (blood_units, v_available_blood_inventory)
# ============================================================================
@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                bg.blood_group,
                bg.blood_group AS blood,
                COALESCE(inv.units_available, 0) AS units,
                COALESCE(inv.units_available, 0) AS units_available,
                COALESCE(DATE_FORMAT(inv.earliest_expiry, '%Y-%m-%d'), 'N/A') AS expiry,
                COALESCE(DATE_FORMAT(inv.earliest_expiry, '%Y-%m-%d'), 'N/A') AS earliest_expiry,
                10 AS minimum
            FROM (
                SELECT 'A+' AS blood_group UNION ALL SELECT 'A-' UNION ALL
                SELECT 'B+' UNION ALL SELECT 'B-' UNION ALL
                SELECT 'AB+' UNION ALL SELECT 'AB-' UNION ALL
                SELECT 'O+' UNION ALL SELECT 'O-'
            ) bg
            LEFT JOIN v_available_blood_inventory inv ON bg.blood_group = inv.blood_group
            ORDER BY bg.blood_group ASC
        """)
        return jsonify(cur.fetchall())
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
                hospital_name AS name,
                `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`,
                total_units
            FROM v_hospital_blood_inventory
            ORDER BY hospital_id ASC
        """)
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.route('/api/inventory/units', methods=['GET'])
def get_inventory_units():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                unit_id,
                CONCAT('UNT-', unit_id) AS id,
                unit_number,
                blood_group,
                component_type,
                volume_ml,
                DATE_FORMAT(collection_date, '%Y-%m-%d') AS collection_date,
                DATE_FORMAT(expiry_date, '%Y-%m-%d') AS expiry_date,
                DATEDIFF(expiry_date, CURRENT_DATE) AS days_to_expiry,
                test_status,
                storage_location,
                status
            FROM blood_units
            WHERE status = 'AVAILABLE' AND expiry_date >= CURRENT_DATE
            ORDER BY expiry_date ASC
        """)
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        conn.close()

# ============================================================================
# 2. DONORS & CLINICAL CHECKUPS (donors, clinical_checkups)
# ============================================================================
@app.route('/api/donors', methods=['GET'])
def get_donors():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                CONCAT('D-', d.donor_id) AS id,
                d.donor_id,
                d.full_name,
                d.full_name AS name,
                d.blood_group,
                d.blood_group AS blood,
                d.age,
                d.gender,
                d.phone,
                d.city,
                d.address,
                d.weight_kg,
                d.weight_kg AS weight,
                d.height_cm,
                d.height_cm AS height,
                d.has_addiction,
                COALESCE(d.addiction_details, 'None') AS addiction_details,
                COALESCE(d.medications, 'None') AS medications,
                COALESCE(d.previous_illness, 'None') AS previous_illness,
                COALESCE(d.recent_surgery, 'None') AS recent_surgery,
                DATE_FORMAT(d.last_donation_date, '%Y-%m-%d') AS last_donation_date,
                DATE_FORMAT(d.last_donation_date, '%Y-%m-%d') AS lastDonation,
                d.status AS donor_status,
                (SELECT c.appointment_status FROM clinical_checkups c WHERE c.donor_id = d.donor_id ORDER BY c.checkup_id DESC LIMIT 1) AS appointment_status,
                (SELECT c.appointment_status FROM clinical_checkups c WHERE c.donor_id = d.donor_id ORDER BY c.checkup_id DESC LIMIT 1) AS appt_status,
                (SELECT c.checkup_id FROM clinical_checkups c WHERE c.donor_id = d.donor_id ORDER BY c.checkup_id DESC LIMIT 1) AS checkup_id,
                (SELECT DATE_FORMAT(c.checkup_date, '%Y-%m-%d') FROM clinical_checkups c WHERE c.donor_id = d.donor_id ORDER BY c.checkup_id DESC LIMIT 1) AS checkup_date,
                (SELECT DATE_FORMAT(c.checkup_date, '%Y-%m-%d') FROM clinical_checkups c WHERE c.donor_id = d.donor_id ORDER BY c.checkup_id DESC LIMIT 1) AS appt_date,
                (SELECT DATE_FORMAT(c.time_slot, '%H:%i') FROM clinical_checkups c WHERE c.donor_id = d.donor_id ORDER BY c.checkup_id DESC LIMIT 1) AS time_slot,
                (SELECT DATE_FORMAT(c.time_slot, '%H:%i') FROM clinical_checkups c WHERE c.donor_id = d.donor_id ORDER BY c.checkup_id DESC LIMIT 1) AS appt_timeslot,
                (SELECT c.decision FROM clinical_checkups c WHERE c.donor_id = d.donor_id ORDER BY c.checkup_id DESC LIMIT 1) AS decision,
                (SELECT c.remarks FROM clinical_checkups c WHERE c.donor_id = d.donor_id ORDER BY c.checkup_id DESC LIMIT 1) AS remarks,
                (SELECT c.remarks FROM clinical_checkups c WHERE c.donor_id = d.donor_id ORDER BY c.checkup_id DESC LIMIT 1) AS test_remarks,
                (SELECT CAST(c.hemoglobin_level AS CHAR) FROM clinical_checkups c WHERE c.donor_id = d.donor_id ORDER BY c.checkup_id DESC LIMIT 1) AS hemoglobin_level,
                (SELECT CAST(c.hemoglobin_level AS CHAR) FROM clinical_checkups c WHERE c.donor_id = d.donor_id ORDER BY c.checkup_id DESC LIMIT 1) AS hemoglobin,
                (SELECT c.bp_systolic FROM clinical_checkups c WHERE c.donor_id = d.donor_id ORDER BY c.checkup_id DESC LIMIT 1) AS bp_systolic,
                (SELECT c.bp_diastolic FROM clinical_checkups c WHERE c.donor_id = d.donor_id ORDER BY c.checkup_id DESC LIMIT 1) AS bp_diastolic,
                (SELECT CAST(c.temperature_celsius AS CHAR) FROM clinical_checkups c WHERE c.donor_id = d.donor_id ORDER BY c.checkup_id DESC LIMIT 1) AS temperature_celsius,
                (SELECT CAST(c.temperature_celsius AS CHAR) FROM clinical_checkups c WHERE c.donor_id = d.donor_id ORDER BY c.checkup_id DESC LIMIT 1) AS temperature,
                (SELECT c.pulse_rate FROM clinical_checkups c WHERE c.donor_id = d.donor_id ORDER BY c.checkup_id DESC LIMIT 1) AS pulse_rate
            FROM donors d
            ORDER BY d.donor_id DESC
        """)
        rows = cur.fetchall()
        for r in rows:
            decision = r.get('decision')
            if decision == 'ACCEPTED':
                r['clinical_status'] = 'ACCEPTED'
            elif decision == 'REJECTED':
                r['clinical_status'] = 'REJECTED'
            else:
                r['clinical_status'] = 'PENDING_CHECKUP'
            r['status'] = r['clinical_status']
        return jsonify(rows)
    finally:
        cur.close()
        conn.close()

@app.route('/api/donors', methods=['POST'])
def add_donor():
    data = request.get_json() or {}
    conn = get_db()
    cur = conn.cursor()
    try:
        full_name = data.get('full_name') or data.get('name', '').strip() or 'Walk-in Donor'
        blood_group = data.get('blood_group') or data.get('blood', 'O+').strip()
        age = int(data.get('age', 25))
        gender = str(data.get('gender', 'MALE')).upper()
        if gender not in ['MALE', 'FEMALE', 'OTHER']:
            gender = 'MALE'
        phone = data.get('phone', '').strip() or f"99{int(time.time()) % 100000000}"
        city = data.get('city', 'Pune').strip()
        address = data.get('address', '').strip() or f"{city}, Maharashtra"
        weight = float(data.get('weight_kg') or data.get('weight', 65.0))
        height = float(data.get('height_cm') or data.get('height', 170.0))
        has_addiction = 1 if str(data.get('has_addiction', '')).lower() in ['1', 'true', 'yes'] else 0
        addiction_details = data.get('addiction_details') or 'None'
        medications = data.get('medications') or 'None'
        previous_illness = data.get('previous_illness') or 'None'
        recent_surgery = data.get('recent_surgery') or 'None'

        cur.execute("""
            INSERT INTO donors 
                (full_name, blood_group, age, gender, phone, city, address,
                 weight_kg, height_cm, has_addiction, addiction_details,
                 medications, previous_illness, recent_surgery)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (full_name, blood_group, age, gender, phone, city, address,
              weight, height, has_addiction, addiction_details,
              medications, previous_illness, recent_surgery))
        donor_id = cur.lastrowid

        # Initial checkup handling
        checkup_decision = str(data.get('checkup_decision') or data.get('decision', '')).upper()
        if checkup_decision in ('ACCEPTED', 'REJECTED'):
            hb = float(data.get('hemoglobin_level') or data.get('hemoglobin', 14.0))
            bp_sys = int(data.get('bp_systolic', 120))
            bp_dia = int(data.get('bp_diastolic', 80))
            temp = float(data.get('temperature_celsius') or data.get('temperature', 36.6))
            pulse = int(data.get('pulse_rate', 72))
            remarks = data.get('remarks') or data.get('checkup_remarks') or ('Passed hospital clinical checkup' if checkup_decision == 'ACCEPTED' else 'Rejected due to health issues')
            cur.execute("""
                INSERT INTO clinical_checkups
                    (donor_id, hospital_id, checkup_date, time_slot, hemoglobin_level,
                     bp_systolic, bp_diastolic, temperature_celsius, pulse_rate,
                     appointment_status, decision, remarks)
                VALUES (%s, 1, CURRENT_DATE, '09:30:00', %s, %s, %s, %s, %s, 'COMPLETED', %s, %s)
            """, (donor_id, hb, bp_sys, bp_dia, temp, pulse, checkup_decision, remarks))
        else:
            cur.execute("""
                INSERT INTO clinical_checkups
                    (donor_id, hospital_id, checkup_date, time_slot, appointment_status, decision, remarks)
                VALUES (%s, 1, CURRENT_DATE, '09:30:00', 'SCHEDULED', 'PENDING', 'Awaiting clinical examination')
            """, (donor_id,))

        conn.commit()
        return jsonify({'success': True, 'id': f'D-{donor_id}', 'donor_id': donor_id}), 201
    except Exception as exc:
        conn.rollback()
        return jsonify({'error': str(exc)}), 400
    finally:
        cur.close()
        conn.close()

@app.route('/api/donors/<int:donor_id>/checkup', methods=['POST'])
def save_donor_checkup(donor_id):
    data = request.get_json() or {}
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        decision = str(data.get('decision', 'ACCEPTED')).upper()
        remarks = data.get('remarks', '').strip() or ('Passed clinical examination' if decision == 'ACCEPTED' else 'Clinical deferral due to health issues')
        hemoglobin = float(data.get('hemoglobin_level') or data.get('hemoglobin', 14.0))
        bp_systolic = int(data.get('bp_systolic', 120))
        bp_diastolic = int(data.get('bp_diastolic', 80))
        temperature = float(data.get('temperature_celsius') or data.get('temperature', 36.6))
        pulse = int(data.get('pulse_rate', 72))
        hospital_id = int(data.get('hospital_id', 1))

        cur.execute("""
            INSERT INTO clinical_checkups
                (donor_id, hospital_id, checkup_date, time_slot, hemoglobin_level,
                 bp_systolic, bp_diastolic, temperature_celsius, pulse_rate,
                 appointment_status, decision, remarks)
            VALUES (%s, %s, CURRENT_DATE, '09:30:00', %s, %s, %s, %s, %s, 'COMPLETED', %s, %s)
        """, (donor_id, hospital_id, hemoglobin, bp_systolic, bp_diastolic, temperature, pulse, decision, remarks))

        conn.commit()
        return jsonify({'success': True, 'decision': decision, 'remarks': remarks}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

# ============================================================================
# 3. BLOOD REQUISITIONS & ALLOCATIONS (blood_requests, allocations)
# ============================================================================
@app.route('/api/requests', methods=['GET'])
def get_requests():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                CONCAT('REQ-', r.request_id) AS id,
                r.request_id,
                r.patient_name,
                r.patient_name AS patient,
                r.patient_mrn,
                h.name AS hospital_name,
                h.name AS hospital,
                r.hospital_id,
                r.blood_group,
                r.blood_group AS blood,
                r.component_type,
                r.quantity_requested,
                r.quantity_requested AS units,
                DATE_FORMAT(r.request_date, '%Y-%m-%d') AS request_date,
                DATE_FORMAT(r.request_date, '%Y-%m-%d') AS date,
                DATE_FORMAT(r.required_date, '%Y-%m-%d') AS required_date,
                r.priority,
                r.status,
                CASE WHEN r.status = 'Fulfilled' THEN r.source_facility_name ELSE NULL END AS source_facility_name,
                CASE WHEN r.status = 'Fulfilled' THEN r.source_facility_name ELSE NULL END AS source_facility,
                r.transit_status,
                r.notes
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
    data = request.get_json() or {}
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        hosp_name = data.get('hospital_name') or data.get('hospital', 'City General Hospital').strip()
        cur.execute("SELECT hospital_id FROM hospitals WHERE name LIKE %s LIMIT 1", (f"%{hosp_name}%",))
        h_row = cur.fetchone()
        hospital_id = h_row['hospital_id'] if h_row else 1

        patient_name = data.get('patient_name') or data.get('patient', 'Emergency Patient').strip()
        patient_mrn = data.get('patient_mrn') or f"MRN-{int(time.time()) % 100000}"
        blood_group = data.get('blood_group') or data.get('blood', 'O+').strip()
        component = data.get('component_type', 'PACKED_RED_CELLS').strip()
        units = int(data.get('quantity_requested') or data.get('units', 1))
        priority = data.get('priority', 'Normal')
        notes = data.get('notes', 'Clinical requisition')

        cur.execute("""
            INSERT INTO blood_requests
                (hospital_id, patient_name, patient_mrn, blood_group,
                 component_type, quantity_requested, priority, request_date, required_date,
                 notes, status, source_facility_name, transit_status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY),
                    %s, 'Pending', NULL, NULL)
        """, (hospital_id, patient_name, patient_mrn, blood_group, component, units, priority, notes))
        req_id = cur.lastrowid

        conn.commit()
        return jsonify({'success': True, 'id': f'REQ-{req_id}', 'request_id': req_id}), 201
    except Exception as exc:
        conn.rollback()
        return jsonify({'error': str(exc)}), 400
    finally:
        cur.close()
        conn.close()

@app.route('/api/requests/<int:req_id>/fulfill', methods=['POST'])
def fulfill_request(req_id):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT r.blood_group, r.component_type, r.hospital_id, h.name AS hospital_name, r.status
            FROM blood_requests r
            JOIN hospitals h ON r.hospital_id = h.hospital_id
            WHERE r.request_id = %s
        """, (req_id,))
        req_row = cur.fetchone()
        if not req_row:
            return jsonify({'error': 'Requisition not found'}), 404

        patient_bg = req_row['blood_group']
        req_component = req_row['component_type'] or 'PACKED_RED_CELLS'
        dest_hospital = req_row['hospital_name']
        compatible_groups = BLOOD_COMPATIBILITY.get(patient_bg, [patient_bg])

        placeholders = ', '.join(['%s'] * len(compatible_groups))
        field_order = ', '.join(['%s'] * len(compatible_groups))

        query = f"""
            SELECT bu.unit_id, bu.unit_number, bu.blood_group, bu.component_type
            FROM blood_units bu
            WHERE bu.blood_group IN ({placeholders})
              AND bu.component_type = %s
              AND bu.status = 'AVAILABLE'
              AND bu.test_status = 'NEGATIVE_CLEARED'
              AND bu.expiry_date >= CURRENT_DATE
            ORDER BY FIELD(bu.blood_group, {field_order}), bu.expiry_date ASC
            LIMIT 1
        """
        params = list(compatible_groups) + [req_component] + list(compatible_groups)
        cur.execute(query, tuple(params))
        unit = cur.fetchone()

        if not unit:
            return jsonify({'error': f"No compatible {req_component} available in Central Blood Bank for {patient_bg}"}), 400

        source_name = 'Central Blood Bank'

        cur.execute("""
            INSERT INTO allocations 
                (request_id, unit_id, allocated_by, source_facility, destination_hospital, dispatch_date, allocation_status, notes)
            VALUES (%s, %s, 1, %s, %s, CURRENT_TIMESTAMP, 'DISPATCHED', %s)
        """, (req_id, unit['unit_id'], source_name, dest_hospital, f"Allotted from {source_name} to {dest_hospital}"))

        cur.execute("""
            UPDATE blood_requests 
            SET status = 'Fulfilled',
                source_facility_name = %s,
                transit_status = 'IN_TRANSIT'
            WHERE request_id = %s
        """, (source_name, req_id))

        conn.commit()

        msg = f"Allotted {unit['blood_group']} bag ({unit['unit_number']}) from {source_name} to {dest_hospital}."
        return jsonify({
            'success': True,
            'allocated_unit_id': unit['unit_id'],
            'unit_number': unit['unit_number'],
            'source_facility_name': source_name,
            'destination_hospital': dest_hospital,
            'message': msg
        }), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

# ============================================================================
# 4. BLOOD COLLECTIONS (donations, blood_units)
# ============================================================================
@app.route('/api/donations', methods=['GET'])
def get_donations():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                CONCAT('DON-', d.donation_id) AS id,
                d.donation_id,
                d.donor_id,
                dn.full_name,
                dn.full_name AS donor,
                d.blood_group,
                d.blood_group AS blood,
                d.units_collected,
                d.units_collected AS units,
                d.total_volume_ml,
                DATE_FORMAT(d.donation_date, '%Y-%m-%d') AS donation_date,
                DATE_FORMAT(d.donation_date, '%Y-%m-%d') AS date,
                h.hospital_id,
                h.name AS hospital_name,
                h.name AS location,
                d.screening_status
            FROM donations d
            JOIN donors dn ON d.donor_id = dn.donor_id
            JOIN hospitals h ON d.hospital_id = h.hospital_id
            ORDER BY d.donation_id DESC
        """)
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.route('/api/donations', methods=['POST'])
def add_donation():
    data = request.get_json() or {}
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        donor_id_param = data.get('donor_id')
        donor_name = str(data.get('full_name') or data.get('donor', '')).strip()

        donor = None
        if donor_id_param:
            cur.execute("SELECT donor_id, full_name, blood_group FROM donors WHERE donor_id = %s", (int(donor_id_param),))
            donor = cur.fetchone()
        if not donor and donor_name:
            cur.execute("SELECT donor_id, full_name, blood_group FROM donors WHERE full_name LIKE %s LIMIT 1", (f"%{donor_name}%",))
            donor = cur.fetchone()

        if not donor:
            return jsonify({'error': 'Donor not found.'}), 404

        donor_id = donor['donor_id']
        blood_group = donor['blood_group']

        # Clinical Safety Check: ensure donor was NOT rejected in checkup
        cur.execute("""
            SELECT decision, remarks 
            FROM clinical_checkups 
            WHERE donor_id = %s 
            ORDER BY checkup_id DESC LIMIT 1
        """, (donor_id,))
        chk = cur.fetchone()
        if chk and chk.get('decision') == 'REJECTED':
            reason = chk.get('remarks') or 'Clinical health issues / deferral'
            return jsonify({'error': f"Blood collection prohibited: Donor is REJECTED ({reason})."}), 400

        loc_name = str(data.get('hospital_name') or data.get('location', '')).strip()
        hospital_id = 1
        if loc_name:
            cur.execute("SELECT hospital_id FROM hospitals WHERE name LIKE %s LIMIT 1", (f"%{loc_name}%",))
            h_row = cur.fetchone()
            if h_row:
                hospital_id = h_row['hospital_id']

        units_collected = int(data.get('units_collected') or data.get('units', 1))

        cur.execute("""
            INSERT INTO donations 
                (donor_id, hospital_id, blood_group, units_collected, total_volume_ml, donation_date, screening_status)
            VALUES (%s, %s, %s, %s, %s, CURRENT_DATE, 'CLEARED')
        """, (donor_id, hospital_id, blood_group, units_collected, units_collected * 450.0))
        donation_id = cur.lastrowid

        ts = int(time.time())
        for i in range(units_collected):
            unit_code = f"BBMS-{donation_id}-{i+1}-{ts}"
            cur.execute("""
                INSERT INTO blood_units 
                    (donation_id, unit_number, blood_group, component_type,
                     volume_ml, collection_date, expiry_date, test_status, status, storage_location)
                VALUES (%s, %s, %s, 'PACKED_RED_CELLS', 250.00,
                        CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 35 DAY), 'NEGATIVE_CLEARED', 'AVAILABLE', 'Cold Storage Bay 1')
            """, (donation_id, unit_code, blood_group))

        cur.execute("UPDATE donors SET last_donation_date = CURRENT_DATE WHERE donor_id = %s", (donor_id,))

        conn.commit()
        return jsonify({'success': True, 'id': f'DON-{donation_id}', 'donation_id': donation_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

# ============================================================================
# 5. HOSPITALS & CENTRAL BLOOD BANK (hospitals, central_blood_bank)
# ============================================================================
@app.route('/api/hospitals', methods=['GET'])
def get_hospitals():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                hospital_id,
                CONCAT('H-', hospital_id) AS id,
                name,
                license_number,
                phone,
                email,
                city,
                address,
                status
            FROM hospitals
            ORDER BY hospital_id ASC
        """)
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.route('/api/hospitals', methods=['POST'])
def add_hospital():
    data = request.get_json() or {}
    conn = get_db()
    cur = conn.cursor()
    try:
        name = data.get('name', '').strip()
        license_num = data.get('license_number', '').strip() or f"HOSP-LIC-{int(time.time()) % 100000}"
        phone = data.get('phone', '').strip()
        email = data.get('email', '').strip()
        city = data.get('city', 'Pune').strip()
        address = data.get('address', '').strip() or f"{city}, Maharashtra"

        cur.execute("""
            INSERT INTO hospitals (name, license_number, phone, email, city, address, status)
            VALUES (%s, %s, %s, %s, %s, %s, 'Verified')
        """, (name, license_num, phone, email, city, address))
        h_id = cur.lastrowid
        conn.commit()
        return jsonify({'success': True, 'id': f'H-{h_id}', 'hospital_id': h_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cur.close()
        conn.close()

@app.route('/api/blood-banks', methods=['GET'])
def get_blood_banks():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("SELECT COUNT(*) AS stored_units FROM blood_units WHERE status = 'AVAILABLE'")
        cnt = cur.fetchone()['stored_units']
        return jsonify([{
            'bank_id': 1,
            'id': 'BB-1',
            'name': 'Central Blood Bank',
            'license_number': 'BB-LIC-PUNE-01',
            'phone': '+91-20-2612-3456',
            'email': 'central@bloodbank.org',
            'address': 'Central Blood Bank Hub, Pune',
            'stored_units': cnt,
            'staff_members': 'Dr. Robert Chen (Lead Storage Officer)'
        }])
    finally:
        cur.close()
        conn.close()
        conn.close()

# ============================================================================
# 6. ALLOCATIONS & CHECKUPS (allocations, clinical_checkups)
# ============================================================================
@app.route('/api/allocations', methods=['GET'])
def get_allocations():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                CONCAT('ALC-', a.allocation_id) AS id,
                a.allocation_id,
                a.request_id,
                CONCAT('REQ-', a.request_id) AS request_code,
                a.unit_id,
                bu.unit_number,
                bu.unit_number AS barcode,
                bu.blood_group,
                a.source_facility,
                a.destination_hospital,
                a.destination_hospital AS hospital,
                DATE_FORMAT(a.dispatch_date, '%Y-%m-%d %H:%i') AS dispatch_date,
                DATE_FORMAT(a.dispatch_date, '%Y-%m-%d %H:%i') AS date,
                a.allocation_status,
                a.allocation_status AS status,
                a.notes
            FROM allocations a
            JOIN blood_units bu ON a.unit_id = bu.unit_id
            ORDER BY a.allocation_id DESC
        """)
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                CONCAT('CHK-', c.checkup_id) AS id,
                c.checkup_id,
                c.donor_id,
                d.full_name,
                d.full_name AS donor_name,
                d.phone AS donor_phone,
                d.blood_group,
                h.name AS hospital_name,
                c.checkup_date,
                DATE_FORMAT(c.checkup_date, '%Y-%m-%d') AS date,
                DATE_FORMAT(c.time_slot, '%H:%i') AS time_slot,
                DATE_FORMAT(c.time_slot, '%H:%i') AS timeslot,
                c.appointment_status,
                c.appointment_status AS status,
                c.decision,
                c.remarks
            FROM clinical_checkups c
            JOIN donors d ON c.donor_id = d.donor_id
            JOIN hospitals h ON c.hospital_id = h.hospital_id
            ORDER BY c.checkup_id DESC
        """)
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.route('/api/medical-tests', methods=['GET'])
def get_medical_tests():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 
                CONCAT('CHK-', c.checkup_id) AS id,
                c.checkup_id,
                d.full_name,
                d.full_name AS donor_name,
                d.blood_group,
                'Dr. Clinical Examiner' AS tested_by,
                DATE_FORMAT(c.checkup_date, '%Y-%m-%d') AS checkup_date,
                DATE_FORMAT(c.checkup_date, '%Y-%m-%d') AS test_date,
                CAST(c.hemoglobin_level AS CHAR) AS hemoglobin_level,
                CAST(c.hemoglobin_level AS CHAR) AS hemoglobin,
                c.bp_systolic,
                c.bp_diastolic,
                CONCAT(c.bp_systolic, '/', c.bp_diastolic) AS bp,
                CAST(c.temperature_celsius AS CHAR) AS temperature_celsius,
                CAST(c.temperature_celsius AS CHAR) AS temp,
                c.pulse_rate,
                c.decision,
                IF(c.decision = 'ACCEPTED', 'PASSED', 'FAILED') AS result,
                IF(c.decision = 'ACCEPTED', 'ELIGIBLE', 'TEMPORARILY_DEFERRED') AS eligibility,
                c.remarks
            FROM clinical_checkups c
            JOIN donors d ON c.donor_id = d.donor_id
            ORDER BY c.checkup_id DESC
        """)
        return jsonify(cur.fetchall())
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    print("HemoCare BBMS Backend Server running on http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
