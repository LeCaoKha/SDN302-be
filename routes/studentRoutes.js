const express = require('express');
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Staff or Admin only
router.post('/', protect, requireRole(['admin', 'staff']), createStudent);
router.get('/', protect, requireRole(['admin', 'staff']), getAllStudents);
router.get('/:id', protect, requireRole(['admin', 'staff']), getStudentById);
router.put('/:id', protect, requireRole(['admin', 'staff']), updateStudent);
router.delete('/:id', protect, requireRole(['admin']), deleteStudent);

module.exports = router;
