const express = require("express");
const { Assignment } = require("../models/Transaction");
const Asset = require("../models/Asset");
const { optionalAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(optionalAuth);

router.post("/", requireRole(["Admin", "Base Commander", "Logistics Officer"]), async (req, res) => {
  try {
    const { base, equipmentType, assignee, quantity, notes, date } = req.body;
    let asset = null;
    if (base && equipmentType) {
      asset = await Asset.findOne({ name: equipmentType, location: base });
      if (!asset) return res.status(400).json({ message: "Asset not found for base/type" });
      await Asset.findByIdAndUpdate(asset._id, { $inc: { assigned: Number(quantity) || 0, quantity: -(Number(quantity) || 0) } });
    }
    const created = await Assignment.create({ asset: asset?._id, assignee, equipmentType, quantity: Number(quantity) || 0, notes, performedBy: req.user.id, createdAt: date ? new Date(date) : undefined });
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ message: "Failed to create assignment" });
  }
});

router.get("/", async (_req, res) => {
  const items = await Assignment.find().sort({ createdAt: -1 }).populate("asset performedBy");
  res.json(items);
});

module.exports = router;


