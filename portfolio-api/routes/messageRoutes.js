const express = require('express');
const { body, validationResult } = require('express-validator');
const { getCaptcha, sendMessage, getMessages, deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/captcha', getCaptcha);

// Middleware to handle validation errors
const validateMessage = [
  body('name').trim().escape().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('subject').trim().escape().isLength({ max: 100 }).withMessage('Subject is too long'),
  body('message').trim().escape().isLength({ min: 5, max: 2000 }).withMessage('Message must be between 5 and 2000 characters'),
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
  .post(validateMessage, sendMessage) // public with strict validation
  .get(protect, getMessages); // admin only

router.route('/:id')
  .delete(protect, deleteMessage); // admin only

module.exports = router;