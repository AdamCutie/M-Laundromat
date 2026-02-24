// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import Route Files
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingRoutes = require('./routes/settingRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const machineRoutes = require('./routes/machineRoutes');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const customerRoutes = require('./routes/customerRoutes'); 
const chatRoutes = require('./routes/chatRoutes');

// Configuration
dotenv.config();
connectDB();

// Initialize App
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api/chat', chatRoutes);

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
// API HEALTH ROUTE
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    message: 'M-Laundromat API',
    version: '2.0',
    roles: ['admin', 'staff', 'customer']
  });
});

// ✅ 2. SERVE REACT FRONTEND (Modified for Hybrid Hosting)
const clientBuildPath = path.join(__dirname, '../client/dist');
const fs = require('fs');

// Only try to serve static files if the folder actually exists
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
  console.log("📁 Serving static frontend files from /client/dist");
} else {
  console.log("🌐 Running in API-only mode (No local frontend found)");
  
  // Basic landing page for the API root
  app.get('/', (req, res) => {
    res.json({ message: "M-Laundromat API is running. Use /api for requests." });
  });
}

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
