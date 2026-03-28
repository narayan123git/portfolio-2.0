const express = require('express');
const router = express.Router();
const { getSecurityLogs, deleteSecurityLog, clearAllLogs } = require('../controllers/securityController');
const { protect } = require('../middleware/authMiddleware');

// Fetch all logs
router.get('/', protect, getSecurityLogs);

// Clear all logs
router.delete('/', protect, clearAllLogs);

// Delete a single log
router.delete('/:id', protect, deleteSecurityLog);

module.exports = router;