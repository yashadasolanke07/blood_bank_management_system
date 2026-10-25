const BASE = 'http://localhost:5000/api';

async function get(path) {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
}

async function post(path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API error ${res.status}`);
    }
    return res.json();
}

async function patch(path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API error ${res.status}`);
    }
    return res.json();
}

export const fetchInventory          = () => get('/inventory');
export const fetchHospitalInventory  = () => get('/inventory/by-hospital');
export const fetchDonors             = () => get('/donors');
export const fetchRequests        = () => get('/requests');
export const fetchHospitals       = () => get('/hospitals');
export const fetchDonations       = () => get('/donations');
export const createDonor          = (data) => post('/donors', data);
export const createDonation       = (data) => post('/donations', data);
export const createRequest        = (data) => post('/requests', data);
export const createHospital       = (data) => post('/hospitals', data);
export const fulfillRequest       = (id) => post(`/requests/${id}/fulfill`, {});
export const updateRequestStatus  = (id, status) => patch(`/requests/${id}/status`, { status });
