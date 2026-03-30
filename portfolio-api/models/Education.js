const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  degree: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
  },
  boardOrUniversity: {
    type: String,
  },
  score: {
    type: String,
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
  },
  activities: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Education', educationSchema);