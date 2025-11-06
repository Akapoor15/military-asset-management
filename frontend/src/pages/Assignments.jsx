import { useState } from 'react';
import { useAsset } from '../context/AssetContext';

const BASE_OPTIONS = ['Base Alpha', 'Base Beta', 'Base Gamma', 'Base Delta'];
const EQUIPMENT_TYPES = ['Weapons', 'Vehicles', 'Ammunition', 'Equipment', 'Supplies'];

export default function Assignments({ userRole, userBase = null }) {
  const { assignments, expenditures, addAssignment, addExpenditure, assets } = useAsset();
  const [activeTab, setActiveTab] = useState('assignments');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showExpenditureForm, setShowExpenditureForm] = useState(false);
  
  const [assignmentData, setAssignmentData] = useState({
    base: userBase || '',
    equipmentType: '',
    quantity: '',
    personnelName: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [expenditureData, setExpenditureData] = useState({
    base: userBase || '',
    equipmentType: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const handleAssignmentSubmit = (e) => {
    e.preventDefault();
    
    const asset = assets.find(
      a => a.base === assignmentData.base && a.equipmentType === assignmentData.equipmentType
    );
    
    if (!asset || asset.quantity < parseInt(assignmentData.quantity)) {
      alert('Insufficient quantity available!');
      return;
    }
    
    addAssignment({
      ...assignmentData,
      quantity: parseInt(assignmentData.quantity),
    });
    
    setAssignmentData({
      base: userBase || '',
      equipmentType: '',
      quantity: '',
      personnelName: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setShowAssignmentForm(false);
    alert('Assignment recorded successfully!');
  };

  const handleExpenditureSubmit = (e) => {
    e.preventDefault();
    
    const asset = assets.find(
      a => a.base === expenditureData.base && a.equipmentType === expenditureData.equipmentType
    );
    
    if (!asset || asset.quantity < parseInt(expenditureData.quantity)) {
      alert('Insufficient quantity available!');
      return;
    }
    
    addExpenditure({
      ...expenditureData,
      quantity: parseInt(expenditureData.quantity),
    });
    
    setExpenditureData({
      base: userBase || '',
      equipmentType: '',
      quantity: '',
      date: new Date().toISOString().split('T')[0],
      reason: '',
    });
    setShowExpenditureForm(false);
    alert('Expenditure recorded successfully!');
  };

  return (
    <div className="text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Assignments & Expenditures</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            className="px-6 py-3 bg-slate-700/40 border border-slate-600 rounded-lg text-slate-200 text-sm hover:bg-slate-600/40"
            onClick={async () => {
              const token = localStorage.getItem('token');
              const res = await fetch('http://localhost:5050/api/admin/assignments/replace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
                body: JSON.stringify({ assignments })
              });
              const data = await res.json();
              alert(res.ok ? `Replaced assignments in DB: ${data.inserted}` : `Failed: ${data.message || res.status}`);
            }}
          >
            Replace Assignments in DB
          </button>
          <button 
            className="px-6 py-3 bg-gradient-to-r from-military-green to-military-green-light hover:from-military-green-light hover:to-military-green text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-military-green/50 hover:shadow-xl hover:shadow-military-green/50 hover:-translate-y-0.5 uppercase tracking-wider text-sm"
            onClick={() => setShowAssignmentForm(true)}
          >
            + New Assignment
          </button>
          <button 
            className="px-6 py-3 bg-gradient-to-r from-military-green to-military-green-light hover:from-military-green-light hover:to-military-green text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-military-green/50 hover:shadow-xl hover:shadow-military-green/50 hover:-translate-y-0.5 uppercase tracking-wider text-sm"
            onClick={() => setShowExpenditureForm(true)}
          >
            + Record Expenditure
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-military-green/30">
        <button
          className={`px-6 py-3 text-sm font-medium uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'assignments'
              ? 'text-white border-military-green'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'expenditures'
              ? 'text-white border-military-green'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
          onClick={() => setActiveTab('expenditures')}
        >
          Expenditures
        </button>
      </div>

      {/* Assignment Form Modal */}
      {showAssignmentForm && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8"
          onClick={() => setShowAssignmentForm(false)}
        >
          <div 
            className="bg-slate-800 border border-military-green/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-military-green/30">
              <h2 className="text-2xl font-bold text-white">Assign Asset</h2>
              <button 
                className="text-slate-400 text-4xl leading-none hover:text-white transition-colors w-8 h-8 flex items-center justify-center"
                onClick={() => setShowAssignmentForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAssignmentSubmit} className="flex flex-col gap-5 p-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Base *</label>
                <select
                  required
                  value={assignmentData.base}
                  onChange={(e) => setAssignmentData({...assignmentData, base: e.target.value})}
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
                  value={assignmentData.equipmentType}
                  onChange={(e) => setAssignmentData({...assignmentData, equipmentType: e.target.value})}
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
                  value={assignmentData.quantity}
                  onChange={(e) => setAssignmentData({...assignmentData, quantity: e.target.value})}
                  className="px-4 py-3 bg-slate-900/60 border border-gray-600/50 rounded-lg text-white text-sm transition-all focus:outline-none focus:border-military-green focus:ring-2 focus:ring-military-green/20"
                />
                {assignmentData.base && assignmentData.equipmentType && (
                  <div className="text-xs text-military-gold mt-1">
                    Available: {
                      assets.find(
                        a => a.base === assignmentData.base && a.equipmentType === assignmentData.equipmentType
                      )?.quantity || 0
                    }
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Personnel Name *</label>
                <input
                  type="text"
                  required
                  value={assignmentData.personnelName}
                  onChange={(e) => setAssignmentData({...assignmentData, personnelName: e.target.value})}
                  className="px-4 py-3 bg-slate-900/60 border border-gray-600/50 rounded-lg text-white text-sm transition-all focus:outline-none focus:border-military-green focus:ring-2 focus:ring-military-green/20 placeholder-gray-500"
                  placeholder="Enter personnel name"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Date *</label>
                <input
                  type="date"
                  required
                  value={assignmentData.date}
                  onChange={(e) => setAssignmentData({...assignmentData, date: e.target.value})}
                  className="px-4 py-3 bg-slate-900/60 border border-gray-600/50 rounded-lg text-white text-sm transition-all focus:outline-none focus:border-military-green focus:ring-2 focus:ring-military-green/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Description</label>
                <textarea
                  value={assignmentData.description}
                  onChange={(e) => setAssignmentData({...assignmentData, description: e.target.value})}
                  className="px-4 py-3 bg-slate-900/60 border border-gray-600/50 rounded-lg text-white text-sm transition-all focus:outline-none focus:border-military-green focus:ring-2 focus:ring-military-green/20 resize-none"
                  rows="3"
                />
              </div>

              <div className="flex gap-4 justify-end mt-2">
                <button 
                  type="button" 
                  className="px-6 py-3 bg-gray-700/30 border border-gray-600/50 rounded-lg text-slate-300 font-medium transition-all hover:bg-gray-700/50 hover:text-white"
                  onClick={() => setShowAssignmentForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-gradient-to-r from-military-green to-military-green-light hover:from-military-green-light hover:to-military-green text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-military-green/50 hover:shadow-xl hover:shadow-military-green/50 hover:-translate-y-0.5 uppercase tracking-wider text-sm"
                >
                  Assign Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expenditure Form Modal */}
      {showExpenditureForm && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8"
          onClick={() => setShowExpenditureForm(false)}
        >
          <div 
            className="bg-slate-800 border border-military-green/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-military-green/30">
              <h2 className="text-2xl font-bold text-white">Record Expenditure</h2>
              <button 
                className="text-slate-400 text-4xl leading-none hover:text-white transition-colors w-8 h-8 flex items-center justify-center"
                onClick={() => setShowExpenditureForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleExpenditureSubmit} className="flex flex-col gap-5 p-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Base *</label>
                <select
                  required
                  value={expenditureData.base}
                  onChange={(e) => setExpenditureData({...expenditureData, base: e.target.value})}
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
                  value={expenditureData.equipmentType}
                  onChange={(e) => setExpenditureData({...expenditureData, equipmentType: e.target.value})}
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
                  value={expenditureData.quantity}
                  onChange={(e) => setExpenditureData({...expenditureData, quantity: e.target.value})}
                  className="px-4 py-3 bg-slate-900/60 border border-gray-600/50 rounded-lg text-white text-sm transition-all focus:outline-none focus:border-military-green focus:ring-2 focus:ring-military-green/20"
                />
                {expenditureData.base && expenditureData.equipmentType && (
                  <div className="text-xs text-military-gold mt-1">
                    Available: {
                      assets.find(
                        a => a.base === expenditureData.base && a.equipmentType === expenditureData.equipmentType
                      )?.quantity || 0
                    }
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Date *</label>
                <input
                  type="date"
                  required
                  value={expenditureData.date}
                  onChange={(e) => setExpenditureData({...expenditureData, date: e.target.value})}
                  className="px-4 py-3 bg-slate-900/60 border border-gray-600/50 rounded-lg text-white text-sm transition-all focus:outline-none focus:border-military-green focus:ring-2 focus:ring-military-green/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Reason *</label>
                <textarea
                  required
                  value={expenditureData.reason}
                  onChange={(e) => setExpenditureData({...expenditureData, reason: e.target.value})}
                  className="px-4 py-3 bg-slate-900/60 border border-gray-600/50 rounded-lg text-white text-sm transition-all focus:outline-none focus:border-military-green focus:ring-2 focus:ring-military-green/20 resize-none placeholder-gray-500"
                  rows="3"
                  placeholder="Explain why this asset was expended"
                />
              </div>

              <div className="flex gap-4 justify-end mt-2">
                <button 
                  type="button" 
                  className="px-6 py-3 bg-gray-700/30 border border-gray-600/50 rounded-lg text-slate-300 font-medium transition-all hover:bg-gray-700/50 hover:text-white"
                  onClick={() => setShowExpenditureForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-gradient-to-r from-military-green to-military-green-light hover:from-military-green-light hover:to-military-green text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-military-green/50 hover:shadow-xl hover:shadow-military-green/50 hover:-translate-y-0.5 uppercase tracking-wider text-sm"
                >
                  Record Expenditure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignments Table */}
      {activeTab === 'assignments' && (
        <div className="bg-slate-800/80 border border-military-green/30 rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-military-green/30">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-white uppercase tracking-wider border-b border-military-green/50">Date</th>
                <th className="p-4 text-left text-sm font-semibold text-white uppercase tracking-wider border-b border-military-green/50">Base</th>
                <th className="p-4 text-left text-sm font-semibold text-white uppercase tracking-wider border-b border-military-green/50">Equipment Type</th>
                <th className="p-4 text-left text-sm font-semibold text-white uppercase tracking-wider border-b border-military-green/50">Quantity</th>
                <th className="p-4 text-left text-sm font-semibold text-white uppercase tracking-wider border-b border-military-green/50">Personnel</th>
                <th className="p-4 text-left text-sm font-semibold text-white uppercase tracking-wider border-b border-military-green/50">Description</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 italic">No assignments found</td>
                </tr>
              ) : (
                assignments
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map(assignment => (
                    <tr key={assignment.id} className="hover:bg-military-green/10 border-b border-military-green/20 last:border-b-0">
                      <td className="p-4 text-slate-300 text-sm">{new Date(assignment.date).toLocaleDateString()}</td>
                      <td className="p-4 text-slate-300 text-sm">{assignment.base}</td>
                      <td className="p-4 text-slate-300 text-sm">{assignment.equipmentType}</td>
                      <td className="p-4 text-slate-300 text-sm">{assignment.quantity}</td>
                      <td className="p-4 text-slate-300 text-sm">{assignment.personnelName}</td>
                      <td className="p-4 text-slate-300 text-sm">{assignment.description || '-'}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Expenditures Table */}
      {activeTab === 'expenditures' && (
        <div className="bg-slate-800/80 border border-military-green/30 rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-military-green/30">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-white uppercase tracking-wider border-b border-military-green/50">Date</th>
                <th className="p-4 text-left text-sm font-semibold text-white uppercase tracking-wider border-b border-military-green/50">Base</th>
                <th className="p-4 text-left text-sm font-semibold text-white uppercase tracking-wider border-b border-military-green/50">Equipment Type</th>
                <th className="p-4 text-left text-sm font-semibold text-white uppercase tracking-wider border-b border-military-green/50">Quantity</th>
                <th className="p-4 text-left text-sm font-semibold text-white uppercase tracking-wider border-b border-military-green/50">Reason</th>
              </tr>
            </thead>
            <tbody>
              {expenditures.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 italic">No expenditures found</td>
                </tr>
              ) : (
                expenditures
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map(expenditure => (
                    <tr key={expenditure.id} className="hover:bg-military-green/10 border-b border-military-green/20 last:border-b-0">
                      <td className="p-4 text-slate-300 text-sm">{new Date(expenditure.date).toLocaleDateString()}</td>
                      <td className="p-4 text-slate-300 text-sm">{expenditure.base}</td>
                      <td className="p-4 text-slate-300 text-sm">{expenditure.equipmentType}</td>
                      <td className="p-4 text-slate-300 text-sm">{expenditure.quantity}</td>
                      <td className="p-4 text-slate-300 text-sm">{expenditure.reason}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
