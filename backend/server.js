require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

// --- MIDDLEWARE ---
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "1mb" }));

// Rate Limiting (30 req/min per IP)
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
}));

// --- HEALTH CHECK (Required for Render/Railway) ---
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Request Timeout Middleware (30s)
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(408).json({ error: "Request timed out" });
    }
  });
  next();
});

// --- ROUTES ---
app.use("/api/analyze",      require("./src/routes/analyze"));
app.use("/api/generate-kit", require("./src/routes/generateKit"));
app.use("/api/reports",      require("./src/routes/reports"));
app.use("/api/report",       require("./src/routes/reports"));

// Legacy redirect
app.post("/api/kit", (req, res) => res.redirect(307, "/api/generate-kit"));

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  if (err.message === "Unauthenticated") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  console.error("SERVER ERROR:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// --- SERVER BOOT ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
