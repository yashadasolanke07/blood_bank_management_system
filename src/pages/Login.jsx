import { useState } from 'react';
import { Building2, Droplet, ArrowRight, Lock } from 'lucide-react';
import TextField from '../components/common/TextField.jsx';

export default function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState('HOSPITAL');
  const [email, setEmail] = useState('hospital@citycare.org');
  const [password, setPassword] = useState('password123');
  const [hospitalName, setHospitalName] = useState('City General Hospital');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'HOSPITAL') {
      setEmail('hospital@citycare.org');
      setHospitalName('City General Hospital');
    } else {
      setEmail('admin@centralbloodbank.org');
      setHospitalName('Central Blood Bank');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({
      role: selectedRole,
      email,
      hospitalName: selectedRole === 'HOSPITAL' ? hospitalName : 'Central Blood Bank',
      staffName: selectedRole === 'HOSPITAL' ? 'Hospital Medical Staff' : 'Blood Bank Officer',
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="rounded-xl bg-red-700 p-2.5 text-white">
            <Droplet size={22} fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">HemoCare</span>
        </div>

        {/* 2 User Role Buttons */}
        <div className="mb-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleRoleSelect('HOSPITAL')}
            className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 text-center transition-all ${
              selectedRole === 'HOSPITAL'
                ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-sm'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Building2 size={20} className="mb-1 text-blue-600" />
            <span className="text-xs">Hospital Staff</span>
            <span className="text-[10px] font-normal text-slate-400">Pass Donor & Requests</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('BLOOD_BANK')}
            className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 text-center transition-all ${
              selectedRole === 'BLOOD_BANK'
                ? 'border-red-700 bg-red-50 text-red-900 font-bold shadow-sm'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Droplet size={20} className="mb-1 text-red-700" fill="currentColor" />
            <span className="text-xs">Blood Bank</span>
            <span className="text-[10px] font-normal text-slate-400">Allot Blood Units</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedRole === 'HOSPITAL' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Hospital</label>
              <select
                className="field w-full"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
              >
                <option value="City General Hospital">City General Hospital</option>
                <option value="Saint Jude Trauma & Care">Saint Jude Trauma & Care</option>
                <option value="Mercy Pediatric & Emergency">Mercy Pediatric & Emergency</option>
              </select>
            </div>
          )}

          <TextField
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            required
          />

          <TextField
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            required
          />

          <button
            className={`w-full py-2.5 text-sm font-semibold text-white rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md ${
              selectedRole === 'HOSPITAL'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-red-700 hover:bg-red-800'
            }`}
          >
            <span>Sign In as {selectedRole === 'HOSPITAL' ? 'Hospital' : 'Blood Bank'}</span>
            <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
