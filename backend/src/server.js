const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectToDatabase } = require("./utils/db");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "military-asset-management-backend" });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/assets", require("./routes/assets"));
app.use("/api/assignments", require("./routes/assignments"));
app.use("/api/purchases", require("./routes/purchases"));
app.use("/api/transfers", require("./routes/transfers"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/admin", require("./routes/admin"));

// Start server after DB connects
const PORT = process.env.PORT || 5050;
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

module.exports = app;


