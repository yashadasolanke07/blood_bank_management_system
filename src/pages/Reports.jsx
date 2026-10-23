import { Activity, Droplet, Users, CircleCheck, Download } from 'lucide-react';
import PageTitle from '../components/common/PageTitle.jsx';
import StatCard from '../components/common/StatCard.jsx';
import DataTable from '../components/common/DataTable.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
export default function Reports({ donors, inventory, requests, donations }) {
  const exportCsv = () => {
    const rows = [
      ['Blood group', 'Available units', 'Minimum units', 'Expiry'],
      ...inventory.map((i) => [i.blood, i.units, i.minimum, i.expiry]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blood-inventory-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div>
      <PageTitle
        title="Reports & analytics"
        subtitle="Summary reports based on the current demo records."
        action={
          <button className="btn-primary" onClick={exportCsv}>
            <Download size={16} /> Export inventory CSV
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total donors"
          value={donors.length}
          note="All registered records"
          icon={Users}
        />
        <StatCard
          label="Blood units"
          value={inventory.reduce((s, i) => s + i.units, 0)}
          note="Current inventory"
          icon={Droplet}
          color="blue"
        />
        <StatCard
          label="Requests fulfilled"
          value={requests.filter((r) => r.status === 'Fulfilled').length}
          note="Current request records"
          icon={CircleCheck}
          color="green"
        />
        <StatCard
          label="Donation records"
          value={donations.length}
          note="Recorded donations"
          icon={Activity}
          color="amber"
        />
      </div>
      <section className="panel mt-6 p-5">
        <h2 className="font-bold text-slate-900">Inventory summary</h2>
        <p className="mt-1 text-sm text-slate-500">
          Export the current inventory to CSV for a spreadsheet.
        </p>
        <div className="mt-5">
          <DataTable
            columns={[
              { key: 'blood', label: 'Blood group' },
              { key: 'units', label: 'Available units' },
              { key: 'minimum', label: 'Minimum units' },
              { key: 'expiry', label: 'Example expiry' },
              {
                key: 'status',
                label: 'Stock status',
                render: (r) => (
                  <StatusBadge status={r.units < r.minimum ? 'Low stock' : 'In range'} />
                ),
              },
            ]}
            rows={inventory}
          />
        </div>
      </section>
      <p className="mt-4 text-xs text-slate-400">
        Charts and counts reflect local demo data, not real blood bank operations.
      </p>
    </div>
  );
}
