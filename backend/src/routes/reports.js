const express = require("express");
const router = express.Router();
const {
  getReports,
  deleteReports,
  getReportById,
  deleteReportById,
  updateReportById,
} = require("../controllers/reportController");
const { requireAuth, authErrorHandler } = require("../middleware/auth");

router.get("/", requireAuth, getReports, authErrorHandler);
router.delete("/", requireAuth, deleteReports, authErrorHandler);
router.get("/:id", requireAuth, getReportById, authErrorHandler);
router.patch("/:id", requireAuth, updateReportById, authErrorHandler);
router.delete("/:id", requireAuth, deleteReportById, authErrorHandler);

module.exports = router;
