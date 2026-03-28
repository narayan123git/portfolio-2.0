const mongoose = require('mongoose');

const SecurityLogSchema = new mongoose.Schema({
  ipAddress: { type: String, required: true },
  endpointAttempted: { type: String, required: true }, // e.g., "/wp-admin"
  payload: { type: Object }, // Any data the bot tried to send
  isBlocked: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SecurityLog', SecurityLogSchema);