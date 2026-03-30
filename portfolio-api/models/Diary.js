const mongoose = require('mongoose');

const DiarySchema = new mongoose.Schema({
  content: { type: String, required: true }, // e.g., "Cracked a complex graph problem today."
  currentStatus: { type: String }, // e.g., "Solving DSA" or "Debugging"
  createdAt: { type: Date, default: Date.now },
});

// Automatically delete diary entries after 2 days.
DiarySchema.index({ createdAt: 1 }, { expireAfterSeconds: 2 * 24 * 60 * 60 });

module.exports = mongoose.model('Diary', DiarySchema);