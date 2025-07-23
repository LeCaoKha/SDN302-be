const express = require('express');
const router = express.Router();
const childrenController = require('../controllers/childrenController');

router.get('/parent/:parentId', childrenController.getChildrenByParentId);

// CRUD
router.post('/', childrenController.createChild);
router.get('/', childrenController.getAllChildren);
router.get('/:id', childrenController.getChildById);
router.put('/:id', childrenController.updateChild);
router.delete('/:id', childrenController.deleteChild);

module.exports = router; 