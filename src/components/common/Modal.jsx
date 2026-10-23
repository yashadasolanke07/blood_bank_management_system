import { useEffect } from 'react';
import { X } from 'lucide-react';
export default function Modal({ title, onClose, children }) {
    useEffect(() => { const fn = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn); }, [onClose]);
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={18}/>
            </button>
            </div>
            <div className="p-6">{children}</div>
            </div>
  </div>;
}

