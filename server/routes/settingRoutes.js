// server/routes/settingRoutes.js
const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, staffOrAdmin, adminOnly } = require('../middleware/authMiddleware');

// Staff can view prices, only admin can change them
router.get('/', protect, staffOrAdmin, getSettings);
router.put('/', protect, adminOnly, updateSettings);

module.exports = router;