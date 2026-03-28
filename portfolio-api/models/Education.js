const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true, // e.g., "Aug 2019"
  },
  endDate: {
    type: String, // e.g., "May 2023" or "Present"
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Education', educationSchema);