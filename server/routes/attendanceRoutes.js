const express = require('express');
const router = express.Router();
const { clockIn, clockOut, getStatus } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

// All these routes need to be protected (Logged in users only)
router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);
router.get('/status', protect, getStatus);

module.exports = router;