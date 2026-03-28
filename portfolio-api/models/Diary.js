const mongoose = require('mongoose');

const DiarySchema = new mongoose.Schema({
  content: { type: String, required: true }, // e.g., "Cracked a complex graph problem today."
  currentStatus: { type: String }, // e.g., "Solving DSA" or "Debugging"
  createdAt: { type: Date, default: Date.now },
  // Optional: We can add a TTL (Time-To-Live) index here later if you want 
  // MongoDB to automatically delete entries older than 6 months.
});

module.exports = mongoose.model('Diary', DiarySchema);