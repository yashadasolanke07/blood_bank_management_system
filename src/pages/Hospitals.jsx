import { useState } from 'react';
import { Building2, Plus, Phone, Mail, CheckCircle } from 'lucide-react';
import PageTitle from '../components/common/PageTitle.jsx';
import SearchBox from '../components/common/SearchBox.jsx';
import DataTable from '../components/common/DataTable.jsx';
import Modal from '../components/common/Modal.jsx';
import TextField from '../components/common/TextField.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { createHospital } from '../services/api.js';

const initialHospitalForm = {
  name: '',
  license_number: '',
  phone: '',
  email: '',
  address: '',
  city: 'Pune',
};

export default function Hospitals({ hospitals = [], onRefresh }) {
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialHospitalForm);
  const [submitting, setSubmitting] = useState(false);

  const filteredHospitals = hospitals.filter((h) =>
    `${h.name} ${h.contact || ''} ${h.city || ''} ${h.license_number || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const save = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createHospital(form);
      if (onRefresh) await onRefresh();
      alert('Partner hospital facility registered successfully!');
      setModal(false);
      setForm(initialHospitalForm);
    } catch (err) {
      alert(`Error saving hospital: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageTitle
        title="Partner Hospitals"
        subtitle="Network of registered hospitals requisitioning blood from the Central Blood Bank."
        action={
          <button className="btn-primary" onClick={() => setModal(true)}>
            <Plus size={16} /> Add Partner Hospital
          </button>
        }
      />

      {/* Central Blood Bank Architecture Summary */}
      <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white font-bold">
            🩸
          </span>
          <div>
            <p className="font-bold text-red-950">Central Blood Bank (Single Central Hub)</p>
            <p className="text-red-700">Manages central cold storage reserves and allots blood units to all partner hospitals.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-semibold text-slate-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>{hospitals.length} Connected Partner Hospitals</span>
        </div>
      </div>

      <section className="panel">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search hospital name, city, license..."
          />
          <p className="text-xs font-semibold text-slate-500">{filteredHospitals.length} partner hospitals</p>
        </div>

        <DataTable
          columns={[
            {
              key: 'hospital_id',
              label: 'hospital_id',
              render: (r) => <span className="font-mono font-bold text-slate-900">{r.hospital_id || r.id}</span>,
            },
            {
              key: 'name',
              label: 'name (hospital_name)',
              render: (r) => (
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-blue-50 p-2 text-blue-700">
                    <Building2 size={18} />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">{r.name || r.hospital_name}</p>
                    <p className="text-xs text-slate-400">{r.address || r.city}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'license_number',
              label: 'license_number',
              render: (r) => (
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-800">
                  {r.license_number || 'HOSP-LIC-VERIFIED'}
                </span>
              ),
            },
            {
              key: 'phone',
              label: 'phone / email',
              render: (r) => (
                <div className="text-xs text-slate-600">
                  <p className="font-semibold flex items-center gap-1">
                    <Phone size={12} className="text-slate-400" /> {r.phone}
                  </p>
                  <p className="text-slate-400 flex items-center gap-1">
                    <Mail size={12} className="text-slate-400" /> {r.email || 'contact@hospital.org'}
                  </p>
                </div>
              ),
            },
            {
              key: 'city',
              label: 'city',
              render: (r) => <span className="text-xs font-medium text-slate-700">{r.city || 'Pune'}</span>,
            },
            {
              key: 'status',
              label: 'status',
              render: (r) => <StatusBadge status={r.status || 'Verified'} />,
            },
          ]}
          rows={filteredHospitals}
        />
      </section>

      {/* Register Hospital Modal */}
      {modal && (
        <Modal title="Register Partner Hospital Facility" onClose={() => setModal(false)}>
          <form onSubmit={save} className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="name (hospital_name)"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                required
                placeholder="e.g. Sahyadri Specialty Hospital"
              />
              <TextField
                label="license_number"
                value={form.license_number}
                onChange={(v) => setForm({ ...form, license_number: v })}
                placeholder="e.g. FDA-MH-2026-088"
              />
              <TextField
                label="phone"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
                required
                placeholder="e.g. 020-26123456"
              />
              <TextField
                label="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                placeholder="contact@hospital.org"
              />
              <TextField
                label="city"
                value={form.city}
                onChange={(v) => setForm({ ...form, city: v })}
                required
              />
              <TextField
                label="address"
                value={form.address}
                onChange={(v) => setForm({ ...form, address: v })}
                placeholder="Building, Road, Landmark"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button type="button" className="btn-secondary" onClick={() => setModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" disabled={submitting}>
                <CheckCircle size={15} />
                {submitting ? 'Saving...' : 'Register Hospital'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
