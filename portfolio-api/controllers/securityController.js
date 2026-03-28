const SecurityLog = require('../models/SecurityLog');

// @desc    Get all security logs (Admin Only)
// @route   GET /api/security
exports.getSecurityLogs = async (req, res) => {
  try {
    const logs = await SecurityLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching security logs.' });
  }
};

// @desc    Delete a specific security log
// @route   DELETE /api/security/:id
exports.deleteSecurityLog = async (req, res) => {
  try {
    const deletedLog = await SecurityLog.findByIdAndDelete(req.params.id);
    if (!deletedLog) {
      return res.status(404).json({ message: 'Security log not found' });
    }
    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting log.' });
  }
};

// @desc    Clear ALL security logs
// @route   DELETE /api/security
exports.clearAllLogs = async (req, res) => {
  try {
    await SecurityLog.deleteMany({});
    res.json({ message: 'All security logs cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while clearing logs.' });
  }
};