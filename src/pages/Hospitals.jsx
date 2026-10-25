import { useState } from 'react';
import { Building2, Plus, Search } from 'lucide-react';
import PageTitle from '../components/common/PageTitle.jsx';
import SearchBox from '../components/common/SearchBox.jsx';
import DataTable from '../components/common/DataTable.jsx';
import Modal from '../components/common/Modal.jsx';
import TextField from '../components/common/TextField.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { createHospital } from '../services/api.js';

export default function Hospitals({ hospitals = [], onRefresh }) {
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', contact: '', phone: '', city: 'Pune', status: 'Pending' });
  const filtered = hospitals.filter(h => `${h.name} ${h.contact} ${h.city}`.toLowerCase().includes(search.toLowerCase()));

  const save = async e => {
    e.preventDefault();
    try {
      await createHospital(form);
      if (onRefresh) {
        await onRefresh();
      }
      alert('Hospital registered successfully in database!');
    } catch (err) {
      console.error("Failed to add hospital:", err);
      alert(`Error saving hospital: ${err.message}`);
    }
    setModal(false);
    setForm({ name: '', contact: '', phone: '', city: 'Pune', status: 'Pending' });
  };

  return (
    <div>
      <PageTitle
        title="Hospitals & facilities"
        subtitle="Manage registered healthcare partners and their verification status."
        action={
          <button className="btn-primary" onClick={() => setModal(true)}>
            <Plus size={17} /> Add hospital
          </button>
        }
      />
      <section className="panel">
        <div className="border-b border-slate-100 p-4">
          <SearchBox value={search} onChange={setSearch} placeholder="Search hospital or city..." />
        </div>
        <DataTable
          columns={[
            { key: 'id', label: 'Facility ID' },
            {
              key: 'name',
              label: 'Hospital / facility',
              render: r => (
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-blue-50 p-2 text-blue-700">
                    <Building2 size={18} />
                  </span>
                  <span className="font-semibold text-slate-800">{r.name}</span>
                </div>
              ),
            },
            { key: 'contact', label: 'Contact person' },
            { key: 'phone', label: 'Phone' },
            { key: 'city', label: 'City' },
            {
              key: 'status',
              label: 'Verification',
              render: r => <StatusBadge status={r.status} />,
            },
          ]}
          rows={filtered}
        />
      </section>
      {modal && (
        <Modal title="Add hospital / facility" onClose={() => setModal(false)}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Facility name"
                value={form.name}
                onChange={v => setForm({ ...form, name: v })}
                required
              />
              <TextField
                label="Contact person"
                value={form.contact}
                onChange={v => setForm({ ...form, contact: v })}
                required
              />
              <TextField
                label="Phone"
                value={form.phone}
                onChange={v => setForm({ ...form, phone: v })}
                required
              />
              <TextField
                label="City"
                value={form.city}
                onChange={v => setForm({ ...form, city: v })}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setModal(false)}>
                Cancel
              </button>
              <button className="btn-primary">Add facility</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
