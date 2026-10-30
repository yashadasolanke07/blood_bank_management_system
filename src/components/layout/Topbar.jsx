import { Building2, Droplet, LogOut, Menu } from 'lucide-react';

export default function Topbar({
  title,
  onMenuClick,
  onLogout,
  portal = 'blood_bank',
  currentUser,
}) {
  const isHospital = portal === 'hospital';
  const userEmail = currentUser?.email || (isHospital ? 'hospital@citycare.org' : 'admin@centralbloodbank.org');
  const roleLabel = isHospital ? 'Hospital Staff' : 'Blood Bank Staff';

  return (
    <header className="sticky top-0 z-20 flex h-[65px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7">
      <div className="flex items-center gap-3">
        <button
          aria-label="Open navigation"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900">{title}</h1>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isHospital
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User Email ID */}
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-800">{userEmail}</p>
          <p className="text-[10px] text-slate-400">{roleLabel}</p>
        </div>

        <button
          className="btn-secondary flex items-center gap-1.5 py-1.5 px-3 text-xs"
          onClick={onLogout}
          title="Sign out"
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
}
