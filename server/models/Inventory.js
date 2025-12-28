const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  itemName: { 
    type: String, 
    required: true, 
    unique: true // Correct! We don't want two items named "Ariel"
  },
  stockLevel: { 
    type: Number, 
    default: 0 
  },
  unitPrice: { 
    type: Number, 
    required: true 
    // Removed unique: true (Multiple items can have the same price)
  },
  // Added costPrice so you can calculate profit later (Sales - Cost)
  costPrice: { 
    type: Number, 
    default: 0 
  },
  lowStockThreshold: { 
    type: Number, 
    default: 10 // Changed from 'true' to a number
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model('Inventory', InventorySchema);