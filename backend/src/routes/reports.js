const express = require("express");
const router = express.Router();
const {
  getReports,
  deleteReports,
  getReportById,
  deleteReportById,
} = require("../controllers/reportController");
const { requireAuth, authErrorHandler } = require("../middleware/auth");

router.get("/", requireAuth, getReports, authErrorHandler);
router.delete("/", requireAuth, deleteReports, authErrorHandler);
router.get("/:id", requireAuth, getReportById, authErrorHandler);
router.delete("/:id", requireAuth, deleteReportById, authErrorHandler);

module.exports = router;
