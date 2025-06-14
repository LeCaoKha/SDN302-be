const express = require("express");
const router = express.Router();
const {
  createClassroom,
  getAllClassrooms,
  assignStudentToClassroom,
} = require("../controllers/classroomController");

const { protect, requireRole } = require("../middleware/authMiddleware");

// Create classroom
router.post("/", protect, requireRole(["staff", "admin"]), createClassroom);

// Get all classrooms
router.get("/", protect, getAllClassrooms);

// Assign student to class
router.post(
  "/assign",
  protect,
  requireRole(["staff", "admin"]),
  assignStudentToClassroom
);

module.exports = router;
