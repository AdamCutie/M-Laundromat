const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  staffId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  staffName: { type: String, required: true },
  date: { type: String, required: true }, // Format: "YYYY-MM-DD"
  timeIn: { type: Date, required: true },
  timeOut: { type: Date }, // Initially empty
  workHours: { type: Number, default: 0 }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);