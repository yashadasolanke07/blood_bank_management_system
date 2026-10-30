import {
  Building2,
  ClipboardList,
  Droplet,
  FileBarChart,
  HandHeart,
  HeartPulse,
  LayoutDashboard,
  Settings,
  Stethoscope,
  Users,
  X,
  Package,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const hospitalNavItems = [
  { to: '/', label: 'Hospital Dashboard', icon: LayoutDashboard, end: true },
  { to: '/requests', label: 'Patient Blood Requisitions', icon: ClipboardList },
  { to: '/donors', label: 'Donor Intake & Medical Checkup', icon: Users },
  { to: '/donations', label: 'Blood Collections', icon: HandHeart },
  { to: '/inventory', label: 'Reserve Stock Lookup', icon: Droplet },
  { to: '/hospitals', label: 'Partner Hospitals', icon: Building2 },
  { to: '/reports', label: 'Transfusion Reports', icon: FileBarChart },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const bloodBankNavItems = [
  { to: '/', label: 'Central Bank Dashboard', icon: LayoutDashboard, end: true },
  { to: '/inventory', label: 'Central Cold Storage', icon: Droplet },
  { to: '/requests', label: 'Allocation & Dispatch Queue', icon: Package },
  { to: '/hospitals', label: 'Partner Hospitals', icon: Building2 },
  { to: '/reports', label: 'Regulatory Audit Reports', icon: FileBarChart },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, pendingRequests, onClose, portal = 'blood_bank' }) {
  const isHospital = portal === 'hospital';
  const navList = isHospital ? hospitalNavItems : bloodBankNavItems;

  return (
    <>
      {isOpen && (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-950 px-4 py-5 transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center gap-3 px-2">
          <div
            className={`rounded-xl p-2.5 text-white shadow-lg ${
              isHospital ? 'bg-blue-600 shadow-blue-600/30' : 'bg-red-700 shadow-red-700/30'
            }`}
          >
            {isHospital ? <Building2 size={24} /> : <Droplet size={24} fill="currentColor" />}
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight text-white">HemoCare</p>
            <p
              className={`text-[10px] font-bold tracking-[.18em] ${
                isHospital ? 'text-blue-400' : 'text-red-400'
              }`}
            >
              {isHospital ? 'HOSPITAL PORTAL' : 'CENTRAL BLOOD BANK'}
            </p>
          </div>

          <button
            aria-label="Close navigation"
            className="ml-auto text-slate-400 lg:hidden"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-3 px-3">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              isHospital ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-red-950 text-red-300 border border-red-800'
            }`}
          >
            {isHospital ? '🏥 Requisitioner Mode' : '🩸 Allocation Authority'}
          </span>
        </div>

        <nav className="space-y-1">
          {navList.map((item) => {
            const Icon = item.icon || Droplet;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>

                {item.to === '/requests' && pendingRequests > 0 && (
                  <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {pendingRequests}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto px-2 py-3 border-t border-slate-900">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            ONLINE · MYSQL CONNECTED
          </div>
        </div>
      </aside>
    </>
  );
}
