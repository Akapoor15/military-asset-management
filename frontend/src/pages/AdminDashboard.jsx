import { useState } from 'react';
import { useAsset } from '../context/AssetContext';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Purchases from './Purchases';
import Transfers from './Transfers';
import Assignments from './Assignments';

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState('dashboard');
  const navigate = useNavigate();
  const { syncLocalToBackend } = useAsset();

  const handleLogout = () => {
    navigate('/');
  };

  const pages = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'purchases', label: 'Purchases' },
    { id: 'transfers', label: 'Transfers' },
    { id: 'assignments', label: 'Assignments & Expenditures' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900">
      <nav className="w-64 bg-slate-800 border-r border-military-green/30 flex flex-col p-6 fixed h-screen overflow-y-auto scrollbar-custom">
        <div className="mb-8 pb-6 border-b border-military-green/30">
          <h2 className="text-xl font-bold text-white mb-3">Admin Panel</h2>
          <div className="inline-block px-3 py-1 bg-gradient-to-r from-military-green to-military-green-light text-white text-xs font-semibold uppercase tracking-wider rounded">
            Admin
          </div>
        </div>
        <ul className="flex-1 list-none p-0 m-0">
          {pages.map(page => (
            <li key={page.id} className="mb-2">
              <button
                className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-all ${
                  activePage === page.id
                    ? 'bg-gradient-to-r from-military-green to-military-green-light text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-military-green/20'
                }`}
                onClick={() => setActivePage(page.id)}
              >
                {page.label}
              </button>
            </li>
          ))}
        </ul>
        <button 
          className="w-full px-4 py-3 bg-red-600/20 border border-red-600/30 rounded-lg text-red-300 font-medium transition-all hover:bg-red-600/30 hover:text-white mt-auto"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>

      <main className="flex-1 ml-64 p-8 min-h-screen">
        <div className="flex justify-end mb-4">
          <button
            onClick={async () => { const r = await syncLocalToBackend(true); alert(`Synced: purchases ${r.purchases||0}, transfers ${r.transfers||0}, assignments ${r.assignments||0}`); }}
            className="px-4 py-2 bg-military-green/30 border border-military-green/50 rounded text-white text-sm hover:bg-military-green/40"
          >
            Sync to DB
          </button>
        </div>
        {activePage === 'dashboard' && <Dashboard userRole="admin" />}
        {activePage === 'purchases' && <Purchases userRole="admin" />}
        {activePage === 'transfers' && <Transfers userRole="admin" />}
        {activePage === 'assignments' && <Assignments userRole="admin" />}
      </main>
    </div>
  );
}
