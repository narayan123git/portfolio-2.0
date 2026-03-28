const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }, // NEVER store plain text passwords
  lastLogin: { type: Date }
});

module.exports = mongoose.model('Admin', AdminSchema);