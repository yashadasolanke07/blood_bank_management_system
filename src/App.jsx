import { useEffect, useState, useCallback } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import Sidebar from './components/layout/Sidebar.jsx';
import Topbar from './components/layout/Topbar.jsx';
import { navItems } from './data/mockData.js';
import {
  fetchInventory,
  fetchInventoryUnits,
  fetchHospitalInventory,
  fetchDonors,
  fetchRequests,
  fetchAllocations,
  fetchHospitals,
  fetchBloodBanks,
  fetchMedicalTests,
  fetchAppointments,
  fetchDonations,
} from './services/api.js';

import Dashboard from './pages/Dashboard.jsx';
import Donors from './pages/Donors.jsx';
import Inventory from './pages/Inventory.jsx';
import Requests from './pages/Requests.jsx';
import Donations from './pages/Donations.jsx';
import Screenings from './pages/Screenings.jsx';
import Hospitals from './pages/Hospitals.jsx';
import Reports from './pages/Reports.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import Login from './pages/Login.jsx';

export default function App() {
  const [donors, setDonors] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [inventoryUnits, setInventoryUnits] = useState([]);
  const [hospitalInventory, setHospitalInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [donations, setDonations] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Dual Portal View Mode: 'blood_bank' (Central Operations) or 'hospital' (Hospital Network & Requisitions)
  const [portal, setPortal] = useState('blood_bank');

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('bb_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loggedIn, setLoggedIn] = useState(
    () => sessionStorage.getItem('bb_auth_session') === 'yes' || sessionStorage.getItem('bb_demo_login') === 'yes'
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentPage =
    navItems.find((item) => item.to === location.pathname)?.label ?? 'Dashboard';

  const pendingRequests = requests.filter((r) => r.status === 'Pending').length;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Unified Single-Source-of-Truth fetch from MySQL via Flask
  const refreshAllData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [
        invData,
        unitsData,
        hospInvData,
        donorsData,
        reqData,
        alcData,
        hospData,
        banksData,
        donData,
        testsData,
        apptsData,
      ] = await Promise.all([
        fetchInventory(),
        fetchInventoryUnits(),
        fetchHospitalInventory(),
        fetchDonors(),
        fetchRequests(),
        fetchAllocations(),
        fetchHospitals(),
        fetchBloodBanks(),
        fetchDonations(),
        fetchMedicalTests(),
        fetchAppointments(),
      ]);
      setInventory(invData);
      setInventoryUnits(unitsData);
      setHospitalInventory(hospInvData);
      setDonors(donorsData);
      setRequests(reqData);
      setAllocations(alcData);
      setHospitals(hospData);
      setBloodBanks(banksData);
      setDonations(donData);
      setScreenings(testsData);
      setAppointments(apptsData);
    } catch (err) {
      console.error('Failed to load database state:', err);
      setApiError(
        'Cannot connect to MySQL backend. Make sure "python app.py" is running on port 5000.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const handleLogin = (userInfo) => {
    sessionStorage.setItem('bb_auth_session', 'yes');
    if (userInfo) {
      sessionStorage.setItem('bb_auth_user', JSON.stringify(userInfo));
      setCurrentUser(userInfo);
      setPortal(userInfo.role === 'HOSPITAL' ? 'hospital' : 'blood_bank');
    }
    setLoggedIn(true);
    navigate('/');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('bb_auth_session');
    sessionStorage.removeItem('bb_demo_login');
    sessionStorage.removeItem('bb_auth_user');
    setCurrentUser(null);
    setLoggedIn(false);
    navigate('/');
  };

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        isOpen={mobileOpen}
        pendingRequests={pendingRequests}
        onClose={() => setMobileOpen(false)}
        portal={portal}
      />

      <div className="min-h-screen lg:pl-64">
        <Topbar
          title={currentPage}
          onMenuClick={() => setMobileOpen(true)}
          onLogout={handleLogout}
          portal={portal}
          setPortal={setPortal}
          currentUser={currentUser}
        />

        <main className="mx-auto max-w-[1600px] p-4 sm:p-7">
          {apiError && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span>{apiError}</span>
              <button
                onClick={refreshAllData}
                className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          )}

          {loading && (
            <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-500">
              <RefreshCw size={13} className="animate-spin text-red-600" />
              Syncing live data from MySQL database...
            </div>
          )}

          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  donors={donors}
                  inventory={inventory}
                  requests={requests}
                  donations={donations}
                  portal={portal}
                />
              }
            />
            <Route
              path="/donors"
              element={<Donors donors={donors} onRefresh={refreshAllData} hospitals={hospitals} />}
            />
            <Route
              path="/inventory"
              element={
                <Inventory
                  inventory={inventory}
                  hospitalInventory={hospitalInventory}
                  units={inventoryUnits}
                />
              }
            />
            <Route
              path="/requests"
              element={
                <Requests
                  requests={requests}
                  inventory={inventory}
                  allocations={allocations}
                  hospitals={hospitals}
                  onRefresh={refreshAllData}
                  portal={portal}
                />
              }
            />
            <Route
              path="/screenings"
              element={
                <Screenings
                  screenings={screenings}
                  appointments={appointments}
                  donors={donors}
                  hospitals={hospitals}
                  onRefresh={refreshAllData}
                  portal={portal}
                />
              }
            />
            <Route
              path="/donations"
              element={
                <Donations
                  donations={donations}
                  donors={donors}
                  onRefresh={refreshAllData}
                />
              }
            />
            <Route
              path="/hospitals"
              element={
                <Hospitals
                  hospitals={hospitals}
                  bloodBanks={bloodBanks}
                  onRefresh={refreshAllData}
                />
              }
            />
            <Route
              path="/reports"
              element={
                <Reports
                  donors={donors}
                  inventory={inventory}
                  requests={requests}
                  donations={donations}
                />
              }
            />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="*"
              element={
                <Dashboard
                  donors={donors}
                  inventory={inventory}
                  requests={requests}
                  donations={donations}
                  portal={portal}
                />
              }
            />
          </Routes>

          <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">
            <span>© 2026 HemoCare · Blood Bank Management System</span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} />
              DBMS Course Project · MySQL 8.0 Integration
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
