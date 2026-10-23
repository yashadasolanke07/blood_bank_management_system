import {
  Building2,
  ClipboardList,
  Droplet,
  FileBarChart,
  HandHeart,
  HeartPulse,
  LayoutDashboard,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { navItems } from '../../data/mockData.js';
const icons = {
  '/': LayoutDashboard,
  '/donors': Users,
  '/inventory': Droplet,
  '/requests': ClipboardList,
  '/donations': HandHeart,
  '/hospitals': Building2,
  '/reports': FileBarChart,
  '/settings': Settings,
};
export default function Sidebar({ isOpen, pendingRequests, onClose }) {
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
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-950 px-4 py-5 transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="rounded-xl bg-red-700 p-2.5 text-white">
            <Droplet size={24} fill="currentColor" />
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight text-white">HemoCare</p>
            <p className="text-[10px] font-semibold tracking-[.18em] text-slate-400">
              BLOOD BANK SYSTEM
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

        <p className="mb-3 px-3 text-[10px] font-bold tracking-[.18em] text-slate-500">WORKSPACE</p>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = icons[item.to];
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

        <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-2 flex items-center gap-2 text-red-300">
            <HeartPulse size={17} />
            <span className="text-sm font-semibold text-white">Help save lives</span>
          </div>

          <p className="text-xs leading-5 text-slate-400">
            Keep inventory updated and review urgent requests promptly.
          </p>

          <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            DEMO ENVIRONMENT
          </div>
        </div>
      </aside>
    </>
  );
}
