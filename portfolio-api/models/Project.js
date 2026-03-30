const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
  techStack: [{ type: String }], // e.g., ['Node.js', 'MongoDB', 'Socket.IO']
  githubLink: { type: String },
  liveLink: { type: String },
  imageUrl: { type: String }, // URL from AWS S3 or Cloudinary
  isVisible: { type: Boolean, default: true }, // The feature flag for your admin panel
  order: { type: Number, default: () => Date.now() }, // For custom project ordering, defaults to creation time
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);