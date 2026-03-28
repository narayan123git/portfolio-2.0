const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // For clean URLs like /blog/backend-security
  content: { type: String, required: true }, // Stores the raw Markdown text
  aiSummary: [{ type: String }], // Array for the 3-point TL;DR
  tags: [{ type: String }], // e.g., ['C++', 'System Design', 'Open Source']
  readTime: { type: Number }, // In minutes
  published: { type: Boolean, default: false }, // Draft mode toggle
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', BlogSchema);