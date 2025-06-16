const express = require('express');
const router = express.Router();
const {
  createClassroom,
  getAllClassrooms,
  assignStudentToClassroom
} = require('../controllers/classroomController');

const { protect, requireRole } = require('../middleware/authMiddleware');

router.post('/', protect, requireRole(['staff', 'admin']), createClassroom);

router.get('/', protect, getAllClassrooms);

router.post('/assign', protect, requireRole(['staff', 'admin']), assignStudentToClassroom);

module.exports = router;
