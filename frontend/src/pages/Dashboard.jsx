import { useMemo, useState } from 'react';
import { useAsset } from '../context/AssetContext';

const BASE_OPTIONS = ['Base Alpha', 'Base Beta', 'Base Gamma', 'Base Delta'];
const EQUIPMENT_TYPES = ['Weapons', 'Vehicles', 'Ammunition', 'Equipment', 'Supplies'];

export default function Dashboard({ userRole, userBase = null }) {
  const { getMetrics, assets, transfers, purchases } = useAsset();
  const [selectedBase, setSelectedBase] = useState(userBase || '');
  const [selectedEquipmentType, setSelectedEquipmentType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showNetMovementDetails, setShowNetMovementDetails] = useState(false);

  const metrics = getMetrics(
    selectedBase || null,
    selectedEquipmentType || null,
    selectedDate || null
  );

  // Derived chart data
  const normalizeType = (t) => {
    const s = String(t || '').trim().toLowerCase();
    if (!s) return 'Unknown';
    if (s.startsWith('weapon')) return 'Weapons';
    if (s.startsWith('vehicle')) return 'Vehicles';
    if (s.startsWith('ammo')) return 'Ammunition';
    if (s.startsWith('ammun')) return 'Ammunition';
    if (s.startsWith('equip')) return 'Equipment';
    if (s.startsWith('supp')) return 'Supplies';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const assetsByType = useMemo(() => {
    const filtered = assets.filter(a =>
      (selectedBase ? a.base === selectedBase : true) &&
      (selectedEquipmentType ? normalizeType(a.equipmentType) === normalizeType(selectedEquipmentType) : true)
    );
    const map = new Map();
    filtered.forEach(a => {
      const key = normalizeType(a.equipmentType);
      const qty = Number(a.quantity) || 0;
      map.set(key, (map.get(key) || 0) + qty);
    });
    const entries = Array.from(map.entries());
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
    return entries.map(([label, value]) => ({ label, value, pct: (value / total) * 100 }));
  }, [assets, selectedBase, selectedEquipmentType]);

  const availability = useMemo(() => {
    const filtered = assets.filter(a => (selectedBase ? a.base === selectedBase : true));
    const available = filtered.reduce((s, a) => s + (a.quantity || 0), 0);
    const assigned = filtered.reduce((s, a) => s + (a.assigned || 0), 0);
    return { available, assigned };
  }, [assets, selectedBase]);

  const handleResetFilters = () => {
    setSelectedBase(userBase || '');
    setSelectedEquipmentType('');
    setSelectedDate('');
  };

  const fmt = (n) => Number(n || 0).toLocaleString();

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Asset Management Dashboard</h1>
        {userRole === 'commander' && userBase && (
          <div className="px-4 py-2 bg-military-green/30 border border-military-green/50 rounded-lg text-military-gold font-medium">
            Base: {userBase}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8 p-6 bg-slate-800/80 rounded-xl border border-military-green/30 flex-wrap items-end">
        <div className="flex flex-col gap-2 min-w-[150px] flex-1">
          <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Base</label>
          <select
            className="px-3 py-2.5 bg-slate-900/60 border border-gray-600/50 rounded-lg text-white text-sm transition-all focus:outline-none focus:border-military-green focus:ring-2 focus:ring-military-green/20 disabled:opacity-50 disabled:cursor-not-allowed"
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
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
            value={selectedEquipmentType}
            onChange={(e) => setSelectedEquipmentType(e.target.value)}
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
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <button 
          className="px-5 py-2.5 bg-gray-700/30 border border-gray-600/50 rounded-lg text-slate-300 font-medium transition-all hover:bg-gray-700/50 hover:text-white whitespace-nowrap"
          onClick={handleResetFilters}
        >
          Reset Filters
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-slate-800/80 border border-military-green/30 rounded-xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-xl">
          <div className="text-sm text-slate-400 mb-2 uppercase tracking-wider">Opening Balance</div>
          <div className="text-3xl font-bold text-white">{fmt(metrics.openingBalance)}</div>
        </div>

        <div className="bg-slate-800/80 border border-military-green/30 rounded-xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-xl">
          <div className="text-sm text-slate-400 mb-2 uppercase tracking-wider">Closing Balance</div>
          <div className="text-3xl font-bold text-white">{fmt(metrics.closingBalance)}</div>
        </div>

        <div 
          className="bg-slate-800/80 border border-military-green/30 rounded-xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
          onClick={() => setShowNetMovementDetails(true)}
        >
          <div className="text-sm text-slate-400 mb-2 uppercase tracking-wider">Net Movement</div>
          <div className="text-3xl font-bold text-white">{fmt(metrics.netMovement)}</div>
          <div className="text-xs text-military-gold mt-2 italic">Click for details</div>
        </div>

        <div className="bg-slate-800/80 border border-military-green/30 rounded-xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-xl">
          <div className="text-sm text-slate-400 mb-2 uppercase tracking-wider">Assigned</div>
          <div className="text-3xl font-bold text-white">{fmt(metrics.assigned)}</div>
        </div>

        <div className="bg-slate-800/80 border border-military-green/30 rounded-xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-xl">
          <div className="text-sm text-slate-400 mb-2 uppercase tracking-wider">Expended</div>
          <div className="text-3xl font-bold text-white">{fmt(metrics.expended)}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Assets by Type - Pie */}
        <div className="bg-slate-800/80 border border-military-green/30 rounded-xl p-6">
          <div className="text-lg font-semibold text-white mb-4">Assets by Type</div>
          <PieChart data={assetsByType} />
          <div className="mt-4 grid grid-cols-2 gap-2">
            {assetsByType.map((d) => (
              <div key={d.label} className="flex items-center gap-2 text-slate-300 text-sm">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: colorFor(d.label) }} />
                <span className="flex-1">{d.label}</span>
                <span className="text-slate-400">{d.pct === 0 ? '0.0%' : `${Math.max(0.1, d.pct).toFixed(1)}%`}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Availability - Bar */}
        <div className="bg-slate-800/80 border border-military-green/30 rounded-xl p-6">
          <div className="text-lg font-semibold text-white mb-4">Asset Availability</div>
          <BarChart available={availability.available} assigned={availability.assigned} />
        </div>
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTable title="Recent Transfers" rows={transfers.slice(-5).reverse()} columns={["equipmentType","fromBase","toBase","quantity","date"]} emptyLabel="No transfers yet" />
        <RecentTable title="Recent Purchases" rows={purchases.slice(-5).reverse()} columns={["equipmentType","base","quantity","date"]} emptyLabel="No purchases yet" />
      </div>

      {/* Net Movement Details Modal */}
      {showNetMovementDetails && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8"
          onClick={() => setShowNetMovementDetails(false)}
        >
          <div 
            className="bg-slate-800 border border-military-green/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-military-green/30">
              <h2 className="text-2xl font-bold text-white">Net Movement Details</h2>
              <button 
                className="text-slate-400 text-4xl leading-none hover:text-white transition-colors w-8 h-8 flex items-center justify-center"
                onClick={() => setShowNetMovementDetails(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 bg-slate-900/60 rounded-lg border-l-4 border-military-green">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Purchases</h3>
                <div className="text-2xl font-bold text-white">{metrics.purchases}</div>
              </div>
              <div className="mb-6 p-4 bg-slate-900/60 rounded-lg border-l-4 border-military-green">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Transfers In</h3>
                <div className="text-2xl font-bold text-white">{metrics.transfersIn}</div>
              </div>
              <div className="mb-6 p-4 bg-slate-900/60 rounded-lg border-l-4 border-military-green">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Transfers Out</h3>
                <div className="text-2xl font-bold text-white">{metrics.transfersOut}</div>
              </div>
              <div className="mb-6 p-4 bg-military-green/20 rounded-lg border-l-4 border-military-gold">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Net Movement</h3>
                <div className="text-2xl font-bold text-white mb-1">{metrics.netMovement}</div>
                <div className="text-xs text-slate-400 mt-2">
                  = Purchases ({metrics.purchases}) + Transfers In ({metrics.transfersIn}) - Transfers Out ({metrics.transfersOut})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Deterministic colors: green + light beige family
const CATEGORY_COLORS = {
  Ammunition: "#5B7044",
  Weapons: "#d2d683",
  Vehicles: "#d1a880",
  Supplies: "#E6DCC3",
  Equipment: "#d18d80",
  Unknown: "#9AA7A6",
};
const colorFor = (label) => CATEGORY_COLORS[label] || CATEGORY_COLORS.Unknown;

function PieChart({ data }) {
  const radius = 78;
  const strokeW = 28; // slightly thinner to make colors pop
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <svg viewBox="0 0 220 160" className="w-full h-48">
      <g transform="translate(90,80)">
        {data.map((d) => {
          const len = (d.pct / 100) * circumference;
          const circle = (
            <circle
              key={d.label}
              r={radius}
              cx="0"
              cy="0"
              fill="transparent"
              stroke={colorFor(d.label)}
              strokeWidth={strokeW}
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return circle;
        })}
        {/* No inner fill to avoid black center */}
      </g>
    </svg>
  );
}

function BarChart({ available, assigned }) {
  const max = Math.max(available, assigned, 1);
  const aHeight = (available / max) * 120;
  const sHeight = (assigned / max) * 120;
  return (
    <div className="h-56 flex items-end gap-10 px-6">
      <div className="flex flex-col items-center flex-1">
        <div className="w-12 bg-military-green/70" style={{ height: `${Math.max(available>0?8:0,aHeight)}px` }} />
        <span className="mt-2 text-sm text-slate-300">Available ({available})</span>
      </div>
      <div className="flex flex-col items-center flex-1">
        <div className="w-12 bg-military-gold/70" style={{ height: `${Math.max(assigned>0?8:0,sHeight)}px` }} />
        <span className="mt-2 text-sm text-slate-300">Assigned ({assigned})</span>
      </div>
    </div>
  );
}

function RecentTable({ title, rows, columns, emptyLabel }) {
  return (
    <div className="bg-slate-800/80 border border-military-green/30 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-military-green/30">
        <div className="text-lg font-semibold text-white">{title}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-slate-300 text-sm">
              {columns.map(col => (
                <th key={col} className="px-4 py-3 border-b border-slate-700 capitalize">{col.replace(/([A-Z])/g,' $1')}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-slate-200">
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-slate-400">{emptyLabel}</td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-800/60">
                {columns.map(c => (
                  <td key={c} className="px-4 py-3 text-sm">{String(r[c] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

