import EmptyState from './EmptyState.jsx';
export default function DataTable({ columns, rows, emptyTitle = 'No records found', emptyDetail = 'Try changing your search or add a new record.' }) {
    return <div className="table-wrap">
            <table>
            <thead>
            <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
    {rows.length ? rows.map((row, i) => <tr key={row.id || i} className="hover:bg-slate-50/80">{columns.map(c => <td key={c.key} className="text-sm text-slate-700">{c.render ? c.render(row) : row[c.key]}</td>)}</tr>) :
            <tr>
            <td colSpan={columns.length}>
            <EmptyState title={emptyTitle} detail={emptyDetail}/>
            </td>
            </tr>}
  </tbody>
            </table>
            </div>;
}

