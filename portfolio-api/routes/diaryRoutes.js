const express = require('express');
const router = express.Router();
const { getEntries, createEntry } = require('../controllers/diaryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getEntries);
router.post('/', protect, createEntry);

module.exports = router;