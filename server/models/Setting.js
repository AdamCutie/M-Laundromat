const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  // Full Service Rules
  fullServicePerKg: { type: Number, default: 25 }, // e.g., 25 pesos per kg
  minWeight: { type: Number, default: 5 },         // Minimum 5kg per load

  // Self Service Rules
  selfServiceWash: { type: Number, default: 45 },  // Price per wash cycle
  selfServiceDry: { type: Number, default: 65 },   // Price per dry cycle

  //  FOR ANNOUNCEMENT:
  announcementText: { type: String, default: "Welcome to M-Laundromat!" },
  showAnnouncement: { type: Boolean, default: true },

  // System Info
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Setting', SettingSchema);