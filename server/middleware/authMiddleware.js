// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================
// BASE PROTECTION: Verify JWT Token
// ============================================
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Extract token from header
      token = req.headers.authorization.split(' ')[1];
      
      // 2. Verify token is valid and not expired
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 3. Get user from database and attach to request
      req.user = await User.findById(decoded.id).select('-password');
      
      // 4. Check if user still exists and is active
      if (!req.user || !req.user.isActive) {
        return res.status(401).json({ message: 'User account not found or inactive' });
      }
      
      next(); // User is authenticated, proceed to next middleware/controller
      
    } catch (error) {
      console.error('Auth Error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// ============================================
// ROLE GUARDS: Restrict by User Role
// ============================================

// Admin Only - Full System Access
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. Admin privileges required.',
      userRole: req.user?.role 
    });
  }
};

// Staff or Admin - POS and Order Management
const staffOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. Staff privileges required.',
      userRole: req.user?.role 
    });
  }
};

// Customer Only - Public Customer Portal
const customerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. Customer account required.',
      userRole: req.user?.role 
    });
  }
};

// ============================================
// EXPLANATION:
// ============================================
// This middleware creates a "checkpoint system":
// 
// 1. protect: Checks if user is logged in (has valid token)
// 2. adminOnly: Only allows admin role
// 3. staffOrAdmin: Allows staff and admin roles
// 4. customerOnly: Only allows customer role
//
// Usage in routes:
// router.get('/admin/users', protect, adminOnly, controller);
// router.post('/orders', protect, staffOrAdmin, controller);
// router.get('/my-orders', protect, customerOnly, controller);

module.exports = { 
  protect, 
  adminOnly, 
  staffOrAdmin, 
  customerOnly 
};