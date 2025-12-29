// server/controllers/customerController.js
const User = require('../models/User');
const Order = require('../models/Order');
const Machine = require('../models/Machine');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ============================================
// CUSTOMER REGISTRATION
// ============================================
const registerCustomer = async (req, res) => {
  try {
    const { username, email, password, phoneNumber, address } = req.body;

    // 1. Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ username }, { email: email || null }] 
    });
    
    if (userExists) {
      return res.status(400).json({ message: 'Username or email already taken' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create customer account
    const customer = await User.create({
      username,
      email: email || undefined,
      password: hashedPassword,
      phoneNumber: phoneNumber || '',
      address: address || '',
      role: 'customer' // Force role to customer
    });

    // 5. Generate token and return user data
    const token = generateToken(customer._id, customer.role);

    res.status(201).json({
      _id: customer._id,
      username: customer.username,
      email: customer.email,
      role: customer.role,
      token
    });

  } catch (error) {
    console.error('Customer Registration Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// GET MY ORDERS (Customer View)
// ============================================
const getMyOrders = async (req, res) => {
  try {
    // Find all orders for this customer
    // Note: You'll need to add customerId field to Order model
    const orders = await Order.find({ 
      customerId: req.user._id 
    })
    .sort({ createdAt: -1 })
    .select('-__v'); // Exclude version key

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// GET SINGLE ORDER DETAILS
// ============================================
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customerId: req.user._id // Security: Only show orders that belong to this customer
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// GET AVAILABLE MACHINES (Public Info)
// ============================================
const getAvailableMachines = async (req, res) => {
  try {
    const machines = await Machine.find({ status: 'Available' })
      .select('machineNumber type status');
    
    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// GET CUSTOMER PROFILE
// ============================================
const getProfile = async (req, res) => {
  try {
    const customer = await User.findById(req.user._id)
      .select('-password -__v');
    
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// UPDATE CUSTOMER PROFILE
// ============================================
const updateProfile = async (req, res) => {
  try {
    const { phoneNumber, address, email } = req.body;
    
    const updates = {};
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
    if (address !== undefined) updates.address = address;
    if (email !== undefined) updates.email = email;

    const customer = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password');

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// HELPER: Generate JWT Token
// ============================================
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { 
    expiresIn: '30d' 
  });
};

// ============================================
// EXPLANATION:
// ============================================
// This controller handles all customer-facing operations:
// - Registration (public)
// - View their own orders (protected)
// - Track order status (protected)
// - View available machines (protected)
// - Manage profile (protected)
//
// Security: All operations are scoped to the logged-in customer
// using req.user._id from the JWT token

module.exports = {
  registerCustomer,
  getMyOrders,
  getOrderDetails,
  getAvailableMachines,
  getProfile,
  updateProfile
};