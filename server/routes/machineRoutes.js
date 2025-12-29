// server/routes/machineRoutes.js
const express = require('express');
const router = express.Router();
const { getMachines, updateMachineStatus } = require('../controllers/machineController');
const { protect, staffOrAdmin } = require('../middleware/authMiddleware');

// Staff can view and operate machines
router.get('/', protect, staffOrAdmin, getMachines);
router.put('/:id', protect, staffOrAdmin, updateMachineStatus);

module.exports = router;