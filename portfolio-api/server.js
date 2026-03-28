require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const securityRoutes = require('./routes/securityRoutes');

// Security Packages
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const honeypot = require('./middleware/honeypot');

// Connect to MongoDB
connectDB();

const app = express();

// Trust the proxy to get the real client IP (Fixes rate-limiting behind Next.js proxy)
app.set('trust proxy', 1);

// --- 🛡️ ULTRA-SECURITY MIDDLEWARE START 🛡️ ---

// 1. Set secure HTTP headers
app.use(helmet());

// 2. Strict CORS Configuration (Only allow your exact frontend domains)
const allowedOrigins = ['http://localhost:3000', process.env.FRONTEND_URL];
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

// 4. Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// 5. Prevent XSS attacks (Cross-Site Scripting)
app.use(xss());

// 6. Prevent HTTP Parameter Pollution
app.use(hpp());

// 7. Global Rate Limiting (Prevents basic DDoS and brute force attacks)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter); // Apply rate limiting to all API routes

// 8. Strict Rate Limiting for the Contact Form (Messages API)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 messages per hour
  message: 'You have exceeded the maximum message limit. Please try again later.'
});
app.use('/api/messages', contactLimiter);

// 9. Strict Rate Limiting for Authentication (Brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per 15 mins
  message: 'Too many login attempts. Please try again later.'
});
app.use('/api/auth', authLimiter);

// 10. Activate the custom Honeypot Trap
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Secure Server locked and loaded on port ${PORT}`));