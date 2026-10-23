import { useState } from 'react';
import { AlertTriangle, Droplet, Package, Pencil, Filter, RefreshCw } from 'lucide-react';
import PageTitle from '../components/common/PageTitle.jsx';
import SearchBox from '../components/common/SearchBox.jsx';
import Modal from '../components/common/Modal.jsx';
import TextField from '../components/common/TextField.jsx';
import Badge from '../components/common/Badge.jsx';
import StatCard from '../components/common/StatCard.jsx';
import { seedInventory } from '../data/mockData.js';
export default function Inventory({ inventory, setInventory }) {
  const [search, setSearch] = useState('');
  const [edit, setEdit] = useState(null);
  const [units, setUnits] = useState('');
  const total = inventory.reduce((s, i) => s + Number(i.units || 0), 0);
  const filtered = inventory.filter((i) => i.blood.toLowerCase().includes(search.toLowerCase()));
  const save = (e) => {
    e.preventDefault();
    setInventory((items) =>
      items.map((i) => (i.blood === edit.blood ? { ...i, units: Number(units) } : i)),
    );
    setEdit(null);
  };
  return (
    <div>
      <PageTitle
        title="Blood inventory"
        subtitle="Monitor available units and identify groups that need replenishment."
        action={
          <button
            className="btn-secondary"
            onClick={() => {
              setInventory(seedInventory);
            }}
          >
            <RefreshCw size={16} /> Reset demo stock
          </button>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total blood units"
          value={total}
          note="All blood groups"
          icon={Package}
          color="red"
        />
        <StatCard
          label="Blood groups tracked"
          value={inventory.length}
          note="ABO and Rh groups"
          icon={Droplet}
          color="blue"
        />
        <StatCard
          label="Low stock groups"
          value={inventory.filter((i) => i.units < i.minimum).length}
          note="Below minimum threshold"
          icon={AlertTriangle}
          color="amber"
        />
      </div>
      <div className="mb-4">
        <SearchBox value={search} onChange={setSearch} placeholder="Filter by blood group..." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {filtered.map((item) => {
          const low = item.units < item.minimum;
          const percent = Math.min(
            100,
            Math.round((item.units / Math.max(item.minimum * 2, 1)) * 100),
          );
          return (
            <div key={item.blood} className="panel p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-700">
                  <Droplet size={24} />
                </div>
                <Badge tone={low ? 'red' : 'green'}>{low ? 'Low stock' : 'In range'}</Badge>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-sm text-slate-500">Blood group</p>
                  <h3 className="text-2xl font-bold text-slate-900">{item.blood}</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{item.units}</p>
                  <p className="text-xs text-slate-500">units</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${low ? 'bg-red-600' : 'bg-emerald-500'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Minimum: {item.minimum}</span>
                <span>Expiry: {item.expiry}</span>
              </div>
              <button
                className="btn-secondary mt-4 w-full"
                onClick={() => {
                  setEdit(item);
                  setUnits(String(item.units));
                }}
              >
                <Pencil size={14} /> Update units
              </button>
            </div>
          );
        })}
      </div>
      {edit && (
        <Modal title={`Update ${edit.blood} inventory`} onClose={() => setEdit(null)}>
          <form onSubmit={save} className="space-y-4">
            <p className="text-sm text-slate-500">
              Demo adjustment only. In production, inventory changes should be tied to verified
              donation or issue transactions.
            </p>
            <TextField
              label="Available units"
              value={units}
              onChange={setUnits}
              type="number"
              required
            />
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setEdit(null)}>
                Cancel
              </button>
              <button className="btn-primary">Save units</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
