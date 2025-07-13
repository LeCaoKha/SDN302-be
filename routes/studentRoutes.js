const express = require("express");
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentsByParentId,
  getStudentsByName,
  getStudentsByClass
} = require("../controllers/studentController");

const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get('/search-by-name', protect, requireRole(['admin', 'staff']), getStudentsByName);

router.get('/search-by-class', protect, requireRole(['admin', 'staff']), getStudentsByClass);

router.get('/parent/:parentId', protect, requireRole(['admin', 'staff', 'parent']), getStudentsByParentId);

// Staff or Admin only
router.post("/", protect, requireRole(["admin", "staff", "parent"]), createStudent);
router.get("/", protect, requireRole(["admin", "staff"]), getAllStudents);
router.get("/:id", protect, requireRole(["admin", "staff", "parent"]), getStudentById);
router.put("/:id", protect, requireRole(["admin", "staff"]), updateStudent);
router.delete("/:id", protect, requireRole(["admin"]), deleteStudent);

module.exports = router;
