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
    res.status(500).json({ message: 'Server error while creating entry.' });
  }
};

// @desc    Update a diary entry
// @route   PUT /api/diary/:id
exports.updateEntry = async (req, res) => {
  try {
    const updatedEntry = await Diary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedEntry) return res.status(404).json({ message: 'Entry not found' });
    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating entry.' });
  }
};

// @desc    Delete a diary entry
// @route   DELETE /api/diary/:id
exports.deleteEntry = async (req, res) => {
  try {
    const deletedEntry = await Diary.findByIdAndDelete(req.params.id);
    if (!deletedEntry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting entry.' });
  }
};