import { useState } from 'react';
import { Droplet, Plus, Search, Users, HandHeart } from 'lucide-react';
import PageTitle from '../components/common/PageTitle.jsx';
import SearchBox from '../components/common/SearchBox.jsx';
import DataTable from '../components/common/DataTable.jsx';
import Modal from '../components/common/Modal.jsx';
import TextField from '../components/common/TextField.jsx';
import StatCard from '../components/common/StatCard.jsx';
import { createDonation } from '../services/api.js';

export default function Donations({ donations, donors, onRefresh }) {
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    donor: '',
    blood: 'O+',
    units: '1',
    date: new Date().toISOString().slice(0, 10),
    location: 'City Care Hospital',
  });

  const filtered = donations.filter((d) =>
    `${d.id} ${d.donor} ${d.blood} ${d.location}`.toLowerCase().includes(search.toLowerCase()),
  );

  const save = async (e) => {
    e.preventDefault();
    try {
      await createDonation(form);
      if (onRefresh) {
        await onRefresh();
      }
      alert('Donation successfully recorded in database! New blood bags added to inventory.');
    } catch (err) {
      console.error('Failed to save donation:', err);
      alert(`Error saving donation: ${err.message}`);
    }
    setModal(false);
    setForm({
      donor: '',
      blood: 'O+',
      units: '1',
      date: new Date().toISOString().slice(0, 10),
      location: 'City Care Hospital',
    });
  };

  return (
    <div>
      <PageTitle
        title="Donation records"
        subtitle="Review recorded donations and add new donation entries."
        action={
          <button className="btn-primary" onClick={() => setModal(true)}>
            <Plus size={17} /> Record donation
          </button>
        }
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Donation records"
          value={donations.length}
          note="Total recorded sessions"
          icon={HandHeart}
          color="red"
        />
        <StatCard
          label="Units collected"
          value={donations.reduce((s, d) => s + Number(d.units), 0)}
          note="Total units"
          icon={Droplet}
          color="green"
        />
        <StatCard
          label="Registered donors"
          value={donors.length}
          note="Total in system"
          icon={Users}
          color="blue"
        />
      </div>
      <section className="panel">
        <div className="border-b border-slate-100 p-4">
          <SearchBox value={search} onChange={setSearch} placeholder="Search donation records..." />
        </div>
        <DataTable
          columns={[
            { key: 'id', label: 'Donation ID' },
            { key: 'donor', label: 'Donor name' },
            {
              key: 'blood',
              label: 'Blood group',
              render: (r) => <span className="font-bold text-red-700">{r.blood}</span>,
            },
            { key: 'units', label: 'Units collected' },
            { key: 'date', label: 'Donation date' },
            { key: 'location', label: 'Collection center' },
          ]}
          rows={filtered}
        />
      </section>
      {modal && (
        <Modal title="Record donation" onClose={() => setModal(false)}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Donor"
                value={form.donor}
                onChange={(v) => {
                  const d = donors.find((x) => x.name === v);
                  setForm({ ...form, donor: v, blood: d?.blood || form.blood });
                }}
                options={['', ...donors.map((d) => d.name)]}
                required
              />
              <TextField
                label="Blood group"
                value={form.blood}
                onChange={(v) => setForm({ ...form, blood: v })}
                options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
              />
              <TextField
                label="Units collected"
                value={form.units}
                onChange={(v) => setForm({ ...form, units: v })}
                type="number"
                required
              />
              <TextField
                label="Donation date"
                value={form.date}
                onChange={(v) => setForm({ ...form, date: v })}
                type="date"
                required
              />
              <TextField
                label="Collection center"
                value={form.location}
                onChange={(v) => setForm({ ...form, location: v })}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setModal(false)}>
                Cancel
              </button>
              <button className="btn-primary">Save donation</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
