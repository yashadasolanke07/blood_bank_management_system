import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import PageTitle from '../components/common/PageTitle.jsx';
import SearchBox from '../components/common/SearchBox.jsx';
import DataTable from '../components/common/DataTable.jsx';
import Modal from '../components/common/Modal.jsx';
import TextField from '../components/common/TextField.jsx';
import Badge from '../components/common/Badge.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
export default function Requests({ requests, setRequests, inventory, setInventory }) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({ patient: '', hospital: '', blood: 'O+', units: '1', date: new Date().toISOString().slice(0, 10), priority: 'Normal', status: 'Pending' });
    const filtered = requests.filter(r => (`${r.id} ${r.patient} ${r.hospital} ${r.blood}`.toLowerCase().includes(search.toLowerCase())) && (filter === 'All' || r.status === filter));
    const updateStatus = (r, status) => {
        if (status === 'Fulfilled' && r.status !== 'Fulfilled') {
            const stock = inventory.find(i => i.blood === r.blood);
            if (!stock || stock.units < r.units) {
                alert(`Not enough ${r.blood} units in the demo inventory to fulfill this request.`);
                return;
            }
            setInventory(items => items.map(i => i.blood === r.blood ? { ...i, units: i.units - Number(r.units) } : i));
        }
        setRequests(rs => rs.map(x => x.id === r.id ? { ...x, status } : x));
    };
    const save = e => { e.preventDefault(); setRequests(rs => [{ ...form, id: `REQ-${Date.now().toString().slice(-5)}`, units: Number(form.units) }, ...rs]); setModal(false); setForm({ patient: '', hospital: '', blood: 'O+', units: '1', date: new Date().toISOString().slice(0, 10), priority: 'Normal', status: 'Pending' }); };
    return <div>
            <PageTitle title="Blood requests" subtitle="Review, prioritize and track requests from hospitals and recipients." action={<button className="btn-primary" onClick={() => setModal(true)}>
            <Plus size={17}/> New request</button>}/>
    <section className="panel">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <SearchBox value={search} onChange={setSearch} placeholder="Search request, patient, hospital..."/>
            <div className="flex flex-wrap gap-2">
            <Filter size={17} className="my-auto text-slate-400"/>{['All', 'Pending', 'Approved', 'Fulfilled', 'Rejected'].map(s => <button key={s} onClick={() => setFilter(s)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${filter === s ? 'bg-red-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}</button>)}</div>
            </div>
      <DataTable columns={[{ key: 'id', label: 'Request ID', render: r => <span className="font-semibold text-slate-900">{r.id}</span> },
            { key: 'patient', label: 'Patient' },
            { key: 'hospital', label: 'Hospital' },
            { key: 'blood', label: 'Blood group', render: r => <span className="font-bold text-red-700">{r.blood}</span> },
            { key: 'units', label: 'Units' },
            { key: 'date', label: 'Request date' },
            { key: 'priority', label: 'Priority', render: r => <Badge tone={r.priority === 'Urgent' ? 'red' : 'gray'}>{r.priority}</Badge> },
            { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status}/> },
            { key: 'actions', label: 'Update status', render: r => <select aria-label={`Update ${r.id} status`} className="field min-w-28 py-2 text-xs" value={r.status} onChange={e => updateStatus(r, e.target.value)}>
            <option>Pending</option>
            <option>Approved</option>
            <option>Fulfilled</option>
            <option>Rejected</option>
            </select> }]} rows={filtered}/>
    </section>
    {modal && <Modal title="Create blood request" onClose={() => setModal(false)}>
            <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Patient name" value={form.patient} onChange={v => setForm({ ...form, patient: v })} required/>
            <TextField label="Hospital / facility" value={form.hospital} onChange={v => setForm({ ...form, hospital: v })} required/>
            <TextField label="Blood group" value={form.blood} onChange={v => setForm({ ...form, blood: v })} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}/>
            <TextField label="Units requested" value={form.units} onChange={v => setForm({ ...form, units: v })} type="number" required/>
            <TextField label="Request date" value={form.date} onChange={v => setForm({ ...form, date: v })} type="date" required/>
            <TextField label="Priority" value={form.priority} onChange={v => setForm({ ...form, priority: v })} options={['Normal', 'Urgent']}/>
            </div>
            <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-primary">Create request</button>
            </div>
            </form>
            </Modal>}
  </div>;
}

