const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // 1. CUSTOMER INFO
  customerName: { type: String, required: true },
  phoneNumber: { type: String }, // Optional, for SMS later

  // 2. SERVICE DETAILS
  serviceType: { 
    type: String, 
    enum: ['Full-Service', 'Self-Service'], 
    required: true 
  },
  
  // For Full-Service (We charge by Weight)
  weight: { type: Number, default: 0 }, 
  
  // For Self-Service (We charge by Cycle Count)
  washCount: { type: Number, default: 0 },
  dryCount: { type: Number, default: 0 },

  // 3. RELATIONS (Linking to other Models)
  
  // Which Machines are used? (Array of IDs)
  // This lets us "lock" machines so others can't use them
  machines: [{
    type: mongoose.Schema.Types.ObjectId, // This stores a Machine's ID
    ref: 'Machine' // "ref" tells Mongoose to look in the 'Machine' collection
  }],

  // Which Inventory items were bought? (e.g., Detergent, Softener)
  addOns: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
    itemName: String, // We save the name too, in case the product is deleted later
    quantity: Number,
    price: Number     // Save price AT TIME OF SALE (because prices change!)
  }],

  // 4. FINANCIALS
  totalPrice: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid'], 
    default: 'Pending' 
  },

  // 5. ORDER STATUS
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Ready', 'Completed', 'Claimed', 'Cancelled'],
    default: 'Pending'
  }
  
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);