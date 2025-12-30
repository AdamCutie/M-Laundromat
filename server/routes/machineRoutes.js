// server/routes/machineRoutes.js
const express = require('express');
const router = express.Router();
const { getMachines, updateMachineStatus, addMachine, deleteMachine} = require('../controllers/machineController');
const { protect, staffOrAdmin } = require('../middleware/authMiddleware');

// Staff can view and operate machines
router.get('/', protect, staffOrAdmin, getMachines);
router.post('/', protect, staffOrAdmin, addMachine);
router.put('/:id', protect, staffOrAdmin, updateMachineStatus);
router.delete('/:id', protect, staffOrAdmin, deleteMachine);

module.exports = router;