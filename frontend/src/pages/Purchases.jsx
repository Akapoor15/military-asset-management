import { useState } from 'react';
import { useAsset } from '../context/AssetContext';

const BASE_OPTIONS = ['Base Alpha', 'Base Beta', 'Base Gamma', 'Base Delta'];
const EQUIPMENT_TYPES = ['Weapons', 'Vehicles', 'Ammunition', 'Equipment', 'Supplies'];

export default function Purchases({ userRole, userBase = null }) {
  const { purchases, addPurchase, syncPurchasesToBackend } = useAsset();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    base: userBase || '',
    equipmentType: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [filterBase, setFilterBase] = useState(userBase || '');
  const [filterEquipmentType, setFilterEquipmentType] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    addPurchase({
      ...formData,
      quantity: parseInt(formData.quantity),
    });
    setFormData({
      base: userBase || '',
      equipmentType: '',
      quantity: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setShowForm(false);
    alert('Purchase recorded successfully!');
  };

  const filteredPurchases = purchases.filter(p => {
    if (filterBase && p.base !== filterBase) return false;
    if (filterEquipmentType && p.equipmentType !== filterEquipmentType) return false;
    if (filterDate) {
      const purchaseDate = new Date(p.date).toISOString().split('T')[0];
      if (purchaseDate !== filterDate) return false;
    }
    return true;
  });

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Purchases</h1>
        <div className="flex gap-3">
          <button 
            className="px-6 py-3 bg-slate-700/40 border border-slate-600 rounded-lg text-slate-200 text-sm hover:bg-slate-600/40"
            onClick={async () => { const r = await syncPurchasesToBackend(); alert(`Synced ${r.ok} of ${r.total} purchases to MongoDB${r.error ? `\nFirst error: ${r.error}` : ''}`); }}
          >
            Sync Purchases to DB
          </button>
          <button 
            className="px-6 py-3 bg-slate-700/40 border border-slate-600 rounded-lg text-slate-200 text-sm hover:bg-slate-600/40"
            onClick={async () => {
              const token = localStorage.getItem('token');
              const res = await fetch('http://localhost:5050/api/admin/purchases/replace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
                body: JSON.stringify({ purchases })
              });
              const data = await res.json();
              alert(res.ok ? `Replaced purchases in DB: ${data.inserted}` : `Failed: ${data.message || res.status}`);
            }}
          >
            Replace Purchases in DB
          </button>
          <button 
            className="px-6 py-3 bg-gradient-to-r from-military-green to-military-green-light hover:from-military-green-light hover:to-military-green text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-military-green/50 hover:shadow-xl hover:shadow-military-green/50 hover:-translate-y-0.5 uppercase tracking-wider text-sm"
            onClick={() => setShowForm(true)}
          >
            + New Purchase
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8 p-6 bg-slate-800/80 rounded-xl border border-military-green/30 flex-wrap items-end">
        <div className="flex flex-col gap-2 min-w-[150px] flex-1">
          <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Base</label>
          <select
            className="px-3 py-2.5 bg-slate-900/60 border border-gray-600/50 rounded-lg text-white text-sm transition-all focus:outline-none focus:border-military-green focus:ring-2 focus:ring-military-green/20 disabled:opacity-50 disabled:cursor-not-allowed"
            value={filterBase}
            onChange={(e) => setFilterBase(e.target.value)}
            disabled={userRole === 'commander' && userBase}
          >
            <option value="">All Bases</option>
            {BASE_OPTIONS.map(base => (
              <option key={base} value={base}>{base}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 min-w-[150px] flex-1">
          <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Equipment Type</label>
          <select
            className="px-3 py-2.5 bg-slate-900/60 border border-gray-600/50 rounded-lg text-white text-sm transition-all focus:outline-none focus:border-military-green focus:ring-2 focus:ring-military-green/20"
            value={filterEquipmentType}
            onChange={(e) => setFilterEquipmentType(e.target.value)}
          >
            <option value="">All Types</option>
            {EQUIPMENT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 min-w-[150px] flex-1">
          <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Date</label>
          <input
            type="date"
            className="px-3 py-2.5 bg-slate-900/60 border border-gray-600/50 rounded-lg text-white text-sm transition-all focus:outline-none focus:border-military-green focus:ring-2 focus:ring-military-green/20"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {/* Purchase Form Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8"
          onClick={() => setShowForm(false)}
        >
          <div 
            className="bg-slate-800 border border-military-green/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-military-green/30">
              <h2 className="text-2xl font-bold text-white">Record New Purchase</h2>
              <button 
                className="text-slate-400 text-4xl leading-none hover:text-white transition-colors w-8 h-8 flex items-center justify-center"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Base *</label>
                <select
                  required
                  value={formData.base}
                  onChange={(e) => setFormData({...formData, base: e.target.value})}
                  disabled={userRole === 'commander' && userBase}
                  className="form-select px-4 py-3 bg-slate-900/60 border border-gray-600/50 rounded-lg text-white text-sm transition-all focus:outline-none focus:border-military-green focus:ring-2 focus:ring-military-green/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select Base</option>
                  {BASE_OPTIONS.map(base => (
                    <option key={base} value={base}>{base}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Equipment Type *</label>
                <select
                  required
                  value={formData.equipmentType}
                  onChange={(e) => setFormData({...formData, equipmentType: e.target.value})}
                  className="form-select px-4 py-3 bg-slate-900/60 border border-gray-600/50 rounded-lg text-white text-sm transition-all focus:outline-none focus:border-military-green focus:ring-2 focus:ring-military-green/20"
                >
                  <option value="">Select Type</option>
                  {EQUIPMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="px-4 py-3 bg-slate-900/60 border border-gray-600/50 rounded-lg text-white text-sm transition-all focus:outline-none focus:border-military-green focus:ring-2 focus:ring-military-green/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="px-4 py-3 bg-slate-900/60 border border-gray-600/50 rounded-lg text-white text-sm transition-all focus:outline-none focus:border-military-green focus:ring-2 focus:ring-military-green/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="px-4 py-3 bg-slate-900/60 border border-gray-600/50 rounded-lg text-white text-sm transition-all focus:outline-none focus:border-military-green focus:ring-2 focus:ring-military-green/20 resize-none"
                  rows="3"
                />
              </div>

              <div className="flex gap-4 justify-end mt-2">
                <button 
                  type="button" 
                  className="px-6 py-3 bg-gray-700/30 border border-gray-600/50 rounded-lg text-slate-300 font-medium transition-all hover:bg-gray-700/50 hover:text-white"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-gradient-to-r from-military-green to-military-green-light hover:from-military-green-light hover:to-military-green text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-military-green/50 hover:shadow-xl hover:shadow-military-green/50 hover:-translate-y-0.5 uppercase tracking-wider text-sm"
                >
                  Record Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchases Table */}
      <div className="bg-slate-800/80 border border-military-green/30 rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-military-green/30">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-white uppercase tracking-wider border-b border-military-green/50">Date</th>
              <th className="p-4 text-left text-sm font-semibold text-white uppercase tracking-wider border-b border-military-green/50">Base</th>
              <th className="p-4 text-left text-sm font-semibold text-white uppercase tracking-wider border-b border-military-green/50">Equipment Type</th>
              <th className="p-4 text-left text-sm font-semibold text-white uppercase tracking-wider border-b border-military-green/50">Quantity</th>
              <th className="p-4 text-left text-sm font-semibold text-white uppercase tracking-wider border-b border-military-green/50">Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500 italic">No purchases found</td>
              </tr>
            ) : (
              filteredPurchases
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(purchase => (
                  <tr key={purchase.id} className="hover:bg-military-green/10 border-b border-military-green/20 last:border-b-0">
                    <td className="p-4 text-slate-300 text-sm">{new Date(purchase.date).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-300 text-sm">{purchase.base}</td>
                    <td className="p-4 text-slate-300 text-sm">{purchase.equipmentType}</td>
                    <td className="p-4 text-slate-300 text-sm">{purchase.quantity}</td>
                    <td className="p-4 text-slate-300 text-sm">{purchase.description || '-'}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
