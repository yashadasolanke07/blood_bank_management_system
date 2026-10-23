import { ArrowUpRight } from 'lucide-react';
export default function StatCard({ label, value, note, icon: Icon, color = 'red', trend }) {
    const styles = { red: 'bg-red-50 text-red-700', blue: 'bg-blue-50 text-blue-700', green: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700' };
    return <div className="panel p-5">
    <div className="flex items-start justify-between">
            <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
            </div>
            <div className={`rounded-xl p-3 ${styles[color]}`}>
            <Icon size={21}/>
            </div>
            </div>
    <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">{trend && <span className="flex items-center font-semibold text-emerald-600">
            <ArrowUpRight size={14}/>{trend}</span>}{note}</div>
  </div>;
}

