const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    serialNumber: { type: String, unique: true, sparse: true },
    status: { type: String, enum: ["available", "assigned", "maintenance"], default: "available" },
    location: { type: String },
    // Inventory fields used by dashboard
    quantity: { type: Number, default: 0 },
    assigned: { type: Number, default: 0 },
    expended: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Asset", AssetSchema);


