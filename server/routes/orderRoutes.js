// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getAllOrders, 
  getOrderStats, 
  updateOrderStatus 
} = require('../controllers/orderController');
const { protect, staffOrAdmin, adminOnly } = require('../middleware/authMiddleware');

// Staff and Admin can create and manage orders
router.post('/', protect, staffOrAdmin, createOrder);
router.get('/', protect, staffOrAdmin, getAllOrders);
router.put('/:id', protect, staffOrAdmin, updateOrderStatus);

// Only admin can see revenue stats
router.get('/stats', protect, adminOnly, getOrderStats);

module.exports = router;