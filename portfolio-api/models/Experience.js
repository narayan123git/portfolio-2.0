const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
  },
  responsibilities: {
    type: String,
  },
  techStack: {
    type: [String],
    default: [],
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Experience', experienceSchema);