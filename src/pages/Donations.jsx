import { useState } from 'react';
import { Droplet, Plus, Search, Users, HandHeart } from 'lucide-react';
import PageTitle from '../components/common/PageTitle.jsx';
import SearchBox from '../components/common/SearchBox.jsx';
import DataTable from '../components/common/DataTable.jsx';
import Modal from '../components/common/Modal.jsx';
import TextField from '../components/common/TextField.jsx';
import StatCard from '../components/common/StatCard.jsx';
export default function Donations({ donations, setDonations, donors }) {
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    donor: '',
    blood: 'O+',
    units: '1',
    date: new Date().toISOString().slice(0, 10),
    location: 'Main Center',
  });
  const filtered = donations.filter((d) =>
    `${d.id} ${d.donor} ${d.blood} ${d.location}`.toLowerCase().includes(search.toLowerCase()),
  );
  const save = (e) => {
    e.preventDefault();
    setDonations((ds) => [
      { ...form, id: `DON-${Date.now().toString().slice(-5)}`, units: Number(form.units) },
      ...ds,
    ]);
    setModal(false);
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
          note="In this demo"
          icon={HandHeart}
          color="red"
        />
        <StatCard
          label="Units collected"
          value={donations.reduce((s, d) => s + Number(d.units), 0)}
          note="Across recorded donations"
          icon={Droplet}
          color="green"
        />
        <StatCard
          label="Active donors"
          value={donors.filter((d) => d.status === 'Active').length}
          note="Eligible status not clinically verified"
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
              />
              <TextField
                label="Blood group"
                value={form.blood}
                onChange={(v) => setForm({ ...form, blood: v })}
                options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
              />
              <TextField
                label="Units"
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
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              This demo records a donation entry but does not automatically add stock. A real
              backend should validate collection, screening, component processing, and inventory
              transactions.
            </p>
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
