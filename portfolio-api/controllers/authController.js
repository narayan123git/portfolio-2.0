const Admin = require('../models/Admin');
const SecurityLog = require('../models/SecurityLog');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const RESET_FAILURE_MESSAGE = 'Unable to reset password. Check your details and try again.';
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;

const getRequestIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || 'Unknown';
};

const logFailedLoginAttempt = async (req, username, reason) => {
  try {
    await SecurityLog.create({
      eventType: 'FAILED_LOGIN',
      ipAddress: getRequestIp(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      details: `Failed admin login for username: ${username || 'N/A'}. Reason: ${reason}.`,
    });
  } catch (error) {
    console.error('Failed to persist failed-login security log:', error.message);
  }
};

const buildCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
});

const signAuthToken = (admin) =>
  jwt.sign(
    { id: admin._id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

const hashResetToken = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex');

const safeCompare = (left, right) => {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = typeof username === 'string' ? username.trim() : '';

    if (!normalizedUsername || !password) {
      await logFailedLoginAttempt(req, normalizedUsername, 'Missing username or password');
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // 1. Check if admin exists
    const admin = await Admin.findOne({ username: normalizedUsername });
    if (!admin) {
      await logFailedLoginAttempt(req, normalizedUsername, 'User not found');
      return res.status(401).json({ message: 'Invalid credentials. Intrusion logged.' });
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      await logFailedLoginAttempt(req, normalizedUsername, 'Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials. Intrusion logged.' });
    }

    // 3. Update last login time
    admin.lastLogin = Date.now();
    await admin.save();

    // 4. Generate the JWT (The VIP Pass)
    const token = signAuthToken(admin);

    res.cookie('adminToken', token, buildCookieOptions());

    res.json({
      message: 'Login successful',
      username: admin.username
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('adminToken', { path: '/', sameSite: 'lax' });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

exports.session = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized.' });
  }

  return res.status(200).json({ success: true, user: req.user });
};

exports.requestPasswordResetToken = async (req, res) => {
  try {
    const { username, resetKey } = req.body;
    const normalizedUsername = typeof username === 'string' ? username.trim() : '';

    if (!normalizedUsername || !resetKey) {
      return res.status(400).json({ message: 'Username and reset key are required.' });
    }

    if (!process.env.ADMIN_RESET_KEY) {
      return res.status(503).json({ message: RESET_FAILURE_MESSAGE });
    }

    if (!safeCompare(resetKey, process.env.ADMIN_RESET_KEY)) {
      return res.status(400).json({ message: RESET_FAILURE_MESSAGE });
    }

    const admin = await Admin.findOne({ username: normalizedUsername });
    if (!admin) {
      return res.status(400).json({ message: RESET_FAILURE_MESSAGE });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    admin.passwordResetTokenHash = hashResetToken(resetToken);
    admin.passwordResetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await admin.save();

    res.status(200).json({
      message: 'Reset token generated. Continue with your password reset.',
      resetToken,
      expiresInMs: RESET_TOKEN_TTL_MS,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during reset token generation' });
  }
};

exports.resetPasswordWithToken = async (req, res) => {
  try {
    const { username, resetToken, newPassword } = req.body;
    const normalizedUsername = typeof username === 'string' ? username.trim() : '';

    if (!normalizedUsername || !resetToken || !newPassword) {
      return res.status(400).json({ message: 'Username, reset token, and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({ message: 'New password must include at least one letter and one number.' });
    }

    const admin = await Admin.findOne({ username: normalizedUsername });
    if (!admin || !admin.passwordResetTokenHash || !admin.passwordResetTokenExpiresAt) {
      return res.status(400).json({ message: RESET_FAILURE_MESSAGE });
    }

    const isResetTokenExpired = admin.passwordResetTokenExpiresAt.getTime() < Date.now();
    if (isResetTokenExpired) {
      return res.status(400).json({ message: RESET_FAILURE_MESSAGE });
    }

    const submittedTokenHash = hashResetToken(resetToken);
    if (!safeCompare(submittedTokenHash, admin.passwordResetTokenHash)) {
      return res.status(400).json({ message: RESET_FAILURE_MESSAGE });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    admin.passwordHash = passwordHash;
    admin.passwordResetTokenHash = undefined;
    admin.passwordResetTokenExpiresAt = undefined;
    await admin.save();

    res.status(200).json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

// Test SMTP connectivity - Admin only
exports.testMail = async (req, res) => {
  try {
    const { mailService } = require('../services/mailService');
    const { verifyTransporter, sendMail } = require('../services/mailService');
    
    // First, verify transporter connection
    try {
      const verification = await verifyTransporter();
      console.log('✓ Transporter verified:', verification);
      
      // Send a test email
      const testTo = req.body.testEmail || process.env.ALERT_EMAIL_TO || process.env.SMTP_USER;
      const success = await sendMail({
        to: testTo,
        subject: '🧪 Portfolio API - SMTP Test Email',
        text: 'If you received this email, your SMTP configuration is working correctly!',
        html: '<p>If you received this email, your SMTP configuration is working correctly!</p><p><strong>Sent at:</strong> ' + new Date().toISOString() + '</p>',
      });
      
      if (success) {
        return res.status(200).json({
          success: true,
          message: 'Test email sent successfully! Check your inbox.',
          testEmail: testTo,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('❌ SMTP test failed:', error.message);
      return res.status(500).json({
        success: false,
        message: 'SMTP test failed',
        error: error.message,
        code: error.code,
        details: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: process.env.SMTP_SECURE,
          connectionTimeout: process.env.SMTP_CONNECTION_TIMEOUT_MS,
          greetingTimeout: process.env.SMTP_GREETING_TIMEOUT_MS,
          socketTimeout: process.env.SMTP_SOCKET_TIMEOUT_MS,
          ipv4Forced: process.env.SMTP_FORCE_IPV4,
        },
      });
    }
  } catch (error) {
    console.error('Unexpected error in testMail:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during SMTP test',
      error: error.message,
    });
  }
};