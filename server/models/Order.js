// server/models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // ============================================
  // CUSTOMER INFO
  // ============================================
  customerName: { 
    type: String, 
    required: true 
  },
  
  // NEW: Link to customer account (if they have one)
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Can be null for walk-in customers without accounts
  },
  
  phoneNumber: { 
    type: String 
  },

  // ============================================
  // SERVICE DETAILS
  // ============================================
  serviceType: { 
    type: String, 
    enum: ['Full-Service', 'Self-Service'], 
    required: true 
  },
  
  // For Full-Service (charged by weight)
  weight: { 
    type: Number, 
    default: 0 
  }, 
  
  // For Self-Service (charged by cycle count)
  washCount: { 
    type: Number, 
    default: 0 
  },
  dryCount: { 
    type: Number, 
    default: 0 
  },

  // ============================================
  // RELATIONS
  // ============================================
  
  // Which machines are being used
  machines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine'
  }],

  // Products purchased (detergent, softener, etc.)
  addOns: [{
    itemId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Inventory' 
    },
    itemName: String,
    quantity: Number,
    price: Number
  }],

  // ============================================
  // FINANCIALS
  // ============================================
  totalPrice: { 
    type: Number, 
    required: true 
  },
  
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid'], 
    default: 'Pending' 
  },

  // ============================================
  // ORDER STATUS TRACKING
  // ============================================
  status: { 
    type: String, 
    enum: [
      'Pending',      // Just created
      'In Progress',  // Being washed/dried
      'Ready',        // Done, ready for pickup
      'Completed',    // Customer picked up
      'Claimed',      // Alternative to Completed
      'Cancelled'     // Order cancelled
    ],
    default: 'Pending'
  },
  
  // ============================================
  // TRACKING TIMESTAMPS
  // ============================================
  completedAt: {
    type: Date
  },
  
  claimedAt: {
    type: Date
  },
  
  // Staff who created this order
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, { timestamps: true }); // Auto-adds createdAt and updatedAt

// ============================================
// INDEXES for faster queries
// ============================================
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

// ============================================
// EXPLANATION:
// ============================================
// Key Changes:
// 1. Added customerId field to link orders to customer accounts
// 2. customerId can be null for walk-in customers
// 3. Added createdBy to track which staff member created the order
// 4. Added indexes for faster customer order lookups
//
// This allows:
// - Customers to view their order history
// - Staff to create orders for both registered and walk-in customers
// - System to track which staff handles which orders

module.exports = mongoose.model('Order', OrderSchema);