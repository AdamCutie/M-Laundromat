const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Normalize phone numbers to digits only (max 11)
const normalizePhone = (value) => {
  if (!value) return '';
  return String(value).replace(/\D/g, '').slice(0, 11);
};

// Strict validation: only 11-digit numbers allowed when provided
const isValidPhone = (value) => {
  if (!value) return true;
  return /^\d{11}$/.test(String(value));
};

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user (Admin, Staff, or Customer)
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, username, email, password, role, phoneNumber } = req.body;
    if (!isValidPhone(phoneNumber)) {
      return res.status(400).json({ message: 'Phone number must be 11 digits (numbers only).' });
    }
    
    // Normalize username (frontend might send 'name' or 'username')
    const finalUsername = username || name;
    const normalizedPhone = normalizePhone(phoneNumber);

    // 1. Validation
    if (!finalUsername || !email || !password) {
      return res.status(400).json({ message: 'Please add all required fields (username, email, password)' });
    }

    // 2. Check if user exists (by Email)
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user
    const user = await User.create({
      username: finalUsername,
      email: email, 
      password: hashedPassword,
      role: role || 'staff', // Default to staff if not provided
      phoneNumber: normalizedPhone || '' // ✅ Added this line to actually save the phone number
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber, // Return this so frontend can update state immediately
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,           // Added
        role: user.role,
        phoneNumber: user.phoneNumber, // ✅ CRITICAL FIX
        address: user.address,       // Added
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getAllUsers, deleteUser };
