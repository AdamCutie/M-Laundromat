const Setting = require('../models/Setting');

// @desc    Get current system settings (prices)
// @route   GET /api/settings
const getSettings = async (req, res) => {
  try {
    // 1. Try to find the settings
    let settings = await Setting.findOne();

    // 2. If no settings exist yet, create default ones
    if (!settings) {
      settings = await Setting.create({
        fullServicePerKg: 25,
        minWeight: 5,
        selfServiceWash: 45,
        selfServiceDry: 65
      });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update prices
// @route   PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    const { fullServicePerKg, minWeight, selfServiceWash, selfServiceDry } = req.body;
    
    // Update the first document found (upsert: true means create if missing)
    const settings = await Setting.findOneAndUpdate({}, {
      fullServicePerKg,
      minWeight,
      selfServiceWash,
      selfServiceDry,
      lastUpdated: Date.now()
    }, { new: true, upsert: true });

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings };