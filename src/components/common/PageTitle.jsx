export default function PageTitle({ eyebrow = 'HEMOCARE MANAGEMENT', title, subtitle, action }) {
    return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
            <p className="mb-1 text-xs font-bold tracking-[.16em] text-red-700">{eyebrow}</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
    {action}
  </div>;
}

