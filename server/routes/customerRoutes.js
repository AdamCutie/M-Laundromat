// server/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  getMyOrders,
  getOrderDetails,
  getAvailableMachines,
  getProfile,
  updateProfile
} = require('../controllers/customerController');
const { protect, customerOnly } = require('../middleware/authMiddleware');

// ============================================
// PUBLIC ROUTES (No authentication needed)
// ============================================
router.post('/register', registerCustomer);

// ============================================
// PROTECTED ROUTES (Customer authentication required)
// ============================================
router.get('/my-orders', protect, customerOnly, getMyOrders);
router.get('/orders/:id', protect, customerOnly, getOrderDetails);
router.get('/machines/available', protect, customerOnly, getAvailableMachines);
router.get('/profile', protect, customerOnly, getProfile);
router.put('/profile', protect, customerOnly, updateProfile);

// ============================================
// ROUTE EXPLANATION:
// ============================================
// All routes under /api/customers will use this file
//
// Public:
// POST /api/customers/register - Anyone can register
//
// Protected (requires customer login):
// GET /api/customers/my-orders - View my orders
// GET /api/customers/orders/:id - View specific order
// GET /api/customers/machines/available - See which machines are free
// GET /api/customers/profile - Get my profile
// PUT /api/customers/profile - Update my profile

module.exports = router;