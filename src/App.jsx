import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate, } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Sidebar from './components/layout/Sidebar.jsx';
import Topbar from './components/layout/Topbar.jsx';
import usePersistedState from './hooks/usePersistedState.js';
import { navItems, seedDonations, seedDonors, seedHospitals, seedInventory, seedRequests, } from './data/mockData.js';
import Dashboard from './pages/Dashboard.jsx';
import Donors from './pages/Donors.jsx';
import Inventory from './pages/Inventory.jsx';
import Requests from './pages/Requests.jsx';
import Donations from './pages/Donations.jsx';
import Hospitals from './pages/Hospitals.jsx';
import Reports from './pages/Reports.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import Login from './pages/Login.jsx';
export default function App() {
    const [donors, setDonors] = usePersistedState('bb_donors', seedDonors);
    const [inventory, setInventory] = usePersistedState('bb_inventory', seedInventory);
    const [requests, setRequests] = usePersistedState('bb_requests', seedRequests);
    const [donations, setDonations] = usePersistedState('bb_donations', seedDonations);
    const [hospitals, setHospitals] = usePersistedState('bb_hospitals', seedHospitals);
    const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem('bb_demo_login') === 'yes');
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const currentPage = navItems.find((item) => item.to === location.pathname)?.label ??
        'Dashboard';
    const pendingRequests = requests.filter((request) => request.status === 'Pending').length;
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);
    const handleLogin = () => {
        sessionStorage.setItem('bb_demo_login', 'yes');
        setLoggedIn(true);
        navigate('/');
    };
    const handleLogout = () => {
        sessionStorage.removeItem('bb_demo_login');
        setLoggedIn(false);
        navigate('/');
    };
    if (!loggedIn) {
        return <Login onLogin={handleLogin}/>;
    }
    return (<div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={mobileOpen} pendingRequests={pendingRequests} onClose={() => setMobileOpen(false)}/>

      <div className="min-h-screen lg:pl-64">
        <Topbar title={currentPage} onMenuClick={() => setMobileOpen(true)} onLogout={handleLogout}/>

        <main className="mx-auto max-w-[1600px] p-4 sm:p-7">
          <Routes>
            <Route path="/" element={<Dashboard donors={donors} inventory={inventory} requests={requests} donations={donations}/>}/>
            <Route path="/donors" element={<Donors donors={donors} setDonors={setDonors}/>}/>
            <Route path="/inventory" element={<Inventory inventory={inventory} setInventory={setInventory}/>}/>
            <Route path="/requests" element={<Requests requests={requests} setRequests={setRequests} inventory={inventory} setInventory={setInventory}/>}/>
            <Route path="/donations" element={<Donations donations={donations} setDonations={setDonations} donors={donors}/>}/>
            <Route path="/hospitals" element={<Hospitals hospitals={hospitals} setHospitals={setHospitals}/>}/>
            <Route path="/reports" element={<Reports donors={donors} inventory={inventory} requests={requests} donations={donations}/>}/>
            <Route path="/settings" element={<SettingsPage />}/>
            <Route path="*" element={<Dashboard donors={donors} inventory={inventory} requests={requests} donations={donations}/>}/>
          </Routes>

          <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">
            <span>
              © 2026 HemoCare · Blood Bank Management System
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={13}/>
              Educational demo — not for real clinical decisions
            </span>
          </footer>
        </main>
      </div>
    </div>);
}

