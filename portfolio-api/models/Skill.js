const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true, // e.g. Frontend, Backend, Database, Cloud, Tool
    default: 'Other'
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  icon: {
    type: String, // String representation e.g., 'FaReact' or a URL to an image
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);