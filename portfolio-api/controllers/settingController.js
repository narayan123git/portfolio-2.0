const Setting = require('../models/Setting');

// @desc    Get universal settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();

    // If no settings exist yet, create a default one on the fly
    if (!settings) {
      settings = await Setting.create({});
    }

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private (Admin)
const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();

    // If no settings exist yet, create them with the provided body
    if (!settings) {
      settings = await Setting.create(req.body);
      return res.status(200).json({ success: true, data: settings });
    }

    // Update existing settings
    settings = await Setting.findByIdAndUpdate(settings._id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};