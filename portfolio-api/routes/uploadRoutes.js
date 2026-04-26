const express = require('express');
const router = express.Router();
const { uploadImage, uploadVideo } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

const runUpload = (middleware, fileField) => (req, res) => {
  middleware(req, res, (error) => {
    if (error) {
      console.error(error);
      return res.status(400).json({
        message: error.message || `Failed to upload ${fileField}.`,
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: `No ${fileField} provided.` });
    }

    if (fileField === 'video') {
      return res.status(200).json({
        message: 'Video uploaded successfully',
        videoUrl: req.file.path,
      });
    }

    return res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.path,
    });
  });
};

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary and return the URL
// 'image' is the name of the form field the frontend will send
router.post('/', protect, runUpload(uploadImage.single('image'), 'image'));

// @route   POST /api/upload/video
// @desc    Upload a video to Cloudinary and return the URL
router.post('/video', protect, runUpload(uploadVideo.single('video'), 'video'));

module.exports = router;