import { Search } from 'lucide-react';
export default function EmptyState({ title, detail }) {
    return <div className="px-5 py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Search size={22}/>
            </div>
            <p className="font-semibold text-slate-800">{title}</p>
            <p className="mt-1 text-sm text-slate-500">{detail}</p>
            </div>;
}

