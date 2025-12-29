// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getAllUsers, registerUser, deleteUser } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Admin only routes for managing staff
router.get('/', protect, adminOnly, getAllUsers);
router.post('/', protect, adminOnly, registerUser);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;