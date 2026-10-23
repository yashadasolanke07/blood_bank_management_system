import { Search } from 'lucide-react';
export default function SearchBox({ value, onChange, placeholder = 'Search records...' }) {
    return <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17}/>
            <input className="field pl-9" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/>
            </div>;
}

