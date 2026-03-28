const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// 1. Authenticate with your Cloudinary account
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure the storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio_assets', // A dedicated folder in your cloud
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Security: block malicious file types
    transformation: [{ width: 1200, crop: 'limit' }], // Auto-compress massive images
  },
});

// 3. Initialize Multer with our secure storage engine
const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };