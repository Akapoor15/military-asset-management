const mongoose = require("mongoose");

const BaseTxn = {
  asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  notes: { type: String },
};

const AssignmentSchema = new mongoose.Schema(
  {
    ...BaseTxn,
    assignee: { type: String, required: true }, // personnel
    equipmentType: { type: String },
    quantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const PurchaseSchema = new mongoose.Schema(
  {
    ...BaseTxn,
    vendor: { type: String },
    quantity: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const TransferSchema = new mongoose.Schema(
  {
    ...BaseTxn,
    fromLocation: { type: String, required: true },
    toLocation: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = {
  Assignment: mongoose.model("Assignment", AssignmentSchema),
  Purchase: mongoose.model("Purchase", PurchaseSchema),
  Transfer: mongoose.model("Transfer", TransferSchema),
};


