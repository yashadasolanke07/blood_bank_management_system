import { useState } from 'react';
import { Droplet, Plus, HandHeart, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import PageTitle from '../components/common/PageTitle.jsx';
import SearchBox from '../components/common/SearchBox.jsx';
import DataTable from '../components/common/DataTable.jsx';
import Modal from '../components/common/Modal.jsx';
import TextField from '../components/common/TextField.jsx';
import StatCard from '../components/common/StatCard.jsx';
import { createDonation } from '../services/api.js';

export default function Donations({ donations = [], donors = [], onRefresh }) {
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [form, setForm] = useState({
    donor_id: null,
    full_name: '',
    blood_group: 'O+',
    units_collected: '1',
    total_volume_ml: '450.00',
    donation_date: new Date().toISOString().slice(0, 10),
    hospital_name: 'City General Hospital',
  });
  const [submitting, setSubmitting] = useState(false);

  const filtered = donations.filter((d) =>
    `${d.id} ${d.donation_id} ${d.full_name || d.donor} ${d.blood_group || d.blood} ${d.hospital_name || d.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openNew = () => {
    setSelectedDonor(null);
    setForm({
      donor_id: null,
      full_name: '',
      blood_group: 'O+',
      units_collected: '1',
      total_volume_ml: '450.00',
      donation_date: new Date().toISOString().slice(0, 10),
      hospital_name: 'City General Hospital',
    });
    setModal(true);
  };

  const onSelectDonor = (donorName) => {
    const d = donors.find((x) => (x.full_name || x.name) === donorName);
    setSelectedDonor(d || null);
    if (d) {
      setForm((prev) => ({
        ...prev,
        full_name: d.full_name || d.name,
        donor_id: d.donor_id || parseInt(d.id.replace('D-', '')),
        blood_group: d.blood_group || d.blood || prev.blood_group,
      }));
    } else {
      setForm((prev) => ({ ...prev, full_name: donorName, donor_id: null }));
    }
  };

  const isEligible = selectedDonor?.decision === 'ACCEPTED' || selectedDonor?.clinical_status === 'ACCEPTED';
  const isRejected = selectedDonor?.decision === 'REJECTED' || selectedDonor?.clinical_status === 'REJECTED';
  const isPending = !isEligible && !isRejected;

  const save = async (e) => {
    e.preventDefault();
    if (isRejected) {
      alert(`Cannot collect blood: Donor decision is REJECTED in clinical_checkups (${selectedDonor.remarks || selectedDonor.test_remarks || 'Clinical deferral'}).`);
      return;
    }
    if (isPending) {
      alert('Cannot collect blood: Donor must complete hospital medical checkup in clinical_checkups first.');
      return;
    }
    setSubmitting(true);
    try {
      await createDonation(form);
      if (onRefresh) await onRefresh();
      alert('Blood donation saved into donations table and new unit added to blood_units table!');
      setModal(false);
    } catch (err) {
      alert(`Error recording donation: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageTitle
        title="Blood Collections (donations Table)"
        subtitle="Review records from donations and blood_units tables."
        action={
          <button className="btn-primary" onClick={openNew}>
            <Plus size={16} /> Record Blood Collection
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Collections (donations)"
          value={donations.length}
          note="Total records in donations table"
          icon={HandHeart}
          color="red"
        />
        <StatCard
          label="Total units_collected"
          value={donations.reduce((s, d) => s + Number(d.units_collected || d.units || 1), 0)}
          note="Collected whole blood bags"
          icon={Droplet}
          color="green"
        />
        <StatCard
          label="Eligible Donors"
          value={donors.filter((d) => d.decision === 'ACCEPTED' || d.clinical_status === 'ACCEPTED').length}
          note="decision = ACCEPTED in checkup"
          icon={CheckCircle}
          color="blue"
        />
      </div>

      <section className="panel">
        <div className="border-b border-slate-100 p-4">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search donation_id, full_name, blood_group, hospital_name..."
          />
        </div>
        <DataTable
          columns={[
            {
              key: 'donation_id',
              label: 'donation_id',
              render: (r) => <span className="font-mono font-bold text-slate-900">{r.id || `DON-${r.donation_id}`}</span>,
            },
            {
              key: 'full_name',
              label: 'full_name (donor)',
              render: (r) => <span className="font-semibold text-slate-800">{r.full_name || r.donor}</span>,
            },
            {
              key: 'blood_group',
              label: 'blood_group',
              render: (r) => (
                <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                  {r.blood_group || r.blood}
                </span>
              ),
            },
            { key: 'units_collected', label: 'units_collected', render: (r) => <span>{r.units_collected || r.units}</span> },
            { key: 'total_volume_ml', label: 'total_volume_ml', render: (r) => <span>{r.total_volume_ml || 450.0} ml</span> },
            { key: 'donation_date', label: 'donation_date', render: (r) => <span>{r.donation_date || r.date}</span> },
            { key: 'hospital_name', label: 'hospital_name', render: (r) => <span>{r.hospital_name || r.location}</span> },
            {
              key: 'screening_status',
              label: 'screening_status',
              render: (r) => (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                  {r.screening_status || 'CLEARED'}
                </span>
              ),
            },
          ]}
          rows={filtered}
        />
      </section>

      {modal && (
        <Modal title="Record Collection (donations & blood_units)" onClose={() => setModal(false)}>
          <form onSubmit={save} className="space-y-4 text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Select Registered Donor (donors)"
                value={form.full_name}
                onChange={onSelectDonor}
                options={['', ...donors.map((d) => d.full_name || d.name)]}
                required
              />

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">blood_group (Auto-locked)</label>
                <div className="flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-bold text-red-700">
                  <span>{form.blood_group || 'Select donor'}</span>
                  <span className="text-xs font-normal text-slate-500">Auto-matched</span>
                </div>
              </div>

              <TextField
                label="units_collected"
                value={form.units_collected}
                onChange={(v) =>
                  setForm({
                    ...form,
                    units_collected: v,
                    total_volume_ml: (Number(v || 1) * 450).toFixed(2),
                  })
                }
                type="number"
                required
              />

              <TextField
                label="total_volume_ml"
                value={form.total_volume_ml}
                onChange={(v) => setForm({ ...form, total_volume_ml: v })}
                type="number"
                required
              />

              <TextField
                label="donation_date"
                value={form.donation_date}
                onChange={(v) => setForm({ ...form, donation_date: v })}
                type="date"
                required
              />

              <div>
                <TextField
                  label="hospital_name"
                  value={form.hospital_name}
                  onChange={(v) => setForm({ ...form, hospital_name: v })}
                  required
                />
              </div>
            </div>

            {/* Donor Clinical Eligibility Indicator */}
            {selectedDonor && (
              <div>
                {isEligible && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                    <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                    <span>
                      <strong>clinical_checkups.decision = ACCEPTED:</strong> Donor cleared for phlebotomy and blood bag collection.
                    </span>
                  </div>
                )}
                {isRejected && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-800">
                    <XCircle size={16} className="text-red-600 shrink-0" />
                    <span>
                      <strong>DONATION PROHIBITED:</strong> Donor decision is <strong>REJECTED</strong> in clinical_checkups ({selectedDonor.remarks || selectedDonor.test_remarks}).
                    </span>
                  </div>
                )}
                {isPending && (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
                    <AlertCircle size={16} className="text-amber-600 shrink-0" />
                    <span>
                      <strong>Checkup Needed:</strong> Complete clinical examination in the Donor Intake Registry first.
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button type="button" className="btn-secondary" onClick={() => setModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                disabled={submitting || isRejected || isPending || !form.full_name}
              >
                <Droplet size={15} fill="currentColor" />
                {submitting ? 'Recording...' : 'Insert into donations & blood_units'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
