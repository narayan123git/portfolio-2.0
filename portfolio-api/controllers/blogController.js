const Blog = require('../models/Blog');

const normalizeSummary = (summary) => (
  Array.isArray(summary)
    ? summary
    : String(summary || '').split(/\r?\n/)
).map((point) => String(point).trim()).filter(Boolean);

const normalizeTags = (tags) => (
  Array.isArray(tags) ? tags : String(tags || '').split(',')
).map((tag) => String(tag).trim()).filter(Boolean);

// @desc    Get all blogs (Public gets published, Admin gets all)
// @route   GET /api/blogs
exports.getBlogs = async (req, res) => {
  try {
    // If frontend requests ?all=true, fetch everything. Otherwise, only published.
    const query = req.query.all === 'true' ? {} : { published: true };
    const blogs = await Blog.find(query).sort({ createdAt: -1 }).lean();
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching blogs.' });
  }
};

// @desc    Get single blog by slug (For the public Read Full Log page)
// @route   GET /api/blogs/:slug
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).lean();
    
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
      aiSummary: normalizeSummary(aiSummary),
      tags: normalizeTags(tags),
      readTime, 
      published 
    });
    
    res.status(201).json(blog);
  } catch (error) {
    if (error.name === 'ValidationError' || error.code === 11000) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Server error while creating blog.' });
  }
};

// @desc    Update a blog (Private/Admin Route)
// @route   PUT /api/blogs/:id
exports.updateBlog = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if ('aiSummary' in updateData) updateData.aiSummary = normalizeSummary(updateData.aiSummary);
    if ('tags' in updateData) updateData.tags = normalizeTags(updateData.tags);

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id, 
      updateData,
      { new: true } // Returns the newly updated document
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