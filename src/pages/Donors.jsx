import { useState } from 'react';
import { Check, Plus, Search, Pencil, Trash2 } from 'lucide-react';
import PageTitle from '../components/common/PageTitle.jsx';
import SearchBox from '../components/common/SearchBox.jsx';
import DataTable from '../components/common/DataTable.jsx';
import Modal from '../components/common/Modal.jsx';
import TextField from '../components/common/TextField.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { createDonor } from '../services/api.js';

export default function Donors({ donors, onRefresh }) {
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', blood: 'O+', age: '', phone: '', city: 'Pune', lastDonation: '', status: 'Active' });
    const filtered = donors.filter(d => `${d.name} ${d.id} ${d.blood} ${d.city} ${d.phone}`.toLowerCase().includes(search.toLowerCase()));
    const openNew = () => { setEditing(null); setForm({ name: '', blood: 'O+', age: '', phone: '', city: 'Pune', lastDonation: '', status: 'Active' }); setModal(true); };
    const openEdit = d => { setEditing(d); setForm({ ...d }); setModal(true); };

    const save = async e => {
        e.preventDefault();
        try {
            await createDonor(form);
            if (onRefresh) {
                await onRefresh();
            }
            alert('Donor registered successfully in database!');
        } catch (err) {
            console.error("Failed to save donor to database:", err);
            alert(`Error saving donor: ${err.message}`);
        }
        setModal(false);
    };

    const remove = d => {
        alert(`Donor ${d.name} (${d.id}) is linked to clinical records and donation history in MySQL.`);
    };
    return <div>
            <PageTitle title="Donor management" subtitle="Register donors and keep contact and donation details up to date." action={<button className="btn-primary" onClick={openNew}>
            <Plus size={17}/> Add donor</button>}/>
    <section className="panel">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchBox value={search} onChange={setSearch} placeholder="Search name, ID, blood group..."/>
            <p className="text-sm text-slate-500">{filtered.length} donor records</p>
            </div>
      <DataTable columns={[{ key: 'id', label: 'Donor ID', render: r => <span className="font-semibold text-slate-900">{r.id}</span> },
            { key: 'name', label: 'Donor', render: r => <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-700">{r.name.split(' ').map(x => x[0]).slice(0, 2).join('')}</span>
            <div>
            <p className="font-semibold text-slate-800">{r.name}</p>
            <p className="text-xs text-slate-500">{r.city}</p>
            </div>
            </div> },
            { key: 'blood', label: 'Blood group', render: r => <span className="font-bold text-red-700">{r.blood}</span> },
            { key: 'age', label: 'Age' },
            { key: 'phone', label: 'Phone' },
            { key: 'lastDonation', label: 'Last donation' },
            { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status}/> },
            { key: 'actions', label: 'Actions', render: r => <div className="flex gap-1">
            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-700" title="Edit donor" onClick={() => openEdit(r)}>
            <Pencil size={16}/>
            </button>
            <button className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700" title="Delete donor" onClick={() => remove(r)}>
            <Trash2 size={16}/>
            </button>
            </div> }]} rows={filtered}/>
    </section>
    {modal && <Modal title={editing ? 'Edit donor' : 'Register new donor'} onClose={() => setModal(false)}>
            <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Full name" value={form.name} onChange={v => setForm({ ...form, name: v })} required placeholder="Enter donor name"/>
            <TextField label="Blood group" value={form.blood} onChange={v => setForm({ ...form, blood: v })} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}/>
            <TextField label="Age" value={form.age} onChange={v => setForm({ ...form, age: v })} type="number" required/>
            <TextField label="Phone number" value={form.phone} onChange={v => setForm({ ...form, phone: v })} required/>
            <TextField label="City" value={form.city} onChange={v => setForm({ ...form, city: v })} required/>
            <TextField label="Last donation" value={form.lastDonation} onChange={v => setForm({ ...form, lastDonation: v })} type="date"/>
            <TextField label="Status" value={form.status} onChange={v => setForm({ ...form, status: v })} options={['Active', 'Inactive']}/>
            </div>
            <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-primary">
            <Check size={16}/> Save donor</button>
            </div>
            </form>
            </Modal>}
  </div>;
}
