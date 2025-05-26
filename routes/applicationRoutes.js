const express = require('express');
const {
  submitApplication,
  getMyApplications,
    getAllApplications,
    updateApplicationStatus,
    enrollFromApplication
} = require('../controllers/applicationController');

const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Only parents can submit or view their own applications
router.post('/', protect, requireRole(['parent']), submitApplication);
router.get('/', protect, requireRole(['parent']), getMyApplications);
router.get('/all', protect, requireRole(['staff', 'admin']), getAllApplications);
router.patch('/:id/status', protect, requireRole(['staff', 'admin']), updateApplicationStatus);
router.post('/:id/enroll', protect, requireRole(['staff', 'admin']), enrollFromApplication);


module.exports = router;
