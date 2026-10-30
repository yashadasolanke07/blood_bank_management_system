import {
  Activity,
  AlertTriangle,
  ClipboardList,
  Droplet,
  HeartPulse,
  Users,
  Download,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts';
import PageTitle from '../components/common/PageTitle.jsx';
import StatCard from '../components/common/StatCard.jsx';
import Badge from '../components/common/Badge.jsx';
import DataTable from '../components/common/DataTable.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { chartData } from '../data/mockData.js';
export default function Dashboard({ donors, inventory, requests, donations, portal = 'blood_bank' }) {
  const totalUnits = inventory.reduce((sum, item) => sum + Number(item.units || 0), 0);
  const lowStock = inventory.filter((i) => Number(i.units) < Number(i.minimum)).length;
  const pending = requests.filter((r) => r.status === 'Pending').length;
  return (
    <div>
      <PageTitle
        title={portal === 'hospital' ? 'Hospital Dashboard' : 'Blood Bank Dashboard'}
        subtitle={
          portal === 'hospital'
            ? 'Patient blood requisitions and hospital transits.'
            : 'Central inventory and blood allocation.'
        }
        action={
          <button className="btn-secondary" onClick={() => window.print()}>
            <Download size={16} /> Export summary
          </button>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Registered donors"
          value={donors.length.toLocaleString()}
          note="Total donor records"
          icon={Users}
          color="red"
          trend="+8.2%"
        />
        <StatCard
          label="Available blood units"
          value={totalUnits.toLocaleString()}
          note="Across all blood groups"
          icon={Droplet}
          color="blue"
          trend="+4.6%"
        />
        <StatCard
          label="Pending requests"
          value={pending}
          note="Need review or action"
          icon={ClipboardList}
          color="amber"
        />
        <StatCard
          label="Donations recorded"
          value={donations.length}
          note="Registered donors in database"
          icon={HeartPulse}
          color="green"
          trend="+12%"
        />
      </div>
      {lowStock > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <AlertTriangle className="mt-0.5 shrink-0" size={19} />
          <div>
            <p className="font-semibold">Low blood stock alert</p>
            <p className="mt-1 text-sm">
              {lowStock} blood group(s) are below their configured minimum level. Review inventory
              and arrange replenishment.
            </p>
          </div>
        </div>
      )}
      <div className="mb-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="panel p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Activity overview</h2>
              <p className="mt-1 text-sm text-slate-500">
                Donations and requests over the last six months
              </p>
            </div>
            <Badge tone="red">Live Hospital Network</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="donationsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="donations"
                  stroke="#dc2626"
                  strokeWidth={2.5}
                  fill="url(#donationsFill)"
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#64748b"
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-600" />
              Donations
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-500" />
              Requests
            </span>
          </div>
        </section>
        <section className="panel p-5">
          <div className="mb-4">
            <h2 className="font-bold text-slate-900">Blood stock by group</h2>
            <p className="mt-1 text-sm text-slate-500">Units currently listed in inventory</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventory} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis
                  dataKey="blood"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="units" fill="#dc2626" radius={[5, 5, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <section className="panel">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="font-bold text-slate-900">Recent blood requests</h2>
            <p className="mt-1 text-sm text-slate-500">Latest activity requiring attention</p>
          </div>
          <span className="text-xs font-semibold text-red-700">
            Latest {Math.min(4, requests.length)}
          </span>
        </div>
        <DataTable
          columns={[
            { key: 'id', label: 'Request ID' },
            { key: 'patient', label: 'Patient' },
            {
              key: 'blood',
              label: 'Blood group',
              render: (r) => <span className="font-bold text-red-700">{r.blood}</span>,
            },
            { key: 'units', label: 'Units' },
            {
              key: 'priority',
              label: 'Priority',
              render: (r) => (
                <Badge tone={r.priority === 'Urgent' ? 'red' : 'gray'}>{r.priority}</Badge>
              ),
            },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={requests.slice(0, 4)}
        />
      </section>
    </div>
  );
}
