const express = require('express');
const router = express.Router();
const { getBlogs, createBlog } = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getBlogs);
router.post('/', protect, createBlog);

module.exports = router;