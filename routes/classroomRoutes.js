const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Tạo classroom
router.post('/', protect, requireRole(['admin', 'staff']), classroomController.createClassroom);
// Lấy tất cả classroom
router.get('/', classroomController.getAllClassrooms);
// Lấy classroom theo id
router.get('/:id', classroomController.getClassroomById);
// Cập nhật classroom
router.put('/:id', protect, requireRole(['admin', 'staff']), classroomController.updateClassroom);
// Xóa classroom
router.delete('/:id', protect, requireRole(['admin', 'staff']), classroomController.deleteClassroom);
// Thêm student vào classroom
router.post('/:classroomId/add-student', protect, requireRole(['admin', 'staff']), classroomController.addStudentToClassroom);
// Thêm teacher vào classroom
router.post('/:classroomId/add-teacher', protect, requireRole(['admin', 'staff']), classroomController.addTeacherToClassroom);
// Xóa student khỏi classroom
router.post('/:classroomId/remove-student', protect, requireRole(['admin', 'staff']), classroomController.removeStudentFromClassroom);
// Xóa teacher khỏi classroom
router.post('/:classroomId/remove-teacher', protect, requireRole(['admin', 'staff']), classroomController.removeTeacherFromClassroom);

module.exports = router;
