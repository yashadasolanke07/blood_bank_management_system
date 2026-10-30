import { useState } from 'react';
import {
  Stethoscope,
  CheckCircle,
  AlertOctagon,
  Calendar,
  Clock,
  Plus,
  Building2,
  UserCheck,
  Filter,
} from 'lucide-react';
import PageTitle from '../components/common/PageTitle.jsx';
import SearchBox from '../components/common/SearchBox.jsx';
import StatCard from '../components/common/StatCard.jsx';
import DataTable from '../components/common/DataTable.jsx';
import Modal from '../components/common/Modal.jsx';
import TextField from '../components/common/TextField.jsx';
import { createAppointment, updateAppointmentStatus } from '../services/api.js';

export default function Screenings({
  screenings = [],
  appointments = [],
  donors = [],
  hospitals = [],
  onRefresh,
}) {
  const [viewTab, setViewTab] = useState('appointments'); // 'appointments' or 'tests'
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    donor_id: donors[0]?.id || 'D-1',
    hospital_id: hospitals[0]?.hospital_id || 1,
    date: new Date().toISOString().slice(0, 10),
    timeslot: '09:30',
  });

  const scheduledCount = appointments.filter(
    (a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED'
  ).length;
  const eligibleCount = screenings.filter((s) => s.eligibility === 'ELIGIBLE').length;
  const deferredCount = screenings.filter((s) => s.eligibility?.includes('DEFERRED')).length;

  const filteredAppointments = appointments.filter((a) => {
    const textMatch = `${a.id} ${a.donor_name} ${a.hospital_name} ${a.status} ${a.blood_group}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const filterMatch =
      filter === 'All'
        ? true
        : a.status?.toUpperCase() === filter.toUpperCase();
    return textMatch && filterMatch;
  });

  const filteredScreenings = screenings.filter((s) => {
    const textMatch = `${s.id} ${s.donor_name} ${s.blood_group} ${s.tested_by} ${s.remarks}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const filterMatch =
      filter === 'All'
        ? true
        : filter === 'Eligible'
        ? s.eligibility === 'ELIGIBLE'
        : s.eligibility?.includes('DEFERRED');
    return textMatch && filterMatch;
  });

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await createAppointment(form);
      if (onRefresh) await onRefresh();
      alert('Medical checkup appointment booked successfully into appointments table!');
      setModal(false);
    } catch (err) {
      alert(`Error scheduling appointment: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (appt, newStatus) => {
    try {
      await updateAppointmentStatus(appt.appointment_id, newStatus);
      if (onRefresh) await onRefresh();
    } catch (err) {
      alert(`Error updating appointment: ${err.message}`);
    }
  };

  return (
    <div>
      <PageTitle
        title="Checkups & Screening"
        subtitle="Schedule pre-donation checkups and view laboratory clearance records."
        action={
          <button className="btn-primary" onClick={() => setModal(true)}>
            <Plus size={16} /> Schedule Checkup
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active Appointments"
          value={scheduledCount}
          note="Scheduled & confirmed for screening"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          label="Clinically Eligible"
          value={eligibleCount}
          note="Passed vitals & hemoglobin threshold"
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          label="Medically Deferred"
          value={deferredCount}
          note="Temporary or permanent clinical deferrals"
          icon={AlertOctagon}
          color="red"
        />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex border-b border-slate-200">
        <button
          onClick={() => {
            setViewTab('appointments');
            setFilter('All');
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            viewTab === 'appointments'
              ? 'border-red-700 text-red-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar size={16} /> Pre-Donation Appointments ({appointments.length})
        </button>
        <button
          onClick={() => {
            setViewTab('tests');
            setFilter('All');
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            viewTab === 'tests'
              ? 'border-red-700 text-red-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Stethoscope size={16} /> Clinical Screening Results ({screenings.length})
        </button>
      </div>

      {viewTab === 'appointments' ? (
        <section className="panel">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search donor name, hospital, status..."
            />
            <div className="flex gap-2">
              {['All', 'Scheduled', 'Completed', 'Cancelled'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    filter === f
                      ? 'bg-red-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <DataTable
            columns={[
              {
                key: 'id',
                label: 'Token / Appt ID',
                render: (r) => <span className="font-mono font-bold text-slate-900">{r.id}</span>,
              },
              {
                key: 'donor_name',
                label: 'Donor Name',
                render: (r) => (
                  <div>
                    <p className="font-semibold text-slate-800">{r.donor_name}</p>
                    <p className="text-xs text-slate-500">{r.donor_phone}</p>
                  </div>
                ),
              },
              {
                key: 'blood_group',
                label: 'Blood Group',
                render: (r) => (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                    {r.blood_group}
                  </span>
                ),
              },
              {
                key: 'hospital_name',
                label: 'Screening Facility',
                render: (r) => (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Building2 size={14} className="text-slate-400" />
                    <span>{r.hospital_name}</span>
                  </div>
                ),
              },
              { key: 'date', label: 'Appt Date' },
              {
                key: 'timeslot',
                label: 'Time Slot',
                render: (r) => (
                  <div className="flex items-center gap-1 font-mono text-xs font-semibold text-slate-700">
                    <Clock size={13} className="text-slate-400" />
                    <span>{r.timeslot}</span>
                  </div>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (r) => {
                  const s = r.status?.toUpperCase();
                  const badgeClass =
                    s === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : s === 'CANCELLED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800';
                  return (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>
                      {r.status}
                    </span>
                  );
                },
              },
              {
                key: 'actions',
                label: 'Update Status',
                render: (r) => (
                  <select
                    aria-label={`Update ${r.id} status`}
                    className="field min-w-28 py-1.5 text-xs"
                    value={r.status}
                    onChange={(e) => handleUpdateStatus(r, e.target.value)}
                  >
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                ),
              },
            ]}
            rows={filteredAppointments}
          />
        </section>
      ) : (
        <section className="panel">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search test ID, donor name, doctor..."
            />
            <div className="flex gap-2">
              {['All', 'Eligible', 'Deferred'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    filter === f
                      ? 'bg-red-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <DataTable
            columns={[
              {
                key: 'id',
                label: 'Test ID',
                render: (r) => <span className="font-mono font-bold text-slate-900">{r.id}</span>,
              },
              {
                key: 'donor_name',
                label: 'Donor Name',
                render: (r) => (
                  <div>
                    <p className="font-semibold text-slate-800">{r.donor_name}</p>
                    <p className="text-xs text-slate-400">Examined: {r.test_date}</p>
                  </div>
                ),
              },
              {
                key: 'blood_group',
                label: 'Blood Group',
                render: (r) => (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                    {r.blood_group}
                  </span>
                ),
              },
              {
                key: 'hemoglobin_level',
                label: 'Hemoglobin (g/dL)',
                render: (r) => {
                  const val = parseFloat(r.hemoglobin_level);
                  const isOk = val >= 12.5;
                  return (
                    <span
                      className={`font-mono font-bold ${
                        isOk ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {r.hemoglobin_level} g/dL
                    </span>
                  );
                },
              },
              {
                key: 'bp',
                label: 'Blood Pressure',
                render: (r) => <span className="font-mono text-xs">{r.bp} mmHg</span>,
              },
              {
                key: 'pulse_rate',
                label: 'Pulse (bpm)',
                render: (r) => <span className="text-xs">{r.pulse_rate} bpm</span>,
              },
              {
                key: 'temperature_celsius',
                label: 'Body Temp',
                render: (r) => <span className="text-xs">{r.temperature_celsius} °C</span>,
              },
              {
                key: 'eligibility',
                label: 'Doctor Clearance',
                render: (r) => {
                  const isEligible = r.eligibility === 'ELIGIBLE';
                  return (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isEligible
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isEligible ? <CheckCircle size={12} /> : <AlertOctagon size={12} />}
                      {r.eligibility}
                    </span>
                  );
                },
              },
              {
                key: 'tested_by',
                label: 'Attending Clinician',
                render: (r) => (
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{r.tested_by}</p>
                    <p className="text-[11px] text-slate-500 italic">{r.remarks}</p>
                  </div>
                ),
              },
            ]}
            rows={filteredScreenings}
          />
        </section>
      )}

      {/* Book Checkup Appointment Modal */}
      {modal && (
        <Modal title="Schedule Pre-Donation Medical Checkup" onClose={() => setModal(false)}>
          <form onSubmit={handleBookAppointment} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Select Donor</label>
                <select
                  className="field w-full"
                  value={form.donor_id}
                  onChange={(e) => setForm({ ...form, donor_id: e.target.value })}
                  required
                >
                  {donors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.id}: {d.name} ({d.blood}) - {d.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Medical Center / Hospital
                </label>
                <select
                  className="field w-full"
                  value={form.hospital_id}
                  onChange={(e) => setForm({ ...form, hospital_id: e.target.value })}
                  required
                >
                  {hospitals.map((h) => (
                    <option key={h.id || h.hospital_id} value={h.hospital_id || 1}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <TextField
                label="Appointment Date"
                type="date"
                value={form.date}
                onChange={(v) => setForm({ ...form, date: v })}
                required
              />

              <TextField
                label="Time Slot"
                type="time"
                value={form.timeslot}
                onChange={(v) => setForm({ ...form, timeslot: v })}
                required
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button type="button" className="btn-secondary" onClick={() => setModal(false)}>
                Cancel
              </button>
              <button className="btn-primary">Confirm Appointment</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
