const express = require('express');
const router = express.Router();
const { getAllUsers, registerUser, deleteUser } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

// These routes match /api/users
router.get('/', protect, admin, getAllUsers);
router.post('/', protect, admin, registerUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;