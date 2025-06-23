const express = require("express");
const {
  submitApplication,
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
  enrollFromApplication,
  getApplicationById,
} = require("../controllers/applicationController");

const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Only parents can submit or view their own applications
router.post("/", protect, requireRole(["parent"]), submitApplication);
router.get("/", protect, requireRole(["parent"]), getMyApplications);
router.get(
  "/all",
  protect,
  requireRole(["staff", "admin"]),
  getAllApplications
);
router.get(
  "/:id",
  protect,
  requireRole(["parent", "staff", "admin"]),
  getApplicationById
);
router.patch(
  "/:id/status",
  protect,
  requireRole(["staff", "admin"]),
  updateApplicationStatus
);
router.post(
  "/:id/enroll",
  protect,
  requireRole(["staff", "admin"]),
  enrollFromApplication
);

module.exports = router;
