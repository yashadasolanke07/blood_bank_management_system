import { useState } from 'react';
import { Plus, Filter, CheckCircle, Zap } from 'lucide-react';
import PageTitle from '../components/common/PageTitle.jsx';
import SearchBox from '../components/common/SearchBox.jsx';
import DataTable from '../components/common/DataTable.jsx';
import Modal from '../components/common/Modal.jsx';
import TextField from '../components/common/TextField.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { createRequest, fulfillRequest } from '../services/api.js';

const initialRequestForm = {
  patient_name: '',
  patient_mrn: '',
  hospital_name: 'City General Hospital',
  blood_group: 'O+',
  component_type: 'PACKED_RED_CELLS',
  quantity_requested: '1',
  required_date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
  priority: 'Normal',
  notes: '',
};

export default function Requests({
  requests = [],
  hospitals = [],
  onRefresh,
  portal = 'blood_bank',
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(initialRequestForm);
  const isHospital = portal === 'hospital';

  const filtered = requests.filter(
    (r) =>
      `${r.id} ${r.request_id} ${r.patient_name || r.patient} ${r.hospital_name || r.hospital} ${r.source_facility_name || r.source_facility || ''} ${r.blood_group || r.blood}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === 'All' || r.status === filter)
  );

  const handleAllotBlood = async (r) => {
    const rawId = r.request_id || r.id.replace('REQ-', '');
    try {
      const res = await fulfillRequest(rawId);
      if (onRefresh) await onRefresh();
      alert(res?.message || 'Blood unit allotted from Central Blood Bank successfully!');
    } catch (err) {
      alert(`Cannot allot: ${err.message}`);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      await createRequest(form);
      if (onRefresh) await onRefresh();
      alert('Blood request submitted successfully into blood_requests table!');
      setModal(false);
      setForm(initialRequestForm);
    } catch (err) {
      alert(`Error submitting request: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      <PageTitle
        title={isHospital ? 'Patient Blood Requisitions' : 'Blood Allocation Queue'}
        subtitle={
          isHospital
            ? 'Submit blood requests into blood_requests table for admitted hospital patients.'
            : 'Allot Central Blood Bank reserve units to hospital requisitions (triggers allocations table).'
        }
        action={
          isHospital ? (
            <button className="btn-primary" onClick={() => setModal(true)}>
              <Plus size={16} /> New Requisition
            </button>
          ) : null
        }
      />

      <section className="panel">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search request_id, patient_name, hospital_name, blood_group..."
          />
          <div className="flex flex-wrap gap-2">
            <Filter size={16} className="my-auto text-slate-400" />
            {['All', 'Pending', 'Fulfilled'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  filter === s
                    ? 'bg-red-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={[
            {
              key: 'request_id',
              label: 'request_id',
              render: (r) => <span className="font-semibold text-slate-900">{r.id || `REQ-${r.request_id}`}</span>,
            },
            {
              key: 'patient_name',
              label: 'patient_name',
              render: (r) => (
                <div>
                  <p className="font-semibold text-slate-800">{r.patient_name || r.patient}</p>
                  <p className="font-mono text-xs text-slate-400">MRN: {r.patient_mrn}</p>
                </div>
              ),
            },
            {
              key: 'hospital_name',
              label: 'hospital_name',
              render: (r) => <span>{r.hospital_name || r.hospital}</span>,
            },
            {
              key: 'source_facility_name',
              label: 'source_facility_name (Allotted From)',
              render: (r) => {
                const source = r.source_facility_name || r.source_facility;
                if (r.status !== 'Fulfilled' || !source) {
                  return <span className="text-slate-300">—</span>;
                }
                return (
                  <span className="rounded bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                    {source}
                  </span>
                );
              },
            },
            {
              key: 'blood_group',
              label: 'blood_group',
              render: (r) => <span className="font-bold text-red-700">{r.blood_group || r.blood}</span>,
            },
            {
              key: 'component_type',
              label: 'component_type',
              render: (r) => (
                <span className="text-xs text-slate-600">
                  {r.component_type?.replace(/_/g, ' ')}
                </span>
              ),
            },
            {
              key: 'quantity_requested',
              label: 'quantity_requested',
              render: (r) => <span>{r.quantity_requested || r.units} bag</span>,
            },
            {
              key: 'priority',
              label: 'priority',
              render: (r) => {
                const p = r.priority;
                const badgeClass =
                  p === 'Emergency'
                    ? 'bg-red-100 text-red-800 font-bold'
                    : p === 'Urgent'
                    ? 'bg-amber-100 text-amber-800 font-semibold'
                    : 'bg-slate-100 text-slate-700';
                return <span className={`rounded-full px-2 py-0.5 text-xs ${badgeClass}`}>{p}</span>;
              },
            },
            {
              key: 'request_date',
              label: 'request_date',
              render: (r) => <span className="text-xs">{r.request_date || r.date}</span>,
            },
            {
              key: 'status',
              label: 'status',
              render: (r) => <StatusBadge status={r.status} />,
            },
            {
              key: 'action',
              label: isHospital ? 'Status' : 'Action',
              render: (r) => {
                if (isHospital) {
                  return r.status === 'Fulfilled' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle size={13} className="text-emerald-500" /> In Transit
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Awaiting Bank</span>
                  );
                }

                if (r.status === 'Pending') {
                  return (
                    <button
                      className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
                      onClick={() => handleAllotBlood(r)}
                    >
                      <Zap size={13} fill="currentColor" /> Allot Blood
                    </button>
                  );
                }

                return (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle size={13} className="text-emerald-500" /> Dispatched
                  </span>
                );
              },
            },
          ]}
          rows={filtered}
        />
      </section>

      {/* New Request Modal */}
      {modal && (
        <Modal title="Create Requisition (blood_requests table)" onClose={() => setModal(false)}>
          <form onSubmit={save} className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="patient_name"
                value={form.patient_name}
                onChange={(v) => setForm({ ...form, patient_name: v })}
                required
                placeholder="Patient Full Name"
              />
              <TextField
                label="patient_mrn"
                value={form.patient_mrn}
                onChange={(v) => setForm({ ...form, patient_mrn: v })}
                placeholder="Hospital MRN / Case ID"
              />
              <TextField
                label="hospital_name"
                value={form.hospital_name}
                onChange={(v) => setForm({ ...form, hospital_name: v })}
                options={hospitals.length ? hospitals.map((h) => h.name) : ['City General Hospital']}
                required
              />
              <TextField
                label="blood_group"
                value={form.blood_group}
                onChange={(v) => setForm({ ...form, blood_group: v })}
                options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
              />
              <TextField
                label="component_type"
                value={form.component_type}
                onChange={(v) => setForm({ ...form, component_type: v })}
                options={['PACKED_RED_CELLS', 'WHOLE_BLOOD', 'PLATELETS', 'PLASMA']}
              />
              <TextField
                label="quantity_requested"
                value={form.quantity_requested}
                onChange={(v) => setForm({ ...form, quantity_requested: v })}
                type="number"
                required
              />
              <TextField
                label="priority"
                value={form.priority}
                onChange={(v) => setForm({ ...form, priority: v })}
                options={['Normal', 'Urgent', 'Emergency']}
              />
              <TextField
                label="required_date"
                value={form.required_date}
                onChange={(v) => setForm({ ...form, required_date: v })}
                type="date"
                required
              />
              <div className="sm:col-span-2">
                <TextField
                  label="notes"
                  value={form.notes}
                  onChange={(v) => setForm({ ...form, notes: v })}
                  placeholder="Clinical diagnostic notes"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button type="button" className="btn-secondary" onClick={() => setModal(false)}>
                Cancel
              </button>
              <button className="btn-primary">
                Save to blood_requests
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
