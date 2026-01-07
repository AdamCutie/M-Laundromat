const User = require('../models/User');
const Order = require('../models/Order');
const Machine = require('../models/Machine');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ============================================
// HELPER: Generate JWT Token
// ============================================
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { 
    expiresIn: '30d' 
  });
};

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

    // 5. Generate token
    const token = generateToken(customer._id, customer.role);

    res.status(201).json({
      _id: customer._id,
      username: customer.username,
      email: customer.email,
      role: customer.role,
      phoneNumber: customer.phoneNumber,
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
    .sort({ createdAt: -1 }) // Newest first
    .select('-__v'); 

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
    
    if (!customer) {
      return res.status(404).json({ message: 'User not found' });
    }

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
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Track if phone number is changing
    const oldPhone = user.phoneNumber;
    const newPhone = req.body.phoneNumber;
    // Check if newPhone is provided and is actually different
    const isPhoneUpdated = newPhone && (newPhone !== oldPhone);

    // Update fields
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.phoneNumber = newPhone || user.phoneNumber;
    user.address = req.body.address || user.address;

    // Handle password update if provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    // ✅ CRITICAL FIX: Retroactively link past orders
    // If the user updated their phone number, find all "Guest" orders 
    // with that number and assign them to this account.
    if (isPhoneUpdated) {
      await Order.updateMany(
        { phoneNumber: updatedUser.phoneNumber, customerId: null },
        { $set: { customerId: updatedUser._id } }
      );
    }

    // Return updated info + token (to keep frontend state consistent)
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      role: updatedUser.role,
      token: generateToken(updatedUser._id, updatedUser.role),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerCustomer,
  getMyOrders,
  getOrderDetails,
  getAvailableMachines,
  getProfile,
  updateProfile
};