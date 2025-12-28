const Order = require('../models/Order');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Staff/Admin
const createOrder = async (req, res) => {
    try {
    // 1. Destructure the data we need from the user's request
    // "req.body" is the JSON data the frontend sends us
    const {
    customerName,
    serviceType,
    weight,
    washCount,
    dryCount,
    totalPrice
    } = req.body;

    // 2. Basic Validation (The Model does most of this, but good to check here too)
    if (!customerName || !serviceType || !totalPrice) {
        return res.status(400).json({ message: "Please fill in all required fields" });
    }
    // 3. Create the Order in the Database
    // "await" means: "Pause here and wait for MongoDB to finish saving."
    const newOrder = await Order.create({
    customerName,
    serviceType,
    weight,
    washCount,
    dryCount,
    totalPrice,
    status: 'Pending' // Default status
    });
    // 4. Send Success Response
    // 201 means "Created Successfully"
    res.status(201).json(newOrder);

    } catch (error) {
    // 5. Handle Errors
    // If the database connection drops or validation fails, code jumps here.
    console.error(error);
    res.status(500).json({ message: "Server Error: Could not create order" });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
const getAllOrders = async (req, res) =>{
    try {
        // Find all orders and sort them by date (Newest first)
        // -1 means Descending (Newest to Oldest
        const orders = await Order.find().sort({ createdAt: -1 });
        
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export these functions so routes can use them
module.exports = {
createOrder,
getAllOrders
};