const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  resumeUrl: {
    type: String,
    default: ''
  },
  githubUrl: {
    type: String,
    default: 'https://github.com/narayan123git'
  },
  linkedinUrl: {
    type: String,
    default: 'https://linkedin.com/in/narayan-paul'
  },
  heroText: {
    type: String,
    default: 'Welcome to my Portfolio'
  },
  primaryColor: {
    type: String,
    default: '#3b82f6' // Default tailwind blue
  },
  isHiring: {
    type: Boolean,
    default: true
  },
  currentStatus: {
    type: String,
    default: 'Actively looking for roles'
  }
}, { timestamps: true });

// We only ever need one document in this collection
module.exports = mongoose.model('Setting', settingSchema);