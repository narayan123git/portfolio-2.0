const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Check if admin exists
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials. Intrusion logged.' });
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Intrusion logged.' });
    }

    // 3. Update last login time
    admin.lastLogin = Date.now();
    await admin.save();

    // 4. Generate the JWT (The VIP Pass)
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Token expires in 1 day for security
    );

    res.json({
      message: 'Login successful',
      token,
      username: admin.username
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};