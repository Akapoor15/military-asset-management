import { createContext, useContext, useState, useEffect } from 'react';

const AssetContext = createContext();

export const useAsset = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAsset must be used within AssetProvider');
  }
  return context;
};

export const AssetProvider = ({ children }) => {
  // Initialize with sample data
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('militaryAssets');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchases, setPurchases] = useState(() => {
    const saved = localStorage.getItem('militaryPurchases');
    return saved ? JSON.parse(saved) : [];
  });

  const [transfers, setTransfers] = useState(() => {
    const saved = localStorage.getItem('militaryTransfers');
    return saved ? JSON.parse(saved) : [];
  });

  const [assignments, setAssignments] = useState(() => {
    const saved = localStorage.getItem('militaryAssignments');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenditures, setExpenditures] = useState(() => {
    const saved = localStorage.getItem('militaryExpenditures');
    return saved ? JSON.parse(saved) : [];
  });

  // One-time normalization to avoid corrupted numeric values from past sessions
  const normalizeNumber = (v) => {
    const n = Number(v);
    if (!isFinite(n) || isNaN(n)) return 0;
    // guard against accidentally stored timestamps as quantities
    if (n > 1e7) return 0;
    if (n < 0) return 0;
    return n;
  };

  useEffect(() => {
    setAssets(prev => prev.map(a => ({
      ...a,
      quantity: normalizeNumber(a.quantity),
      openingBalance: normalizeNumber(a.openingBalance),
      assigned: normalizeNumber(a.assigned),
      expended: normalizeNumber(a.expended),
    })));
    setPurchases(prev => prev.map(p => ({ ...p, quantity: normalizeNumber(p.quantity) })));
    setTransfers(prev => prev.map(t => ({ ...t, quantity: normalizeNumber(t.quantity) })));
    setAssignments(prev => prev.map(a => ({ ...a, quantity: normalizeNumber(a.quantity) })));
    setExpenditures(prev => prev.map(e => ({ ...e, quantity: normalizeNumber(e.quantity) })));
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('militaryAssets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('militaryPurchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('militaryTransfers', JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem('militaryAssignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('militaryExpenditures', JSON.stringify(expenditures));
  }, [expenditures]);

  // Add purchase
  const canonicalType = (t) => {
    const s = String(t || '').trim().toLowerCase();
    if (s.startsWith('weapon')) return 'Weapons';
    if (s.startsWith('vehicle')) return 'Vehicles';
    if (s.startsWith('ammo') || s.startsWith('ammun')) return 'Ammunition';
    if (s.startsWith('equip')) return 'Equipment';
    if (s.startsWith('supp')) return 'Supplies';
    return t || 'Unknown';
  };

  const addPurchase = (purchaseData) => {
    // Fire-and-forget to backend
    const token = localStorage.getItem('token');
    fetch('http://localhost:5050/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify({
        base: purchaseData.base,
        equipmentType: purchaseData.equipmentType,
        quantity: purchaseData.quantity,
        vendor: purchaseData.vendor,
        cost: purchaseData.cost,
        date: purchaseData.date,
        notes: purchaseData.description,
      }),
    }).catch(() => {});
    const qty = Number(purchaseData.quantity) || 0;
    const newPurchase = {
      id: Date.now().toString(),
      ...purchaseData,
      quantity: qty,
      date: new Date(purchaseData.date).toISOString(),
      createdAt: new Date().toISOString(),
    };
    setPurchases([...purchases, newPurchase]);
    
    // Update asset inventory
    const existingAsset = assets.find(
      a => a.base === purchaseData.base && canonicalType(a.equipmentType) === canonicalType(purchaseData.equipmentType)
    );
    
    if (existingAsset) {
      setAssets(assets.map(a => 
        a.id === existingAsset.id 
          ? { ...a, quantity: (Number(a.quantity) || 0) + qty }
          : a
      ));
    } else {
      setAssets([...assets, {
        id: Date.now().toString(),
        base: purchaseData.base,
        equipmentType: canonicalType(purchaseData.equipmentType),
        quantity: qty,
        openingBalance: 0,
        assigned: 0,
        expended: 0,
      }]);
    }
    
    return newPurchase;
  };

  // Add transfer
  const addTransfer = (transferData) => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5050/api/transfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify({
        fromLocation: transferData.fromBase,
        toLocation: transferData.toBase,
        equipmentType: transferData.equipmentType,
        quantity: transferData.quantity,
        date: transferData.date,
        notes: transferData.description,
      }),
    }).catch(() => {});
    const qty = Number(transferData.quantity) || 0;
    const newTransfer = {
      id: Date.now().toString(),
      ...transferData,
      quantity: qty,
      date: new Date(transferData.date).toISOString(),
      createdAt: new Date().toISOString(),
    };
    setTransfers([...transfers, newTransfer]);
    
    // Update source base
    const sourceAsset = assets.find(
      a => a.base === transferData.fromBase && a.equipmentType === transferData.equipmentType
    );
    if (sourceAsset && (Number(sourceAsset.quantity) || 0) >= qty) {
      setAssets(assets.map(a => 
        a.id === sourceAsset.id 
          ? { ...a, quantity: (Number(a.quantity) || 0) - qty }
          : a
      ));
    }
    
    // Update destination base
    const destAsset = assets.find(
      a => a.base === transferData.toBase && a.equipmentType === transferData.equipmentType
    );
    if (destAsset) {
      setAssets(assets.map(a => 
        a.id === destAsset.id 
          ? { ...a, quantity: (Number(a.quantity) || 0) + qty }
          : a
      ));
    } else {
      setAssets([...assets, {
        id: Date.now().toString() + '_dest',
        base: transferData.toBase,
        equipmentType: transferData.equipmentType,
        quantity: qty,
        openingBalance: 0,
        assigned: 0,
        expended: 0,
      }]);
    }
    
    return newTransfer;
  };

  // Add assignment
  const addAssignment = (assignmentData) => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5050/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify({
        base: assignmentData.base,
        equipmentType: assignmentData.equipmentType,
        assignee: assignmentData.assignedTo || assignmentData.person || 'Unknown',
        quantity: assignmentData.quantity,
        date: assignmentData.date,
        notes: assignmentData.description,
      }),
    }).catch(() => {});
    const qty = Number(assignmentData.quantity) || 0;
    const newAssignment = {
      id: Date.now().toString(),
      ...assignmentData,
      quantity: qty,
      date: new Date(assignmentData.date).toISOString(),
      createdAt: new Date().toISOString(),
    };
    setAssignments([...assignments, newAssignment]);
    
    // Update asset assigned count
    const asset = assets.find(
      a => a.base === assignmentData.base && a.equipmentType === assignmentData.equipmentType
    );
    if (asset && (Number(asset.quantity) || 0) >= qty) {
      setAssets(assets.map(a => 
        a.id === asset.id 
          ? { ...a, assigned: (Number(a.assigned) || 0) + qty }
          : a
      ));
    }
    
    return newAssignment;
  };

  // Add expenditure
  const addExpenditure = (expenditureData) => {
    const qty = Number(expenditureData.quantity) || 0;
    const newExpenditure = {
      id: Date.now().toString(),
      ...expenditureData,
      quantity: qty,
      date: new Date(expenditureData.date).toISOString(),
      createdAt: new Date().toISOString(),
    };
    setExpenditures([...expenditures, newExpenditure]);
    
    // Update asset expended count and reduce quantity
    const asset = assets.find(
      a => a.base === expenditureData.base && a.equipmentType === expenditureData.equipmentType
    );
    if (asset) {
      const expendQty = qty;
      setAssets(assets.map(a => 
        a.id === asset.id 
          ? { 
              ...a, 
              expended: (Number(a.expended) || 0) + expendQty,
              quantity: Math.max(0, (Number(a.quantity) || 0) - expendQty)
            }
          : a
      ));
    }
    
    return newExpenditure;
  };

  // Calculate metrics
  const getMetrics = (baseFilter = null, equipmentTypeFilter = null, dateFilter = null) => {
    let filteredPurchases = purchases;
    let filteredTransfers = transfers;
    let filteredAssets = assets;

    // Apply filters
    if (baseFilter) {
      filteredPurchases = filteredPurchases.filter(p => p.base === baseFilter);
      filteredTransfers = filteredTransfers.filter(t => 
        t.fromBase === baseFilter || t.toBase === baseFilter
      );
      filteredAssets = filteredAssets.filter(a => a.base === baseFilter);
    }

    if (equipmentTypeFilter) {
      filteredPurchases = filteredPurchases.filter(p => p.equipmentType === equipmentTypeFilter);
      filteredTransfers = filteredTransfers.filter(t => t.equipmentType === equipmentTypeFilter);
      filteredAssets = filteredAssets.filter(a => a.equipmentType === equipmentTypeFilter);
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filteredPurchases = filteredPurchases.filter(p => {
        const purchaseDate = new Date(p.date);
        return purchaseDate.toDateString() === filterDate.toDateString();
      });
      filteredTransfers = filteredTransfers.filter(t => {
        const transferDate = new Date(t.date);
        return transferDate.toDateString() === filterDate.toDateString();
      });
    }

    // Calculate totals
    const totalPurchases = filteredPurchases.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
    const transfersIn = filteredTransfers
      .filter(t => baseFilter ? t.toBase === baseFilter : true)
      .reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
    const transfersOut = filteredTransfers
      .filter(t => baseFilter ? t.fromBase === baseFilter : true)
      .reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
    
    const closingBalance = filteredAssets.reduce((sum, a) => sum + (Number(a.quantity) || 0), 0);
    const netMovement = totalPurchases + transfersIn - transfersOut;
    const openingBalance = Math.max(0, closingBalance - netMovement);
    const assigned = filteredAssets.reduce((sum, a) => sum + (Number(a.assigned) || 0), 0);
    const expended = filteredAssets.reduce((sum, a) => sum + (Number(a.expended) || 0), 0);

    return {
      openingBalance,
      closingBalance,
      netMovement,
      purchases: totalPurchases,
      transfersIn,
      transfersOut,
      assigned,
      expended,
    };
  };

  const value = {
    assets,
    purchases,
    transfers,
    assignments,
    expenditures,
    addPurchase,
    addTransfer,
    addAssignment,
    addExpenditure,
    getMetrics,
    setAssets,
    syncLocalToBackend: async (force = false) => {
      const already = localStorage.getItem('mams_synced') === '1';
      if (already && !force) return { skipped: true };
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' };
      const baseUrl = 'http://localhost:5050';

      let okPurch = 0, okTrans = 0, okAssign = 0;
      const safeFetch = async (url, body) => {
        try { const r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) }); return r.ok; }
        catch { return false; }
      };

      for (const p of purchases) {
        const body = {
          base: p.base,
          equipmentType: p.equipmentType,
          quantity: Number(p.quantity) || 0,
          date: p.date,
          notes: p.description,
        };
        if (p.vendor) body.vendor = p.vendor;
        if (p.cost != null && p.cost !== '') body.cost = Number(p.cost) || 0;
        const success = await safeFetch(`${baseUrl}/api/purchases`, body);
        if (success) okPurch++;
      }

      for (const t of transfers) {
        const success = await safeFetch(`${baseUrl}/api/transfers`, {
          fromLocation: t.fromBase,
          toLocation: t.toBase,
          equipmentType: t.equipmentType,
          quantity: Number(t.quantity) || 0,
          date: t.date,
          notes: t.description,
        });
        if (success) okTrans++;
      }

      for (const a of assignments) {
        const success = await safeFetch(`${baseUrl}/api/assignments`, {
          base: a.base,
          equipmentType: a.equipmentType,
          assignee: a.assignedTo || a.person || 'Unknown',
          quantity: Number(a.quantity) || 0,
          date: a.date,
          notes: a.description,
        });
        if (success) okAssign++;
      }

      localStorage.setItem('mams_synced', '1');
      return { ok: true, purchases: okPurch, transfers: okTrans, assignments: okAssign };
    },
    syncPurchasesToBackend: async () => {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' };
      const baseUrl = 'http://localhost:5050';
      let ok = 0; let firstErr = '';
      for (const p of purchases) {
        const body = {
          base: p.base,
          equipmentType: p.equipmentType,
          quantity: Number(p.quantity) || 0,
          date: p.date,
          notes: p.description,
        };
        if (p.vendor) body.vendor = p.vendor;
        if (p.cost != null && p.cost !== '') body.cost = Number(p.cost) || 0;
        try {
          const r = await fetch(`${baseUrl}/api/purchases`, { method: 'POST', headers, body: JSON.stringify(body) });
          if (r.ok) ok++; else { const t = await r.text(); if (!firstErr) firstErr = t; }
        } catch (e) { if (!firstErr) firstErr = String(e); }
      }
      return { ok, total: purchases.length, error: firstErr };
    },
  };

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>;
};

