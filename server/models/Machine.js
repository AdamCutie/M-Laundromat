const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema({
  machineNumber: { 
    type: String, 
    required: true, 
    unique: true // You can't have two "Washer 1"s
  },
  type: { 
    type: String, 
    enum: ['Washer', 'Dryer'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Available', 'In Use', 'Maintenance'], 
    default: 'Available' 
  },
  // We only set these if the status is 'In Use'
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null },
  
  // OPTIONAL: Which order is currently using this?
  // We use a Reference (ObjectId) to link this to an Order document.
  currentOrderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Machine', MachineSchema);