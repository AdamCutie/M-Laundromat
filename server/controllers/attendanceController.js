const Attendance = require('../models/Attendance');

// @desc    Clock In
// @route   POST /api/attendance/clock-in
const clockIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const userName = req.user.username;
    
    // Get today's date string (e.g., "2023-10-30")
    const today = new Date().toISOString().split('T')[0];

    // 1. Check if already clocked in
    const existingLog = await Attendance.findOne({ staffId: userId, date: today });
    if (existingLog) {
      return res.status(400).json({ message: "You have already clocked in today." });
    }

    // 2. Create Log
    const log = await Attendance.create({
      staffId: userId,
      staffName: userName,
      date: today,
      timeIn: new Date()
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clock Out
// @route   POST /api/attendance/clock-out
const clockOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    // 1. Find today's open log
    const log = await Attendance.findOne({ staffId: userId, date: today });

    if (!log) {
      return res.status(400).json({ message: "You haven't clocked in yet!" });
    }
    if (log.timeOut) {
      return res.status(400).json({ message: "You are already clocked out." });
    }

    // 2. Update Log
    log.timeOut = new Date();
    
    // Calculate hours (TimeOut - TimeIn = Milliseconds)
    const diff = log.timeOut - log.timeIn;
    // Convert ms to hours (ms / 1000 / 60 / 60)
    log.workHours = (diff / (1000 * 60 * 60)).toFixed(2);

    await log.save();
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get My Status (Am I clocked in?)
// @route   GET /api/attendance/status
const getStatus = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const log = await Attendance.findOne({ staffId: req.user._id, date: today });
    
    if (!log) return res.json({ status: 'Not Started' });
    if (log.timeOut) return res.json({ status: 'Clocked Out', data: log });
    return res.json({ status: 'Clocked In', data: log });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { clockIn, clockOut, getStatus };