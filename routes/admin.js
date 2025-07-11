const express = require("express");
const { getAllUsers, getAllStaff, getStaffById, banStaff, unbanStaff, getDashboardData } = require("../controllers/adminController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Áp dụng middleware cho tất cả các route
router.use(protect);
router.use(requireRole(["admin"]));

router.get("/user", getAllUsers);
// Lấy tất cả staff
router.get("/staff", getAllStaff);
// Lấy staff theo id
router.get("/staff/:id", getStaffById);
// Ban staff
router.patch("/staff/:id/ban", banStaff);
// Bỏ ban staff
router.patch("/staff/:id/unban", unbanStaff);
// Lấy dữ liệu dashboard
router.get("/dashboard", getDashboardData);

module.exports = router;
