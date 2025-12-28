const express = require('express');
const router = express.Router();
// Import the controller functions we just wrote
const { createOrder, getAllOrders , getOrderStats , updateOrderStatus } = require ('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');

// Define the endpoints
router.post('/', createOrder); // POST /api/orders -> Runs createOrder
router.get('/', getAllOrders); // GET /api/orders  -> Runs getAllOrders
router.get('/stats', getOrderStats);
router.put('/:id', protect, updateOrderStatus);

module.exports = router;