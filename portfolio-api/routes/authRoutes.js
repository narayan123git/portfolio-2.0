const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// POST request to /api/auth/login
router.post('/login', login);

module.exports = router;