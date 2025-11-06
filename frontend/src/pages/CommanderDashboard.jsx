import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Purchases from './Purchases';
import Transfers from './Transfers';
import Assignments from './Assignments';

export default function CommanderDashboard() {
  const [activePage, setActivePage] = useState('dashboard');
  const navigate = useNavigate();
  const userBase = 'Base Alpha';

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
          <h2 className="text-xl font-bold text-white mb-3">Commander Panel</h2>
          <div className="inline-block px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-semibold uppercase tracking-wider rounded mb-2">
            Commander
          </div>
          <div className="text-military-gold text-sm font-medium">{userBase}</div>
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
        {activePage === 'dashboard' && <Dashboard userRole="commander" userBase={userBase} />}
        {activePage === 'purchases' && <Purchases userRole="commander" userBase={userBase} />}
        {activePage === 'transfers' && <Transfers userRole="commander" userBase={userBase} />}
        {activePage === 'assignments' && <Assignments userRole="commander" userBase={userBase} />}
      </main>
    </div>
  );
}
