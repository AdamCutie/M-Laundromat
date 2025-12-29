// server/routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { clockIn, clockOut, getStatus } = require('../controllers/attendanceController');
const { protect, staffOrAdmin } = require('../middleware/authMiddleware');

// Staff only - customers don't clock in
router.post('/clock-in', protect, staffOrAdmin, clockIn);
router.post('/clock-out', protect, staffOrAdmin, clockOut);
router.get('/status', protect, staffOrAdmin, getStatus);

module.exports = router;