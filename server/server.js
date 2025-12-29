// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Route Files
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingRoutes = require('./routes/settingRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const machineRoutes = require('./routes/machineRoutes');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const customerRoutes = require('./routes/customerRoutes'); // NEW

// Configuration
dotenv.config();
connectDB();

// Initialize App
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ============================================
// API ROUTES
// ============================================

// Public Routes (No auth required)
app.use('/api/auth', authRoutes); // Login for all users
app.use('/api/customers', customerRoutes); // Customer registration & portal

// Protected Routes (Auth required, role-specific)
app.use('/api/users', userRoutes); // Admin only
app.use('/api/attendance', attendanceRoutes); // Staff only
app.use('/api/orders', orderRoutes); // Staff/Admin
app.use('/api/settings', settingRoutes); // View: Staff, Edit: Admin
app.use('/api/inventory', inventoryRoutes); // View: Staff, Edit: Admin
app.use('/api/machines', machineRoutes); // Staff/Admin

// ============================================
// TEST ROUTE
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    message: 'M-Laundromat API',
    version: '2.0',
    roles: ['admin', 'staff', 'customer']
  });
});

// ============================================
// ERROR HANDLER (Optional but recommended)
// ============================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
});