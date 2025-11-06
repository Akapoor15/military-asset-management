const express = require("express");
const Asset = require("../models/Asset");
const { Assignment, Purchase, Transfer } = require("../models/Transaction");
const { authRequired } = require("../middleware/auth");

const router = express.Router();
router.use(authRequired);

router.get("/summary", async (_req, res) => {
  const [assetCount, assignedCount, purchases, transfers, assignments] = await Promise.all([
    Asset.countDocuments(),
    Asset.countDocuments({ status: "assigned" }),
    Purchase.countDocuments(),
    Transfer.countDocuments(),
    Assignment.countDocuments(),
  ]);
  res.json({ assetCount, assignedCount, purchases, transfers, assignments });
});

module.exports = router;


