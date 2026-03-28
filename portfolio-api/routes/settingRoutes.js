const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getSettings)
  .put(protect, updateSettings);

module.exports = router;