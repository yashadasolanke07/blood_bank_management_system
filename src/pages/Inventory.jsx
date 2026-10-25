import { useState } from 'react';
import { Package, Droplet, AlertTriangle, Building2 } from 'lucide-react';
import PageTitle from '../components/common/PageTitle.jsx';
import SearchBox from '../components/common/SearchBox.jsx';
import StatCard from '../components/common/StatCard.jsx';

export default function Inventory({ inventory = [], hospitalInventory = [] }) {
  const [search, setSearch] = useState('');
  const total = inventory.reduce((s, i) => s + Number(i.units || 0), 0);
  const lowCount = inventory.filter((i) => Number(i.units) < Number(i.minimum)).length;
  const filtered = inventory.filter((i) => i.blood.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageTitle
        title="Blood inventory"
        subtitle="Live inventory counts verified against MySQL blood units and transactions."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total available units"
          value={total}
          note="Across all blood groups"
          icon={Package}
          color="red"
        />
        <StatCard
          label="Blood groups tracked"
          value={inventory.length}
          note="ABO and Rh system"
          icon={Droplet}
          color="blue"
        />
        <StatCard
          label="Low stock groups"
          value={lowCount}
          note="Groups below minimum threshold"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      <div className="mb-4">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Filter by blood group (e.g. A+, O-)..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((item) => {
          const isLow = Number(item.units) < Number(item.minimum);
          const percent = Math.min(100, Math.round((Number(item.units) / 20) * 100));

          return (
            <div key={item.blood} className="panel p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 font-bold text-red-700">
                  {item.blood}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    item.units === 0
                      ? 'bg-red-50 text-red-700'
                      : isLow
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {item.units === 0 ? 'Out of stock' : isLow ? 'Low stock' : 'Adequate'}
                </span>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-400">Blood group</p>
                  <h3 className="text-xl font-bold text-slate-800">{item.blood}</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900">{item.units}</p>
                  <p className="text-xs text-slate-400">units available</p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    item.units === 0 ? 'bg-red-300' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="mt-3 flex justify-between border-t border-slate-50 pt-2 text-xs text-slate-400">
                <span>Minimum target: {item.minimum}</span>
                <span>Earliest expiry: {item.expiry}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hospital and Group-wise Stock Distribution */}
      <section className="panel mt-8">
        <div className="flex flex-col gap-1 border-b border-slate-100 p-5">
          <div className="flex items-center gap-2">
            <Building2 size={19} className="text-red-700" />
            <h3 className="font-bold text-slate-800">
              Hospital & Facility Stock Distribution (Group-wise)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Real-time count of cleared, available units distributed across healthcare facilities (MySQL View: <code className="text-red-700 font-mono">v_hospital_blood_inventory</code>).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Hospital / Facility</th>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <th key={bg} className="px-3 py-3 text-center font-bold text-slate-700">
                    {bg}
                  </th>
                ))}
                <th className="px-5 py-3 text-right font-semibold">Total Units</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hospitalInventory.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-6 text-center text-slate-400">
                    No hospital inventory records found.
                  </td>
                </tr>
              ) : (
                hospitalInventory.map((hosp) => (
                  <tr key={hosp.hospital_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-600" />
                        {hosp.hospital_name}
                      </div>
                    </td>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => {
                      const count = hosp[bg] || 0;
                      return (
                        <td key={bg} className="px-3 py-3.5 text-center">
                          <span
                            className={`inline-block min-w-7 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                              count > 0
                                ? 'bg-red-50 text-red-700 font-bold'
                                : 'text-slate-300'
                            }`}
                          >
                            {count}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800">
                        {hosp.total_units} units
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
