const express = require('express');
const parentController = require('../controllers/parentController');

const router = express.Router();

const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/search-by-name', protect, requireRole(['admin', 'staff']), parentController.getParentsByName);

router.get('/me', protect, requireRole('parent'), parentController.getMe);
router.put('/me', protect, requireRole('parent'), parentController.updateMe);

router.post('/', protect, requireRole(['admin', 'staff']), parentController.createParent);
router.get('/', protect, requireRole('admin'), parentController.getParents);
router.get('/:id', protect, requireRole('admin'), parentController.getParentById);
router.put('/:id', protect, requireRole('admin'), parentController.updateParent);
router.delete('/:id', protect, requireRole('admin'), parentController.deleteParent);

module.exports = router;