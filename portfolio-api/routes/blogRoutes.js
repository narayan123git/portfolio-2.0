const express = require('express');
const router = express.Router();
const { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware'); // Notice the curly braces!

// Standard routes
router.get('/', getBlogs);
router.post('/', protect, createBlog);

// Dynamic routes (Order matters here: :slug should usually go before :id, but they share the same structure so keep an eye on this)
router.get('/:slug', getBlogBySlug);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

module.exports = router;