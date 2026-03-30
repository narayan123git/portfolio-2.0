require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const securityRoutes = require('./routes/securityRoutes');

// Security Packages
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const honeypot = require('./middleware/honeypot');
const { startCronJobs } = require('./utils/cronJobs');

// Connect to MongoDB
connectDB();

const app = express();

// Trust the proxy to get the real client IP (Fixes rate-limiting behind Next.js proxy)
app.set('trust proxy', 1);

// --- 🛡️ ULTRA-SECURITY MIDDLEWARE START 🛡️ ---

// 1. Set secure HTTP headers
app.use(helmet());

// 2. Strict CORS Configuration (Only allow your exact frontend domains)
const allowedOrigins = [process.env.FRONTEND_URL];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 3. Parse JSON payloads (Limit size to 10kb to prevent payload overload attacks)
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// 4. Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// 5. Prevent XSS attacks (Cross-Site Scripting)
app.use(xss());

// 6. Prevent HTTP Parameter Pollution
app.use(hpp());

// 7. Global Rate Limiting (Strict for public traffic)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// 7.1 Higher limit for authenticated admin requests.
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Higher threshold so admin can edit content freely
  message: 'Too many admin requests from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

const getAuthToken = (req) => {
  if (req.cookies && req.cookies.adminToken) {
    return req.cookies.adminToken;
  }

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
};

const hasValidAdminToken = (req) => {
  const token = getAuthToken(req);
  if (!token) {
    return false;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
};

const apiLimiter = (req, res, next) => {
  if (hasValidAdminToken(req)) {
    return adminLimiter(req, res, next);
  }

  return generalLimiter(req, res, next);
};

app.use('/api/', apiLimiter);

// 8. Strict Rate Limiting for Authentication (Brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per 15 mins
  message: 'Too many login attempts. Please try again later.'
});
app.use('/api/auth/login', authLimiter);

// 9. Activate the custom Honeypot Trap
app.use(honeypot);

// --- 🛡️ ULTRA-SECURITY MIDDLEWARE END 🛡️ ---

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/diary', require('./routes/diaryRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/education', require('./routes/educationRoutes'));
app.use('/api/security', securityRoutes);

app.get('/', (req, res) => res.send('Portfolio API is secured and running.'));

// A fake route just to test the trap easily in your browser
app.get('/wp-admin', (req, res) => res.send('This should be trapped.')); 

startCronJobs();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Secure Server locked and loaded on port ${PORT}`));