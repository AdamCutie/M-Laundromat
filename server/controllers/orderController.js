const mongoose = require('mongoose');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');

// @desc    Create a new order & Deduct Inventory (Atomic Transaction)
// @route   POST /api/orders
// @access  Staff/Admin
const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            customerName,
            serviceType,
            weight,
            washCount,
            dryCount,
            totalPrice,
            addOns
        } = req.body;

        // 1. Basic Validation
        if (!customerName || !serviceType || totalPrice === undefined) {
            throw new Error("Please fill in all required fields");
        }

        // 2. Handle Inventory Deduction (Atomic Check)
        // If order has add-ons, verify stock and deduct within the session
        if (addOns && addOns.length > 0) {
            for (const item of addOns) {
                // Find and update in one go to prevent race conditions
                const product = await Inventory.findOneAndUpdate(
                    { _id: item.itemId, stockLevel: { $gte: item.quantity } }, // Filter: Must have enough stock
                    { $inc: { stockLevel: -item.quantity } }, // Update: Decrease stock
                    { new: true, session } // Options: Use this transaction session
                );

                if (!product) {
                    // If product is null, it means either it doesn't exist OR stock was too low
                    throw new Error(`Insufficient stock or invalid item for item ID: ${item.itemId}`);
                }
            }
        }

        // 3. Create the Order
        const newOrder = await Order.create([{
            customerName,
            serviceType,
            weight,
            washCount,
            dryCount,
            totalPrice,
            addOns: addOns || [],
            status: 'Pending'
        }], { session });

        // 4. Commit Transaction
        // If we get here, everything is good. Save changes to DB.
        await session.commitTransaction();
        session.endSession();

        res.status(201).json(newOrder[0]); // Order.create returns an array when using sessions

    } catch (error) {
        // 5. Rollback on Error
        // If anything failed above (low stock, DB error), undo ALL changes
        await session.abortTransaction();
        session.endSession();
        
        console.error("Order Transaction Failed:", error.message);
        
        // Return readable error message to frontend
        const statusCode = error.message.includes("Insufficient stock") ? 400 : 500;
        res.status(statusCode).json({ message: error.message || "Server Error: Could not create order" });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Order Stats
// @route   GET /api/orders/stats
const getOrderStats = async (req, res) => {
    try {
        // Parallel execution for faster stats
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
            breakdown: statusStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Order Status
// @route   PUT /api/orders/:id
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const updates = { status };
        if (status === 'Completed') {
            updates.completedAt = new Date();
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderStats,
    updateOrderStatus
};