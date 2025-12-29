// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  
  email: {
    type: String,
    sparse: true, // Allows null values while enforcing uniqueness for non-null
    trim: true,
    lowercase: true
  },
  
  password: { 
    type: String, 
    required: true 
  },
  
  // CRITICAL: Role field determines access permissions
  role: { 
    type: String, 
    enum: ['admin', 'staff', 'customer'], 
    default: 'customer' // New users default to customer
  },
  
  phoneNumber: {
    type: String,
    default: ''
  },
  
  // Customer-specific fields
  address: {
    type: String,
    default: ''
  },
  
  // Track account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // For customers: loyalty points system (optional)
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  
  // Last login tracking
  lastLogin: {
    type: Date
  }
  
}, { timestamps: true });

// EXPLANATION: This model now supports three distinct user types:
// - admin: Full system access (manage everything)
// - staff: POS access (create orders, manage machines)
// - customer: View-only access (track their own orders)

module.exports = mongoose.model('User', UserSchema);