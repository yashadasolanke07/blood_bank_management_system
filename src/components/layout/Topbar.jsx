import { LogOut, Menu } from 'lucide-react';
export default function Topbar({ title, onMenuClick, onLogout }) {
    return (<header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7">
      <div className="flex items-center gap-3">
        <button aria-label="Open navigation" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={onMenuClick}>
          <Menu size={21}/>
        </button>

        <div>
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <p className="hidden text-xs text-slate-500 sm:block">
            Blood bank operations workspace
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-800">
            Administrator
          </p>
          <p className="text-xs text-slate-500">Demo account</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 font-bold text-red-800">
          AD
        </div>

        <button className="btn-secondary hidden sm:inline-flex" onClick={onLogout}>
          <LogOut size={15}/>
          Sign out
        </button>

        <button aria-label="Sign out" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 sm:hidden" onClick={onLogout}>
          <LogOut size={18}/>
        </button>
      </div>
    </header>);
}

