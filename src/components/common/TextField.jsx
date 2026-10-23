export default function TextField({ label, value, onChange, type = 'text', required = false, placeholder = '', options }) {
    return <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}{required && ' *'}</span>
    {options ? <select className="field" value={value} onChange={e => onChange(e.target.value)} required={required}>{options.map(o => <option key={o} value={o}>{o}</option>)}</select> :
            <input className="field" type={type} value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder}/>}
  </label>;
}

