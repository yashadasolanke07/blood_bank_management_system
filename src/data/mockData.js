import {
  LayoutDashboard,
  Users,
  Droplet,
  ClipboardList,
  HandHeart,
  Building2,
  FileBarChart,
  Settings,
  Stethoscope,
} from 'lucide-react';

// Sample data for the Blood Bank Management System demo.

// Donors
export const seedDonors = [
  {
    id: 'D-1001',
    name: 'Aarav Patil',
    blood: 'O+',
    age: 24,
    phone: '9876543210',
    city: 'Pune',
    lastDonation: '2026-09-18',
    status: 'Active',
  },
  {
    id: 'D-1002',
    name: 'Ananya Sharma',
    blood: 'A+',
    age: 29,
    phone: '9823456710',
    city: 'Pune',
    lastDonation: '2026-08-22',
    status: 'Active',
  },
  {
    id: 'D-1003',
    name: 'Rohan Deshmukh',
    blood: 'B+',
    age: 31,
    phone: '9765432108',
    city: 'Mumbai',
    lastDonation: '2026-07-10',
    status: 'Active',
  },
  {
    id: 'D-1004',
    name: 'Sara Khan',
    blood: 'AB+',
    age: 27,
    phone: '9898765432',
    city: 'Nashik',
    lastDonation: '2026-06-04',
    status: 'Inactive',
  },
  {
    id: 'D-1005',
    name: 'Ishaan Joshi',
    blood: 'O-',
    age: 22,
    phone: '9812345670',
    city: 'Pune',
    lastDonation: '2026-09-29',
    status: 'Active',
  },
];

// Blood inventory
export const seedInventory = [
  { blood: 'A+', units: 34, minimum: 20, expiry: '2026-11-15' },
  { blood: 'A-', units: 12, minimum: 15, expiry: '2026-11-02' },
  { blood: 'B+', units: 27, minimum: 20, expiry: '2026-11-12' },
  { blood: 'B-', units: 8, minimum: 12, expiry: '2026-10-29' },
  { blood: 'AB+', units: 16, minimum: 10, expiry: '2026-11-20' },
  { blood: 'AB-', units: 6, minimum: 8, expiry: '2026-10-31' },
  { blood: 'O+', units: 42, minimum: 25, expiry: '2026-11-18' },
  { blood: 'O-', units: 9, minimum: 15, expiry: '2026-10-27' },
];

// Blood requests
export const seedRequests = [
  {
    id: 'REQ-2041',
    patient: 'Meera Kulkarni',
    hospital: 'City Care Hospital',
    blood: 'O-',
    units: 2,
    date: '2026-10-23',
    priority: 'Urgent',
    status: 'Pending',
  },
  {
    id: 'REQ-2040',
    patient: 'Kabir More',
    hospital: 'Sahyadri Hospital',
    blood: 'A+',
    units: 3,
    date: '2026-10-22',
    priority: 'Normal',
    status: 'Approved',
  },
  {
    id: 'REQ-2039',
    patient: 'Diya Shah',
    hospital: 'Ruby Hall Clinic',
    blood: 'B+',
    units: 1,
    date: '2026-10-21',
    priority: 'Normal',
    status: 'Fulfilled',
  },
  {
    id: 'REQ-2038',
    patient: 'Arjun Pawar',
    hospital: 'City Care Hospital',
    blood: 'AB-',
    units: 2,
    date: '2026-10-20',
    priority: 'Urgent',
    status: 'Pending',
  },
];

// Blood donations
export const seedDonations = [
  {
    id: 'DON-501',
    donor: 'Ishaan Joshi',
    blood: 'O-',
    units: 1,
    date: '2026-09-29',
    location: 'Main Center',
  },
  {
    id: 'DON-500',
    donor: 'Aarav Patil',
    blood: 'O+',
    units: 1,
    date: '2026-09-18',
    location: 'Main Center',
  },
  {
    id: 'DON-499',
    donor: 'Ananya Sharma',
    blood: 'A+',
    units: 1,
    date: '2026-08-22',
    location: 'Camp - Deccan',
  },
];

// Hospitals
export const seedHospitals = [
  {
    id: 'H-101',
    name: 'City Care Hospital',
    contact: 'Dr. N. Shah',
    phone: '020-45678901',
    city: 'Pune',
    status: 'Verified',
  },
  {
    id: 'H-102',
    name: 'Sahyadri Hospital',
    contact: 'Dr. P. Kulkarni',
    phone: '020-67890123',
    city: 'Pune',
    status: 'Verified',
  },
  {
    id: 'H-103',
    name: 'Ruby Hall Clinic',
    contact: 'Dr. A. Mehta',
    phone: '020-23456789',
    city: 'Pune',
    status: 'Pending',
  },
];

// Dashboard chart data
export const chartData = [
  { month: 'May', donations: 54, requests: 42 },
  { month: 'Jun', donations: 68, requests: 51 },
  { month: 'Jul', donations: 61, requests: 48 },
  { month: 'Aug', donations: 82, requests: 63 },
  { month: 'Sep', donations: 74, requests: 59 },
  { month: 'Oct', donations: 91, requests: 70 },
];

// Sidebar navigation items
export const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/donors',
    label: 'Donors',
    icon: Users,
  },
  {
    to: '/inventory',
    label: 'Blood Inventory',
    icon: Droplet,
  },
  {
    to: '/requests',
    label: 'Blood Requests',
    icon: ClipboardList,
  },
  {
    to: '/donations',
    label: 'Donations',
    icon: HandHeart,
  },
  {
    to: '/screenings',
    label: 'Lab Screenings',
    icon: Stethoscope,
  },
  {
    to: '/hospitals',
    label: 'Hospitals',
    icon: Building2,
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: FileBarChart,
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];
