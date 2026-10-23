import Badge from './Badge.jsx';
export default function StatusBadge({ status }) {
    const tone = status === 'Active' || status === 'Verified' || status === 'Approved' || status === 'Fulfilled' ? 'green' : status === 'Pending' ? 'amber' : status === 'Rejected' || status === 'Inactive' ? 'red' : 'gray';
    return <Badge tone={tone}>{status}</Badge>;
}

