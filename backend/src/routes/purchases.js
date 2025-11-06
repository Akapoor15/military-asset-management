const express = require("express");
const { Purchase } = require("../models/Transaction");
const Asset = require("../models/Asset");
const { optionalAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(optionalAuth);

router.post("/", requireRole(["Admin", "Logistics Officer"]), async (req, res) => {
  try {
    const { base, equipmentType, quantity, vendor, cost, notes, date } = req.body;
    let asset = null;
    if (base && equipmentType) {
      asset = await Asset.findOne({ name: equipmentType, location: base });
      if (!asset) {
        asset = await Asset.create({ name: equipmentType, category: equipmentType, location: base, status: "available", serialNumber: undefined });
      }
      // increase stock in Asset doc
      asset = await Asset.findByIdAndUpdate(asset._id, { $inc: { quantity: Number(quantity) || 0 } }, { new: true, upsert: false }).catch(() => asset);
    }

    const created = await Purchase.create({ asset: asset?._id, vendor: vendor || base, quantity: Number(quantity) || 0, cost, notes, performedBy: req.user.id, createdAt: date ? new Date(date) : undefined });
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ message: "Failed to record purchase" });
  }
});

router.get("/", async (_req, res) => {
  const items = await Purchase.find().sort({ createdAt: -1 }).populate("asset performedBy");
  res.json(items);
});

module.exports = router;


