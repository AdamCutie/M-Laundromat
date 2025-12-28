const express = require('express');
const router = express.Router();
const { getInventory, addInventoryItem } = require('../controllers/inventoryController');

router.get('/', getInventory);
router.post('/', addInventoryItem);

module.exports = router;