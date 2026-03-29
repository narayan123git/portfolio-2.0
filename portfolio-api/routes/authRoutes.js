const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
	login,
	logout,
	session,
	requestPasswordResetToken,
	resetPasswordWithToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const forgotPasswordLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 5,
	message: 'Too many password reset attempts. Please try again later.',
	standardHeaders: true,
	legacyHeaders: false,
});

const resetTokenIssueLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 5,
	message: 'Too many reset token requests. Please try again later.',
	standardHeaders: true,
	legacyHeaders: false,
});

const resetPasswordLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 8,
	message: 'Too many password reset attempts. Please try again later.',
	standardHeaders: true,
	legacyHeaders: false,
});

// POST request to /api/auth/login
router.post('/login', login);
router.post('/logout', logout);
router.get('/session', protect, session);
router.post('/forgot-password/request-token', forgotPasswordLimiter, resetTokenIssueLimiter, requestPasswordResetToken);
router.post('/forgot-password/reset', forgotPasswordLimiter, resetPasswordLimiter, resetPasswordWithToken);

module.exports = router;