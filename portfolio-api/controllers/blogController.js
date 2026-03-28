const Blog = require('../models/Blog');

// @desc    Get all published blogs
// @route   GET /api/blogs
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching blogs.' });
  }
};

// @desc    Create a new blog post
// @route   POST /api/blogs
exports.createBlog = async (req, res) => {
  try {
    const { title, slug, content, aiSummary, tags, readTime, published } = req.body;
    const blog = await Blog.create({ title, slug, content, aiSummary, tags, readTime, published });
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating blog post.' });
  }
};