const mongoose = require('mongoose');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const Machine = require('../models/Machine'); // ✅ Added Machine Model

// ============================================
// CREATE ORDER (Staff/Admin)
// ============================================
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      customerName,
      customerPhone,
      serviceType,
      weight,
      washCount,
      dryCount,
      totalPrice,
      addOns,
      machineIds // ✅ Now accepting selected machines
    } = req.body;

    // 1. Validation
    if (!customerName || !serviceType || totalPrice === undefined) {
      throw new Error("Please fill in all required fields");
    }

    // 2. Try to find existing customer by phone
    let customerId = null;
    if (customerPhone) {
      const existingCustomer = await User.findOne({ 
        phoneNumber: customerPhone,
        role: 'customer'
      });
      if (existingCustomer) {
        customerId = existingCustomer._id;
      }
    }

    // 3. Determine Initial Status
    // If machines are selected -> 'In Progress'
    // If NO machines are selected -> 'Queued'
    const initialStatus = (machineIds && machineIds.length > 0) ? 'In Progress' : 'Pending';

    // 4. Handle Inventory Deduction
    if (addOns && addOns.length > 0) {
      for (const item of addOns) {
        const product = await Inventory.findOneAndUpdate(
          { 
            _id: item.itemId, 
            stockLevel: { $gte: item.quantity } 
          },
          { $inc: { stockLevel: -item.quantity } },
          { new: true, session }
        );

        if (!product) {
          throw new Error(`Insufficient stock for: ${item.itemName}`);
        }
      }
    }

    // 5. Create the Order
    const newOrder = await Order.create([{
      customerName,
      customerId, 
      phoneNumber: customerPhone || '',
      serviceType,
      weight,
      washCount,
      dryCount,
      totalPrice,
      addOns: addOns || [],
      status: initialStatus, // ✅ Set 'Queued' or 'In Progress'
      machineIds: machineIds || [], // ✅ Save assigned machines
      createdBy: req.user._id 
    }], { session });

    // 6. Activate Machines (Only if provided)
    if (machineIds && machineIds.length > 0) {
      const now = new Date();
      const cycleTime = 40 * 60 * 1000; // 40 minutes

      await Machine.updateMany(
        { _id: { $in: machineIds } },
        { 
          $set: { 
            status: 'In Use',
            currentOrderId: newOrder[0]._id,
            startTime: now,
            endTime: new Date(now.getTime() + cycleTime)
          } 
        },
        { session }
      );
    }

    // 7. Commit Transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(newOrder[0]);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Order Creation Failed:", error.message);
    const statusCode = error.message.includes("Insufficient stock") ? 400 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// ============================================
// GET ALL ORDERS (Admin/Staff View)
// ============================================
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'username email phoneNumber')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// GET ORDER STATS (Admin Only)
// ============================================
const getOrderStats = async (req, res) => {
  try {
    const [revenueStats, statusStats] = await Promise.all([
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: "$totalPrice" }
          }
        }
      ]),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      revenue: revenueStats[0]?.totalRevenue || 0,
      count: revenueStats[0]?.totalOrders || 0,
      avgValue: revenueStats[0]?.avgOrderValue || 0,
      breakdown: statusStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// UPDATE ORDER STATUS (Staff/Admin)
// ============================================
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const updates = { status };
    
    // Track completion time
    if (status === 'Completed' || status === 'Claimed') {
      updates.completedAt = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).populate('customerId', 'username email');

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// GET CUSTOMER'S ORDERS (Customer View)
// ============================================
const getCustomerOrders = async (req, res) => {
  try {
    // This route is called by customers to see their own orders
    const orders = await Order.find({ 
      customerId: req.user._id 
    })
    .sort({ createdAt: -1 })
    .select('-createdBy'); // Don't expose which staff created it

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// EXPLANATION:
// ============================================
// Key Features:
// 1. Auto-links orders to customer accounts when phone number matches
// 2. Tracks which staff member created each order
// 3. Separate endpoints for staff view (all orders) vs customer view (my orders)
// 4. Maintains transaction safety for inventory deduction
// 5. Populates related data (customer info, staff info) for better reporting

module.exports = {
  createOrder,
  getAllOrders,
  getOrderStats,
  updateOrderStatus,
  getCustomerOrders
};