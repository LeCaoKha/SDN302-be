const express = require("express");
const {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher
} = require("../controllers/teacherController");

const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin and staff routes
router.post("/", protect, requireRole(["admin", "staff"]), createTeacher);
router.get("/", protect, requireRole(["admin", "staff"]), getAllTeachers);
router.get("/:id", protect, requireRole(["admin", "staff"]), getTeacherById);
router.put("/:id", protect, requireRole(["admin", "staff"]), updateTeacher);
router.delete("/:id", protect, requireRole(["admin", "staff"]), deleteTeacher);

module.exports = router;