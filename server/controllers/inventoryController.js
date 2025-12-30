const Inventory = require('../models/Inventory');

// @desc    Get all inventory items
// @route   GET /api/inventory
const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ itemName: 1 }); // Sort A-Z
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new product
// @route   POST /api/inventory
const addInventoryItem = async (req, res) => {
  try {
    const { itemName, stockLevel, unitPrice, costPrice } = req.body;

    // Validation
    if (!itemName || !unitPrice) {
      return res.status(400).json({ message: "Item Name and Price are required" });
    }

    // Check if item already exists
    const exists = await Inventory.findOne({ itemName });
    if (exists) {
      return res.status(400).json({ message: "Item already exists" });
    }

    const newItem = await Inventory.create({
      itemName,
      stockLevel: stockLevel || 0,
      unitPrice,
      costPrice: costPrice || 0
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Item (Restock or Edit Price)
// @route   PATCH /api/inventory/:id
const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    // req.body will contain fields to update (e.g., { stockLevel: 25 })
    
    const updatedItem = await Inventory.findByIdAndUpdate(
      id,
      req.body, // Update with whatever data is sent
      { new: true } // Return the updated version so we can see it
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Delete an inventory item
// @route   DELETE /api/inventory/:id
const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find item by ID and delete it
    const item = await Inventory.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ id: id, message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getInventory, addInventoryItem , updateInventoryItem, deleteInventoryItem };