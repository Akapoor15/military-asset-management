const express = require("express");
const Asset = require("../models/Asset");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(authRequired);

// Create
router.post("/", requireRole(["Admin", "Logistics Officer"]), async (req, res) => {
  try {
    const asset = await Asset.create(req.body);
    res.status(201).json(asset);
  } catch (err) {
    res.status(400).json({ message: "Failed to create asset" });
  }
});

// Read all
router.get("/", async (_req, res) => {
  const items = await Asset.find().sort({ createdAt: -1 });
  res.json(items);
});

// Read one
router.get("/:id", async (req, res) => {
  const item = await Asset.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json(item);
});

// Update
router.put("/:id", requireRole(["Admin", "Logistics Officer"]), async (req, res) => {
  const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
});

// Delete
router.delete("/:id", requireRole(["Admin"]), async (req, res) => {
  await Asset.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

module.exports = router;


