const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token = null;

  if (req.cookies && req.cookies.adminToken) {
    token = req.cookies.adminToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Backward compatibility for clients still using bearer token headers.
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Not authorized, token failed.' });
  }
};

module.exports = { protect };