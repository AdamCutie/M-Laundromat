// server/routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getInventory, 
  addInventoryItem, 
  updateInventoryItem 
} = require('../controllers/inventoryController');
const { protect, staffOrAdmin, adminOnly } = require('../middleware/authMiddleware');

// Staff can view inventory, only admin can modify
router.get('/', protect, staffOrAdmin, getInventory);
router.post('/', protect, adminOnly, addInventoryItem);
router.patch('/:id', protect, adminOnly, updateInventoryItem);

module.exports = router;