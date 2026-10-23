export default function Badge({ children, tone = 'gray' }) {
    const tones = {
        green: 'bg-emerald-50 text-emerald-700', red: 'bg-red-50 text-red-700',
        amber: 'bg-amber-50 text-amber-700', blue: 'bg-blue-50 text-blue-700',
        gray: 'bg-slate-100 text-slate-600', purple: 'bg-violet-50 text-violet-700'
    };
    return <span className={`status ${tones[tone] || tones.gray}`}>{children}</span>;
}

