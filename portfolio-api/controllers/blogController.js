const Blog = require('../models/Blog');

// @desc    Get all blogs (Public gets published, Admin gets all)
// @route   GET /api/blogs
exports.getBlogs = async (req, res) => {
  try {
    // If frontend requests ?all=true, fetch everything. Otherwise, only published.
    const query = req.query.all === 'true' ? {} : { published: true };
    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching blogs.' });
  }
};

// @desc    Get single blog by slug (For the public Read Full Log page)
// @route   GET /api/blogs/:slug
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    
    if (!blog) {
      return res.status(404).json({ message: 'Log not found in database.' });
    }
    
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching blog.' });
  }
};

// @desc    Create a new blog (Private/Admin Route)
// @route   POST /api/blogs
exports.createBlog = async (req, res) => {
  try {
    const { title, slug, coverImageUrl, content, aiSummary, tags, readTime, published } = req.body;
    
    const blog = await Blog.create({ 
      title, 
      slug, 
      coverImageUrl,
      content, 
      aiSummary, 
      tags, 
      readTime, 
      published 
    });
    
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating blog.' });
  }
};

// @desc    Update a blog (Private/Admin Route)
// @route   PUT /api/blogs/:id
exports.updateBlog = async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { returnDocument: 'after' } // Returns the newly updated document
    );
    
    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating blog.' });
  }
};

// @desc    Delete a blog (Private/Admin Route)
// @route   DELETE /api/blogs/:id
exports.deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting blog.' });
  }
};