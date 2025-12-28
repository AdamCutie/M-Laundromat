const express = require('express');
const router = express.Router();
const { getInventory , addInventoryItem , updateInventoryItem } = require('../controllers/inventoryController');

const { protect } = require('../middleware/authMiddleware');

router.get('/', getInventory);
router.post('/', protect, addInventoryItem);
router.patch('/:id', protect, updateInventoryItem);

module.exports = router;