require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Security Packages
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const honeypot = require('./middleware/honeypot');

// Connect to MongoDB
connectDB();

const app = express();

// --- 🛡️ ULTRA-SECURITY MIDDLEWARE START 🛡️ ---

// 1. Set secure HTTP headers
app.use(helmet());

// 2. Allow frontend connection (We will restrict this to your specific Vercel domain later)
app.use(cors());

// 3. Parse JSON payloads (Limit size to 10kb to prevent payload overload attacks)
app.use(express.json({ limit: '10kb' }));

// 4. Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// 5. Prevent XSS attacks (Cross-Site Scripting)
app.use(xss());

// 6. Global Rate Limiting (Prevents basic DDoS and brute force attacks)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes.'
});
app.use('/api/', limiter); // Apply rate limiting to all API routes

// 7. Activate the custom Honeypot Trap
app.use(honeypot);

// --- 🛡️ ULTRA-SECURITY MIDDLEWARE END 🛡️ ---

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/diary', require('./routes/diaryRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

app.get('/', (req, res) => res.send('Portfolio API is secured and running.'));

// A fake route just to test the trap easily in your browser
app.get('/wp-admin', (req, res) => res.send('This should be trapped.')); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Secure Server locked and loaded on port ${PORT}`));