const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary and return the URL
// 'image' is the name of the form field the frontend will send
router.post('/', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided.' });
    }
    
    // Cloudinary automatically returns a secure URL for the uploaded file
    res.status(200).json({ 
      message: 'Image uploaded successfully',
      imageUrl: req.file.path 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during upload.' });
  }
});

module.exports = router;