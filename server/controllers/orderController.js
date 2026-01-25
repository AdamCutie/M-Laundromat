const mongoose = require('mongoose');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const Machine = require('../models/Machine'); 

// ============================================
// CREATE ORDER
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
      addOns = [],     // ✅ Sanitization: Default to empty array
      machineIds = []  // ✅ Sanitization: Default to empty array
    } = req.body;

    // 1. Validation
    if (!customerName || !serviceType || totalPrice === undefined) {
      throw new Error("Please fill in all required fields");
    }

    // 2. Link Customer
    let customerId = null;
    if (customerPhone) {
      const existingCustomer = await User.findOne({ phoneNumber: customerPhone, role: 'customer' }).session(session);
      if (existingCustomer) customerId = existingCustomer._id;
    }

    // 3. Machine Availability Check (Prevent Double Booking)
    if (machineIds.length > 0) {
      const availableCount = await Machine.countDocuments({
        _id: { $in: machineIds },
        status: 'Available'
      }).session(session);

      if (availableCount !== machineIds.length) {
        throw new Error("One or more selected machines are no longer available.");
      }
    }

    // 4. Atomic Inventory Deduction
    for (const item of addOns) {
      const product = await Inventory.findOneAndUpdate(
        { _id: item.itemId, stockLevel: { $gte: item.quantity } }, // Atomic Check
        { $inc: { stockLevel: -item.quantity } }, // Atomic Update
        { new: true, session }
      );

      if (!product) throw new Error(`Insufficient stock for: ${item.itemName}`);
    }

    // 5. Create Order
    const initialStatus = machineIds.length > 0 ? 'In Progress' : 'Pending';
    const [newOrder] = await Order.create([{
      customerName, customerId, phoneNumber: customerPhone || '',
      serviceType, weight, washCount, dryCount, totalPrice,
      addOns, status: initialStatus, machineIds, 
      createdBy: req.user._id 
    }], { session });

    // 6. Activate Machines
    if (machineIds.length > 0) {
      const now = new Date();
      const cycleTime = 40 * 60 * 1000; // 40 mins
      
      await Machine.updateMany(
        { _id: { $in: machineIds } },
        { 
          $set: { 
            status: 'In Use',
            currentOrderId: newOrder._id,
            startTime: now,
            endTime: new Date(now.getTime() + cycleTime)
          } 
        },
        { session }
      );
    }

    await session.commitTransaction();
    res.status(201).json(newOrder);

  } catch (error) {
    await session.abortTransaction();
    console.error("Order Error:", error.message);
    const code = error.message.includes("Insufficient") || error.message.includes("available") ? 400 : 500;
    res.status(code).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// ============================================
// GET ALL ORDERS
// ============================================
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'username email phoneNumber')
      .populate('createdBy', 'username')
      .populate('machineIds', 'machineNumber type') // ✅ This will work now that Model is fixed
      .sort({ createdAt: -1 });
    
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// UPDATE ORDER STATUS (Machine Release Logic)
// ============================================
const updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status } = req.body;
    const updates = { status };
    
    if (['Completed', 'Claimed', 'Cancelled'].includes(status)) {
      updates.completedAt = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, session }
    ).populate('customerId', 'username email');

    if (!updatedOrder) throw new Error("Order not found");

    // ✅ Machine Release: If order is finished, free the machines
    if (['Completed', 'Claimed', 'Cancelled'].includes(status)) {
      if (updatedOrder.machineIds && updatedOrder.machineIds.length > 0) {
        await Machine.updateMany(
          { _id: { $in: updatedOrder.machineIds } },
          { 
            $set: { 
              status: 'Available', 
              currentOrderId: null,
              startTime: null,
              endTime: null
            } 
          },
          { session }
        );
      }
    }

    await session.commitTransaction();
    res.status(200).json(updatedOrder);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

const getOrderStats = async (req, res) => {
  try {
    const [revenue, status] = await Promise.all([
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } }]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
    ]);
    res.status(200).json({ revenue: revenue[0]?.total || 0, count: revenue[0]?.count || 0, breakdown: status });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id }).sort({ createdAt: -1 }).select('-createdBy');
    res.json(orders);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createOrder, getAllOrders, getOrderStats, updateOrderStatus, getCustomerOrders };