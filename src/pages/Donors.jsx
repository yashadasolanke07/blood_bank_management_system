import { useState } from 'react';
import {
  Plus,
  HeartPulse,
  Check,
  Stethoscope,
  Droplet,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
} from 'lucide-react';
import PageTitle from '../components/common/PageTitle.jsx';
import SearchBox from '../components/common/SearchBox.jsx';
import DataTable from '../components/common/DataTable.jsx';
import Modal from '../components/common/Modal.jsx';
import TextField from '../components/common/TextField.jsx';
import { createDonor, saveDonorCheckup, createDonation } from '../services/api.js';

const initialDonorForm = {
  full_name: '',
  blood_group: 'O+',
  age: '25',
  gender: 'MALE',
  phone: '',
  city: 'Pune',
  address: '',
  weight_kg: '65',
  height_cm: '170',
  last_donation_date: '',
  has_addiction: 'No',
  addiction_details: 'None',
  medications: 'None',
  previous_illness: 'None',
  recent_surgery: 'None',
  checkup_mode: 'SCHEDULE', // 'SCHEDULE' or 'COMPLETE'
  decision: 'ACCEPTED', // 'ACCEPTED' or 'REJECTED'
  remarks: '',
  hemoglobin_level: '14.0',
  bp_systolic: '120',
  bp_diastolic: '80',
  temperature_celsius: '36.6',
  pulse_rate: '72',
};

export default function Donors({ donors = [], onRefresh, hospitals = [] }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [viewingHealth, setViewingHealth] = useState(null);
  const [checkupModal, setCheckupModal] = useState(null);
  const [donationModal, setDonationModal] = useState(null);
  const [form, setForm] = useState(initialDonorForm);
  const [submitting, setSubmitting] = useState(false);

  // Checkup Form state (Schema: clinical_checkups)
  const [checkupForm, setCheckupForm] = useState({
    decision: 'ACCEPTED',
    hemoglobin_level: '14.0',
    bp_systolic: '120',
    bp_diastolic: '80',
    temperature_celsius: '36.6',
    pulse_rate: '72',
    remarks: '',
  });

  // Donation Form state (Schema: donations)
  const [donationForm, setDonationForm] = useState({
    donor_id: null,
    full_name: '',
    blood_group: 'O+',
    units_collected: '1',
    total_volume_ml: '450.00',
    donation_date: new Date().toISOString().slice(0, 10),
    hospital_name: hospitals[0]?.name || 'City General Hospital',
  });

  const filtered = donors.filter((d) =>
    `${d.full_name || d.name} ${d.id} ${d.blood_group || d.blood} ${d.city} ${d.phone} ${d.decision || d.clinical_status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openNew = () => {
    setForm(initialDonorForm);
    setModal(true);
  };

  const openCheckup = (donor) => {
    setCheckupModal(donor);
    setCheckupForm({
      decision: donor.decision === 'REJECTED' ? 'REJECTED' : 'ACCEPTED',
      hemoglobin_level: donor.hemoglobin_level || donor.hemoglobin || '14.0',
      bp_systolic: donor.bp_systolic || '120',
      bp_diastolic: donor.bp_diastolic || '80',
      temperature_celsius: donor.temperature_celsius || donor.temperature || '36.6',
      pulse_rate: donor.pulse_rate || '72',
      remarks: donor.remarks || donor.test_remarks || (donor.decision === 'REJECTED' ? 'Health issues observed' : 'Optimal physiological parameters'),
    });
  };

  const openDonation = (donor) => {
    if (donor.decision === 'REJECTED' || donor.clinical_status === 'REJECTED') {
      alert(`Cannot collect blood: Donor is marked REJECTED due to health issues (${donor.remarks || donor.test_remarks || 'Clinical deferral'}).`);
      return;
    }
    if (!donor.decision || donor.decision === 'PENDING') {
      alert('This donor has not completed their pre-donation clinical checkup yet. Complete checkup first.');
      openCheckup(donor);
      return;
    }
    setDonationForm({
      donor_id: donor.donor_id || parseInt(donor.id.replace('D-', '')),
      full_name: donor.full_name || donor.name,
      blood_group: donor.blood_group || donor.blood,
      units_collected: '1',
      total_volume_ml: '450.00',
      donation_date: new Date().toISOString().slice(0, 10),
      hospital_name: hospitals[0]?.name || 'City General Hospital',
    });
    setDonationModal(donor);
  };

  const saveDonor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createDonor({
        ...form,
        has_addiction: form.has_addiction === 'Yes' || form.has_addiction === '1',
        checkup_decision: form.checkup_mode === 'COMPLETE' ? form.decision : null,
      });
      if (onRefresh) await onRefresh();
      alert('Donor registered successfully into donors table!');
      setModal(false);
    } catch (err) {
      alert(`Error saving donor: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const submitCheckup = async (e) => {
    e.preventDefault();
    if (!checkupModal) return;
    setSubmitting(true);
    try {
      const donorId = checkupModal.donor_id || parseInt(checkupModal.id.replace('D-', ''));
      await saveDonorCheckup(donorId, checkupForm);
      if (onRefresh) await onRefresh();
      alert(`Clinical checkup completed: Donor is marked ${checkupForm.decision}!`);
      setCheckupModal(null);
    } catch (err) {
      alert(`Error saving checkup: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const submitDonation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createDonation(donationForm);
      if (onRefresh) await onRefresh();
      alert('Blood donation recorded successfully into donations & blood_units tables!');
      setDonationModal(null);
    } catch (err) {
      alert(`Error collecting blood: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageTitle
        title="Donor Intake & Clinical Checkup"
        subtitle="Manage donors and clinical_checkups records registered by partner hospitals."
        action={
          <button className="btn-primary" onClick={openNew}>
            <Plus size={16} /> Register Donor
          </button>
        }
      />

      <section className="panel">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search full_name, donor_id, blood_group, city..."
          />
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              ACCEPTED: {donors.filter((d) => d.decision === 'ACCEPTED' || d.clinical_status === 'ACCEPTED').length}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              REJECTED: {donors.filter((d) => d.decision === 'REJECTED' || d.clinical_status === 'REJECTED').length}
            </span>
            <span>Total: {filtered.length} donors</span>
          </div>
        </div>

        <DataTable
          columns={[
            {
              key: 'donor_id',
              label: 'donor_id',
              render: (r) => <span className="font-mono font-bold text-slate-900">{r.id || `D-${r.donor_id}`}</span>,
            },
            {
              key: 'full_name',
              label: 'full_name',
              render: (r) => (
                <div>
                  <p className="font-semibold text-slate-800">{r.full_name || r.name}</p>
                  <p className="text-xs text-slate-400">
                    {r.city} • {r.gender} • {r.age} yrs
                  </p>
                </div>
              ),
            },
            {
              key: 'blood_group',
              label: 'blood_group',
              render: (r) => (
                <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                  {r.blood_group || r.blood}
                </span>
              ),
            },
            {
              key: 'appointment_status',
              label: 'appointment_status',
              render: (r) => {
                const s = r.appointment_status || r.appt_status;
                if (s === 'COMPLETED') {
                  return (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle size={13} className="text-emerald-500" />
                      COMPLETED
                    </span>
                  );
                }
                if (s === 'SCHEDULED') {
                  return (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                      <Calendar size={13} className="text-blue-500" />
                      SCHEDULED ({r.time_slot || r.appt_timeslot || '09:30'})
                    </span>
                  );
                }
                return <span className="text-xs text-slate-400">— None</span>;
              },
            },
            {
              key: 'decision',
              label: 'decision (clinical_checkups)',
              render: (r) => {
                const d = r.decision || r.clinical_status;
                if (d === 'ACCEPTED') {
                  return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      <CheckCircle size={12} /> ACCEPTED
                    </span>
                  );
                }
                if (d === 'REJECTED') {
                  return (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800"
                      title={r.remarks || r.test_remarks}
                    >
                      <XCircle size={12} /> REJECTED
                    </span>
                  );
                }
                return (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                    PENDING
                  </span>
                );
              },
            },
            {
              key: 'health_profile',
              label: 'donor_vitals',
              render: (r) => (
                <button
                  className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  onClick={() => setViewingHealth(r)}
                >
                  <HeartPulse size={13} className="text-red-600" /> View Vitals
                </button>
              ),
            },
            {
              key: 'checkup_action',
              label: 'Conduct Checkup',
              render: (r) => (
                <button
                  className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  onClick={() => openCheckup(r)}
                >
                  <Stethoscope size={13} />
                  <span>{r.decision ? 'Update Checkup' : 'Conduct Checkup'}</span>
                </button>
              ),
            },
            {
              key: 'donation_action',
              label: 'Blood Collection',
              render: (r) => {
                const isAccepted = r.decision === 'ACCEPTED' || r.clinical_status === 'ACCEPTED';
                const isRejected = r.decision === 'REJECTED' || r.clinical_status === 'REJECTED';

                if (isAccepted) {
                  return (
                    <button
                      className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-red-700"
                      onClick={() => openDonation(r)}
                    >
                      <Droplet size={13} fill="currentColor" /> Collect Blood
                    </button>
                  );
                }
                if (isRejected) {
                  return (
                    <button
                      className="flex cursor-not-allowed items-center gap-1 rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500"
                      onClick={() =>
                        alert(
                          `DONATION PROHIBITED:\nDonor was marked REJECTED in clinical_checkups.\nRemarks: ${
                            r.remarks || r.test_remarks || 'Health issues'
                          }`
                        )
                      }
                    >
                      <XCircle size={13} /> Ineligible
                    </button>
                  );
                }
                return (
                  <button
                    className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                    onClick={() => openCheckup(r)}
                  >
                    <AlertCircle size={13} className="text-amber-600" /> Checkup First
                  </button>
                );
              },
            },
          ]}
          rows={filtered}
        />
      </section>

      {/* Register Donor Modal */}
      {modal && (
        <Modal title="Register Donor (donors table)" onClose={() => setModal(false)}>
          <form onSubmit={saveDonor} className="max-h-[80vh] space-y-4 overflow-y-auto pr-1 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="full_name"
                value={form.full_name}
                onChange={(v) => setForm({ ...form, full_name: v })}
                required
                placeholder="Donor full name"
              />
              <TextField
                label="gender"
                value={form.gender}
                onChange={(v) => setForm({ ...form, gender: v })}
                options={['MALE', 'FEMALE', 'OTHER']}
              />
              <TextField
                label="age"
                value={form.age}
                onChange={(v) => setForm({ ...form, age: v })}
                type="number"
                required
              />
              <TextField
                label="blood_group"
                value={form.blood_group}
                onChange={(v) => setForm({ ...form, blood_group: v })}
                options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
              />
              <TextField
                label="phone"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
                required
                placeholder="10-digit number"
              />
              <TextField
                label="city"
                value={form.city}
                onChange={(v) => setForm({ ...form, city: v })}
                required
              />
              <TextField
                label="weight_kg"
                value={form.weight_kg}
                onChange={(v) => setForm({ ...form, weight_kg: v })}
                type="number"
                required
                placeholder="Min 45 kg"
              />
              <TextField
                label="height_cm"
                value={form.height_cm}
                onChange={(v) => setForm({ ...form, height_cm: v })}
                type="number"
                required
              />
              <TextField
                label="previous_illness"
                value={form.previous_illness}
                onChange={(v) => setForm({ ...form, previous_illness: v })}
                placeholder="None or specify"
              />
              <TextField
                label="medications"
                value={form.medications}
                onChange={(v) => setForm({ ...form, medications: v })}
                placeholder="None or specify"
              />
              <TextField
                label="recent_surgery"
                value={form.recent_surgery}
                onChange={(v) => setForm({ ...form, recent_surgery: v })}
                placeholder="None or specify"
              />
              <TextField
                label="has_addiction"
                value={form.has_addiction}
                onChange={(v) => setForm({ ...form, has_addiction: v })}
                options={['No', 'Yes']}
              />
            </div>

            {/* Checkup Section */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Stethoscope size={14} className="text-blue-600" />
                  clinical_checkups (Initial Examination)
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, checkup_mode: 'SCHEDULE' })}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      form.checkup_mode === 'SCHEDULE'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    SCHEDULED
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, checkup_mode: 'COMPLETE' })}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      form.checkup_mode === 'COMPLETE'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    COMPLETED (Examine Now)
                  </button>
                </div>
              </div>

              {form.checkup_mode === 'COMPLETE' && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <TextField
                      label="hemoglobin_level"
                      value={form.hemoglobin_level}
                      onChange={(v) => setForm({ ...form, hemoglobin_level: v })}
                      type="number"
                      required
                    />
                    <TextField
                      label="bp_systolic"
                      value={form.bp_systolic}
                      onChange={(v) => setForm({ ...form, bp_systolic: v })}
                      type="number"
                      required
                    />
                    <TextField
                      label="bp_diastolic"
                      value={form.bp_diastolic}
                      onChange={(v) => setForm({ ...form, bp_diastolic: v })}
                      type="number"
                      required
                    />
                    <TextField
                      label="temperature_celsius"
                      value={form.temperature_celsius}
                      onChange={(v) => setForm({ ...form, temperature_celsius: v })}
                      type="number"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">decision</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, decision: 'ACCEPTED' })}
                        className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                          form.decision === 'ACCEPTED'
                            ? 'bg-emerald-600 text-white shadow'
                            : 'bg-white text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        <CheckCircle size={15} /> ACCEPTED
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, decision: 'REJECTED' })}
                        className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                          form.decision === 'REJECTED'
                            ? 'bg-red-600 text-white shadow'
                            : 'bg-white text-red-800 border border-red-300'
                        }`}
                      >
                        <XCircle size={15} /> REJECTED
                      </button>
                    </div>
                  </div>

                  <TextField
                    label="remarks"
                    value={form.remarks}
                    onChange={(v) => setForm({ ...form, remarks: v })}
                    placeholder={form.decision === 'ACCEPTED' ? 'Passed hospital clinical checkup' : 'Specify deferral reason'}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button type="button" className="btn-secondary" onClick={() => setModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" disabled={submitting}>
                <Check size={16} /> {submitting ? 'Saving...' : 'Save to donors Table'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Clinical Checkup Modal */}
      {checkupModal && (
        <Modal
          title={`clinical_checkups: ${checkupModal.full_name || checkupModal.name} (${checkupModal.blood_group || checkupModal.blood})`}
          onClose={() => setCheckupModal(null)}
        >
          <form onSubmit={submitCheckup} className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <TextField
                label="hemoglobin_level (g/dL)"
                value={checkupForm.hemoglobin_level}
                onChange={(v) => setCheckupForm({ ...checkupForm, hemoglobin_level: v })}
                type="number"
                required
              />
              <TextField
                label="bp_systolic (mmHg)"
                value={checkupForm.bp_systolic}
                onChange={(v) => setCheckupForm({ ...checkupForm, bp_systolic: v })}
                type="number"
                required
              />
              <TextField
                label="bp_diastolic (mmHg)"
                value={checkupForm.bp_diastolic}
                onChange={(v) => setCheckupForm({ ...checkupForm, bp_diastolic: v })}
                type="number"
                required
              />
              <TextField
                label="temperature_celsius (°C)"
                value={checkupForm.temperature_celsius}
                onChange={(v) => setCheckupForm({ ...checkupForm, temperature_celsius: v })}
                type="number"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">decision</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setCheckupForm({
                      ...checkupForm,
                      decision: 'ACCEPTED',
                      remarks: checkupForm.remarks || 'Optimal physiological vitals, cleared',
                    })
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                    checkupForm.decision === 'ACCEPTED'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white text-emerald-800 border border-emerald-300'
                  }`}
                >
                  <CheckCircle size={16} /> ACCEPTED (Eligible)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCheckupForm({
                      ...checkupForm,
                      decision: 'REJECTED',
                      remarks: checkupForm.remarks || 'Clinical deferral due to health issues',
                    })
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                    checkupForm.decision === 'REJECTED'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white text-red-800 border border-red-300'
                  }`}
                >
                  <XCircle size={16} /> REJECTED (Ineligible)
                </button>
              </div>
            </div>

            <TextField
              label="remarks"
              value={checkupForm.remarks}
              onChange={(v) => setCheckupForm({ ...checkupForm, remarks: v })}
              placeholder={checkupForm.decision === 'ACCEPTED' ? 'Normal clinical examination' : 'Specify reason for rejection'}
              required={checkupForm.decision === 'REJECTED'}
            />

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button type="button" className="btn-secondary" onClick={() => setCheckupModal(null)}>
                Cancel
              </button>
              <button className="btn-primary" disabled={submitting}>
                <Check size={16} /> {submitting ? 'Saving...' : 'Save to clinical_checkups'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Collect Blood Donation Modal */}
      {donationModal && (
        <Modal
          title={`Record to donations Table: ${donationModal.full_name || donationModal.name}`}
          onClose={() => setDonationModal(null)}
        >
          <form onSubmit={submitDonation} className="space-y-4 text-sm">
            <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200 flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
              <span>Verified in clinical_checkups: Donor decision is ACCEPTED.</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">full_name</label>
                <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-100 px-3 font-semibold text-slate-800">
                  {donationForm.full_name}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">blood_group</label>
                <div className="flex h-10 items-center rounded-xl border border-red-200 bg-red-50 px-3 font-bold text-red-700">
                  {donationForm.blood_group}
                </div>
              </div>

              <TextField
                label="units_collected"
                value={donationForm.units_collected}
                onChange={(v) =>
                  setDonationForm({
                    ...donationForm,
                    units_collected: v,
                    total_volume_ml: (Number(v || 1) * 450).toFixed(2),
                  })
                }
                type="number"
                required
              />

              <TextField
                label="total_volume_ml"
                value={donationForm.total_volume_ml}
                onChange={(v) => setDonationForm({ ...donationForm, total_volume_ml: v })}
                type="number"
                required
              />

              <TextField
                label="donation_date"
                value={donationForm.donation_date}
                onChange={(v) => setDonationForm({ ...donationForm, donation_date: v })}
                type="date"
                required
              />

              <div>
                <TextField
                  label="hospital_name"
                  value={donationForm.hospital_name}
                  onChange={(v) => setDonationForm({ ...donationForm, hospital_name: v })}
                  options={hospitals.length ? hospitals.map((h) => h.name) : ['City General Hospital']}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button type="button" className="btn-secondary" onClick={() => setDonationModal(null)}>
                Cancel
              </button>
              <button className="btn-primary" disabled={submitting}>
                <Droplet size={16} fill="currentColor" />
                {submitting ? 'Recording...' : 'Insert into donations & blood_units'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Health Modal */}
      {viewingHealth && (
        <Modal
          title={`donors Profile: ${viewingHealth.full_name || viewingHealth.name}`}
          onClose={() => setViewingHealth(null)}
        >
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-3 text-center">
              <div>
                <p className="text-xs text-slate-400">blood_group</p>
                <p className="text-base font-bold text-red-700">{viewingHealth.blood_group || viewingHealth.blood}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">weight_kg</p>
                <p className="text-base font-semibold">{viewingHealth.weight_kg || viewingHealth.weight} kg</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">height_cm</p>
                <p className="text-base font-semibold">{viewingHealth.height_cm || viewingHealth.height} cm</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-3 text-xs space-y-2">
              <p><strong>medications:</strong> {viewingHealth.medications || 'None'}</p>
              <p><strong>previous_illness:</strong> {viewingHealth.previous_illness || 'None'}</p>
              <p><strong>recent_surgery:</strong> {viewingHealth.recent_surgery || 'None'}</p>
              <p><strong>has_addiction:</strong> {viewingHealth.has_addiction ? viewingHealth.addiction_details : 'No'}</p>
              <p><strong>last_donation_date:</strong> {viewingHealth.last_donation_date || viewingHealth.lastDonation || 'None'}</p>
              {(viewingHealth.remarks || viewingHealth.test_remarks) && (
                <p className="border-t border-slate-100 pt-2 text-slate-600">
                  <strong>clinical_checkups.remarks:</strong> {viewingHealth.remarks || viewingHealth.test_remarks}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button className="btn-secondary" onClick={() => setViewingHealth(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
