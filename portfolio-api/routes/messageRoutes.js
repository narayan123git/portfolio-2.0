const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { getCaptcha, sendMessage, getMessages, deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const captchaLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many captcha requests. Please try again shortly.' },
  standardHeaders: true,
  legacyHeaders: false
});

const submitMessageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'You have exceeded the maximum message limit. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.get('/captcha', captchaLimiter, getCaptcha);

// Middleware to handle validation errors
const validateMessage = [
  body('name').trim().escape().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('subject').trim().escape().isLength({ max: 100 }).withMessage('Subject is too long'),
  body('message').trim().escape().isLength({ min: 5, max: 2000 }).withMessage('Message must be between 5 and 2000 characters'),
  body('captchaText').trim().isLength({ min: 4, max: 8 }).withMessage('Captcha text is required'),
  body('captchaHash').isString().isLength({ min: 32 }).withMessage('Invalid captcha hash'),
  body('captchaExpires').isInt({ min: 1 }).withMessage('Invalid captcha expiration'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       // Log the failed attempt as a security event could go here
       return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

router.route('/')
  .post(submitMessageLimiter, validateMessage, sendMessage) // public with strict validation
  .get(protect, getMessages); // admin only

router.route('/:id')
  .delete(protect, deleteMessage); // admin only

module.exports = router;