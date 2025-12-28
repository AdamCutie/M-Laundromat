const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, // No two users can have the same name
    trim: true    // "  John " becomes "John" automatically
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'staff', 'customer'], // Valid roles ONLY
    default: 'customer' 
  },
  phoneNumber: {
    type: String,
    default: ''
  }
}, { timestamps: true }); // <--- This magic line adds created_at automatically

module.exports = mongoose.model('User', UserSchema);