const Message = require('../models/Message');
const SecurityLog = require('../models/SecurityLog');
const { generateSecureCaptcha, verifyCaptcha } = require('../portfolio-api/utils/captcha');
const { sendMail } = require('../services/mailService');

// @desc    Get CAPTCHA
// @route   GET /api/messages/captcha
// @access  Public
const getCaptcha = (req, res) => {
  try {
    const captchaData = generateSecureCaptcha();
    res.status(200).json({ success: true, data: captchaData });
  } catch (error) {
    console.error('Captcha generation failed:', error.message);
    res.status(503).json({ success: false, message: 'Captcha service unavailable.' });
  }
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Public
const sendMessage = async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message,
      honeypot,
      _honeypot,
      captchaText,
      captchaHash,
      captchaExpires,
      captchaToken,
    } = req.body;
    const honeypotValue = honeypot ?? _honeypot;

    if (honeypotValue) {
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';

      await SecurityLog.create({
        eventType: 'HONEYPOT_TRIGGER',
        ipAddress,
        userAgent: req.headers['user-agent'],
        details: `Honeypot triggered during contact submission. Name: ${name || 'N/A'}, Email: ${email || 'N/A'}`,
      });

      return res.status(200).json({ success: true, message: 'Message sent successfully.' });
    }

    if (!verifyCaptcha(captchaText, captchaHash, captchaExpires, captchaToken)) {
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
      await SecurityLog.create({
        eventType: 'CAPTCHA_FAILED',
        ipAddress,
        userAgent: req.headers['user-agent'],
        details: `Failed image captcha. Text provided: ${captchaText || 'N/A'}.`,
      });

      return res.status(400).json({
        success: false,
        message: 'Bot protection check failed. Incorrect captcha or captcha expired.',
      });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and message' });
    }

    const resolvedSubject = subject && String(subject).trim().length > 0
      ? String(subject).trim()
      : 'Website Inquiry';

    const newMessage = await Message.create({
      name,
      email,
      subject: resolvedSubject,
      message,
    });

    const recipient = process.env.ALERT_EMAIL_TO;
    if (recipient) {
      const submittedAt = new Date(newMessage.createdAt || Date.now()).toISOString();
      const subject = `[Portfolio API] New contact message from ${name}`;
      const text = [
        'A new contact message was received.',
        '',
        `Time: ${submittedAt}`,
        `Name: ${name}`,
        `Email: ${email}`,
        `Message: ${message}`,
      ].join('\n');
      const safeMessage = String(message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const html = `
        <h2>New Contact Message</h2>
        <ul>
          <li><strong>Time:</strong> ${submittedAt}</li>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
        </ul>
        <p><strong>Message:</strong></p>
        <p>${safeMessage.replace(/\n/g, '<br/>')}</p>
      `;

      // Message persistence must succeed even if email delivery fails.
      void sendMail({ to: recipient, subject, text, html }).catch((mailError) => {
        console.error('Failed to send immediate message alert:', mailError.message);
      });
    }

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all messages
// @route   GET /api/messages
// @access  Private (Admin)
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private (Admin)
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getCaptcha,
  sendMessage,
  getMessages,
  deleteMessage
};