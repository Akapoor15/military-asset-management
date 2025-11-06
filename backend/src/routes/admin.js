const express = require("express");
const { optionalAuth } = require("../middleware/auth");
const { Transfer, Purchase, Assignment } = require("../models/Transaction");
const Asset = require("../models/Asset");

const router = express.Router();
router.use(optionalAuth);

// Replace ALL transfers with the list provided in req.body.transfers (admin utility)
router.post("/transfers/replace", async (req, res) => {
  try {
    const list = Array.isArray(req.body.transfers) ? req.body.transfers : [];
    await Transfer.deleteMany({});
    for (const t of list) {
      const qty = Number(t.quantity) || 0;
      const equip = t.equipmentType;
      const fromBase = t.fromBase || t.fromLocation;
      const toBase = t.toBase || t.toLocation;
      if (!fromBase || !toBase || !equip) continue;
      // Adjust stock between bases
      let fromAsset = await Asset.findOne({ name: equip, location: fromBase });
      if (!fromAsset) fromAsset = await Asset.create({ name: equip, category: equip, location: fromBase });
      await Asset.findByIdAndUpdate(fromAsset._id, { $inc: { quantity: -qty } });
      let toAsset = await Asset.findOne({ name: equip, location: toBase });
      if (!toAsset) toAsset = await Asset.create({ name: equip, category: equip, location: toBase });
      await Asset.findByIdAndUpdate(toAsset._id, { $inc: { quantity: qty } });
      await Transfer.create({ asset: toAsset._id, fromLocation: fromBase, toLocation: toBase, notes: t.description, createdAt: t.date ? new Date(t.date) : undefined, updatedAt: t.date ? new Date(t.date) : undefined, performedBy: req.user?.id || null, });
    }
    res.json({ ok: true, inserted: list.length });
  } catch (e) {
    res.status(500).json({ message: "Failed to replace transfers" });
  }
});

module.exports = router;

// Replace ALL purchases with list from client
router.post("/purchases/replace", async (req, res) => {
  try {
    const list = Array.isArray(req.body.purchases) ? req.body.purchases : [];
    await Purchase.deleteMany({});
    for (const p of list) {
      const qty = Number(p.quantity) || 0;
      const equip = p.equipmentType;
      const base = p.base;
      if (base && equip) {
        let asset = await Asset.findOne({ name: equip, location: base });
        if (!asset) asset = await Asset.create({ name: equip, category: equip, location: base });
        await Asset.findByIdAndUpdate(asset._id, { $inc: { quantity: qty } });
        await Purchase.create({ asset: asset._id, vendor: base, quantity: qty, cost: Number(p.cost)||0, notes: p.description, createdAt: p.date ? new Date(p.date) : undefined, updatedAt: p.date ? new Date(p.date) : undefined, performedBy: req.user?.id || null });
      }
    }
    res.json({ ok: true, inserted: list.length });
  } catch (e) {
    res.status(500).json({ message: "Failed to replace purchases" });
  }
});

// Replace ALL assignments with list from client
router.post("/assignments/replace", async (req, res) => {
  try {
    const list = Array.isArray(req.body.assignments) ? req.body.assignments : [];
    await Assignment.deleteMany({});
    for (const a of list) {
      const qty = Number(a.quantity) || 0;
      const equip = a.equipmentType;
      const base = a.base;
      if (base && equip) {
        let asset = await Asset.findOne({ name: equip, location: base });
        if (!asset) asset = await Asset.create({ name: equip, category: equip, location: base });
        await Asset.findByIdAndUpdate(asset._id, { $inc: { assigned: qty, quantity: -qty } });
        await Assignment.create({ asset: asset._id, assignee: a.assignedTo || a.person || a.assignee || "Unknown", equipmentType: equip, quantity: qty, notes: a.description, createdAt: a.date ? new Date(a.date) : undefined, updatedAt: a.date ? new Date(a.date) : undefined, performedBy: req.user?.id || null });
      }
    }
    res.json({ ok: true, inserted: list.length });
  } catch (e) {
    res.status(500).json({ message: "Failed to replace assignments" });
  }
});


