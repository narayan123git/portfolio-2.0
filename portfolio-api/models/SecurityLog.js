const mongoose = require('mongoose');
const { sendSecurityLogAlert } = require('../services/notificationService');

const securityLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: [
      'HONEYPOT_TRIGGER',
      'FAILED_LOGIN',
      'UNAUTHORIZED_ACCESS',
      'RATE_LIMIT_EXCEEDED',
      'CAPTCHA_FAILED',
    ],
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    default: 'Unknown',
  },
  details: {
    type: String, // E.g., "Attempted to access /admin with invalid token"
  }
}, { timestamps: true });

// Automatically delete security logs after 1 day (86400 seconds)
securityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

securityLogSchema.post('save', async function sendSecurityAlert(logDoc) {
  try {
    await sendSecurityLogAlert(logDoc);
  } catch (error) {
    console.error('Security alert mail dispatch failed:', error.message);
  }
});

module.exports = mongoose.model('SecurityLog', securityLogSchema);