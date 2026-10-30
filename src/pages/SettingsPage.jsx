import { useState } from 'react';
import { Settings, ShieldCheck } from 'lucide-react';
import PageTitle from '../components/common/PageTitle.jsx';
import TextField from '../components/common/TextField.jsx';
export default function SettingsPage() {
  const [name, setName] = useState('HemoCare Blood Bank');
  const [email, setEmail] = useState('admin@hemocare.example');
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <PageTitle
        title="Settings"
        subtitle="Manage system preferences and administrative configurations."
      />
      <div className="panel max-w-2xl p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-red-50 p-3 text-red-700">
            <Settings size={21} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Organization profile</h2>
            <p className="text-sm text-slate-500">
              These values are only stored in this browser session's local storage.
            </p>
          </div>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            localStorage.setItem('bb_org_name', name);
            localStorage.setItem('bb_org_email', email);
            setSaved(true);
          }}
        >
          <TextField label="Organization name" value={name} onChange={setName} required />
          <TextField
            label="Administrator email"
            value={email}
            onChange={setEmail}
            type="email"
            required
          />
          <div className="flex items-center gap-3">
            <button className="btn-primary">Save settings</button>
            {saved && (
              <span className="text-sm font-medium text-emerald-700">Saved in this browser.</span>
            )}
          </div>
        </form>
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-2 font-semibold text-amber-900">
            <ShieldCheck size={18} /> Production security reminder
          </div>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Do not store passwords, access tokens, medical details, or real donor records in
            localStorage. Implement authentication and access control in the backend before using
            real data.
          </p>
        </div>
      </div>
    </div>
  );
}
