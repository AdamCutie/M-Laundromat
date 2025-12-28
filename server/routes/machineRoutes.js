const express = require('express');
const router = express.Router();
const { getMachines, updateMachineStatus } = require('../controllers/machineController');

router.get('/', getMachines);
// Note: We use /:id because we need to know WHICH machine to update
router.put('/:id', updateMachineStatus); 

module.exports = router;