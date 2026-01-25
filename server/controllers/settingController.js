const Setting = require('../models/Setting');

// @desc    Get current system settings (prices + announcements)
// @route   GET /api/settings
const getSettings = async (req, res) => {
  try {
    // 1. Try to find the settings
    let settings = await Setting.findOne();

    // 2. If no settings exist yet, create default ones
    if (!settings) {
      settings = await Setting.create({
        // Pricing defaults
        fullServicePerKg: 25,
        minWeight: 5,
        selfServiceWash: 45,
        selfServiceDry: 65,
        // Announcement defaults (Explicitly setting them ensures they exist)
        announcementText: "Welcome to M-Laundromat!",
        showAnnouncement: true
      });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update settings (Prices AND Announcement)
// @route   PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    // 1. Destructure ALL fields from the request (Pricing + Announcement)
    const { 
      fullServicePerKg, 
      minWeight, 
      selfServiceWash, 
      selfServiceDry, 
      announcementText,  // <--- Added this
      showAnnouncement   // <--- Added this
    } = req.body;
    
    // 2. Update the document
    const settings = await Setting.findOneAndUpdate({}, {
      fullServicePerKg,
      minWeight,
      selfServiceWash,
      selfServiceDry,
      announcementText,  // <--- Save to DB
      showAnnouncement,  // <--- Save to DB
      lastUpdated: Date.now()
    }, { new: true, upsert: true });

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings };