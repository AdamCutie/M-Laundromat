// server/scripts/migrate.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// FIX: Load .env from the correct location (server folder)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../models/User');
const Order = require('../models/Order');

const migrate = async () => {
  try {
    console.log('🔄 Starting database migration...\n');
    
    // Debug: Check if MONGO_URI is loaded
    if (!process.env.MONGO_URI) {
      console.error('❌ ERROR: MONGO_URI not found in environment variables!');
      console.error('📁 Looking for .env file at:', path.join(__dirname, '../.env'));
      console.error('\n💡 Make sure you have a .env file in the server folder with:');
      console.error('   MONGO_URI=mongodb://localhost:27017/m_laundromat');
      console.error('   JWT_SECRET=your_secret_key\n');
      process.exit(1);
    }

    console.log('✅ Found MONGO_URI:', process.env.MONGO_URI.replace(/\/\/.*@/, '//*****@')); // Hide password if any
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // ============================================
    // STEP 1: Update existing users
    // ============================================
    console.log('📝 Step 1: Updating user roles...');
    
    const users = await User.find({});
    console.log(`   Found ${users.length} existing users`);
    
    for (const user of users) {
      if (!user.role) {
        user.role = 'customer';
        await user.save();
        console.log(`   ✓ Set ${user.username} as customer`);
      }
    }
    
    console.log('   ✅ User roles updated\n');

    // ============================================
    // STEP 2: Check for admin account (Verification Only)
    // ============================================
    console.log('📝 Step 2: Checking for admin account...');
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('   ✅ Admin account found.');
      console.log(`   👤 Admin username: ${adminExists.username}\n`);
    } else {
      console.log('   ⚠️  No admin account found.');
      console.log('       To create one, use the registration page or add manually to DB.\n');
    }

    // ============================================
    // STEP 3: Update existing orders (optional)
    // ============================================
    console.log('📝 Step 3: Updating order schema...');
    
    const orders = await Order.find({});
    console.log(`   Found ${orders.length} existing orders`);
    
    await Order.updateMany(
      { customerId: { $exists: false } },
      { $set: { customerId: null } }
    );
    
    await Order.updateMany(
      { createdBy: { $exists: false } },
      { $set: { createdBy: null } }
    );
    
    console.log('   ✅ Order schema updated\n');

    // ============================================
    // STEP 4: Add new fields to users (if missing)
    // ============================================
    console.log('📝 Step 4: Adding new user fields...');
    
    await User.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    
    await User.updateMany(
      { loyaltyPoints: { $exists: false } },
      { $set: { loyaltyPoints: 0 } }
    );
    
    console.log('   ✅ User fields updated\n');

    // ============================================
    // MIGRATION COMPLETE
    // ============================================
    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users updated: ${users.length}`);
    console.log(`   - Orders updated: ${orders.length}`);
    console.log(`   - Admin created: ${!adminExists ? 'Yes' : 'Already existed'}`);
    console.log('\n🎉 Your database is ready for the new role-based system!\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrate();