const Diary = require('../models/Diary');

// @desc    Get all diary entries
// @route   GET /api/diary
exports.getEntries = async (req, res) => {
  try {
    const entries = await Diary.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching diary entries.' });
  }
};

// @desc    Create a new diary entry
// @route   POST /api/diary
exports.createEntry = async (req, res) => {
  try {
    const { content, currentStatus } = req.body;
    const entry = await Diary.create({ content, currentStatus });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating diary entry.' });
  }
};