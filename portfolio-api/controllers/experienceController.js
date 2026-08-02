const Experience = require('../models/Experience');

// @desc    Get all experience records
// @route   GET /api/experience
// @access  Public
const getExperience = async (req, res) => {
  try {
    const experience = await Experience.find().sort({ order: 1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: experience.length, data: experience });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create an experience record
// @route   POST /api/experience
// @access  Private
const createExperience = async (req, res) => {
  try {
    const experience = await Experience.create(req.body);
    res.status(201).json({ success: true, data: experience });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update an experience record
// @route   PUT /api/experience/:id
// @access  Private
const updateExperience = async (req, res) => {
  try {
    const experience = await Experience.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!experience) return res.status(404).json({ success: false, message: 'Experience record not found' });
    res.status(200).json({ success: true, data: experience });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete an experience record
// @route   DELETE /api/experience/:id
// @access  Private
const deleteExperience = async (req, res) => {
  try {
    const experience = await Experience.findByIdAndDelete(req.params.id);
    if (!experience) return res.status(404).json({ success: false, message: 'Experience record not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { getExperience, createExperience, updateExperience, deleteExperience };