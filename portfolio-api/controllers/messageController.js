const Message = require('../models/Message');
const SecurityLog = require('../models/SecurityLog');

// @desc    Send a new message
// @route   POST /api/messages
// @access  Public
const sendMessage = async (req, res) => {
  try {
    const { name, email, message, _honeypot } = req.body;

    // The Trapdoor Feature
    // If a bot fills in the hidden honeypot field, we trap it
    if (_honeypot) {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      
      await SecurityLog.create({
        eventType: 'HONEYPOT_TRIGGER',
        ipAddress: ip,
        userAgent: req.headers['user-agent'],
        details: `Spambot attempted to send a message. Bot name: ${name}, Email: ${email}`
      });

      // We return a fake 'ok' response so the bot thinks it succeeded
      return res.status(200).json({ success: true, message: 'Message sent successfully.' });
    }

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and message' });
    }

    const newMessage = await Message.create({
      name,
      email,
      message
    });

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
    const messages = await Message.find().sort({ createdAt: -1 });
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
  sendMessage,
  getMessages,
  deleteMessage
};