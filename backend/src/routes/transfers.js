const express = require("express");
const { Transfer } = require("../models/Transaction");
const Asset = require("../models/Asset");
const { optionalAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(optionalAuth);

router.post("/", requireRole(["Admin", "Base Commander", "Logistics Officer"]), async (req, res) => {
  try {
    const { fromLocation: fromBase, toLocation: toBase, equipmentType, quantity, notes, date } = req.body;
    if (!fromBase || !toBase || !equipmentType) return res.status(400).json({ message: "Missing fields" });
    const qty = Number(quantity) || 0;
    let fromAsset = await Asset.findOne({ name: equipmentType, location: fromBase });
    if (!fromAsset) return res.status(400).json({ message: "Source asset not found" });
    await Asset.findByIdAndUpdate(fromAsset._id, { $inc: { quantity: -qty } });
    let toAsset = await Asset.findOne({ name: equipmentType, location: toBase });
    if (!toAsset) {
      toAsset = await Asset.create({ name: equipmentType, category: equipmentType, location: toBase, status: "available" });
    }
    await Asset.findByIdAndUpdate(toAsset._id, { $inc: { quantity: qty } });
    const created = await Transfer.create({ asset: toAsset._id, fromLocation: fromBase, toLocation: toBase, notes, performedBy: req.user.id, createdAt: date ? new Date(date) : undefined });
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ message: "Failed to create transfer" });
  }
});

router.get("/", async (_req, res) => {
  const items = await Transfer.find().sort({ createdAt: -1 }).populate("asset performedBy");
  res.json(items);
});

module.exports = router;


