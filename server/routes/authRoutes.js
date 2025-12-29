const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);

// ⚠️ TEMPORARY: Remove after creating admin!
router.post('/create-admin', async (req, res) => {
  const User = require('../models/User');
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  
  try {
    const { username, password } = req.body;
    
    // Check if user exists
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create admin
    const admin = await User.create({
      username,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      phoneNumber: '',
      address: '',
      loyaltyPoints: 0
    });
    
    // Generate token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      _id: admin._id,
      username: admin.username,
      role: admin.role,
      token
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;