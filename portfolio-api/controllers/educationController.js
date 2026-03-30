const Education = require('../models/Education');

// @desc    Get all education records
// @route   GET /api/education
// @access  Public
const getEducation = async (req, res) => {
  try {
    const education = await Education.find().sort({ startDate: -1 });
    res.status(200).json({ success: true, count: education.length, data: education });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create an education record
// @route   POST /api/education
// @access  Private
const createEducation = async (req, res) => {
  try {
    const education = await Education.create(req.body);
    res.status(201).json({ success: true, data: education });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update an education record
// @route   PUT /api/education/:id
// @access  Private
const updateEducation = async (req, res) => {
  try {
    const education = await Education.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });
    if (!education) return res.status(404).json({ success: false, message: 'Education record not found' });
    res.status(200).json({ success: true, data: education });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete an education record
// @route   DELETE /api/education/:id
// @access  Private
const deleteEducation = async (req, res) => {
  try {
    const education = await Education.findByIdAndDelete(req.params.id);
    if (!education) return res.status(404).json({ success: false, message: 'Education record not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { getEducation, createEducation, updateEducation, deleteEducation };