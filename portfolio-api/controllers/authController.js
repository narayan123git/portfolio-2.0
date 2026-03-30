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
  res.clearCookie('adminToken', buildCookieOptions());
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