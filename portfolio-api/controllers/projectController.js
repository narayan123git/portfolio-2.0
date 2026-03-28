const Project = require('../models/Project');

// @desc    Get projects (Public gets visible, Admin gets all)
// @route   GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    // If the frontend requests ?all=true, fetch everything. Otherwise, only visible.
    const query = req.query.all === 'true' ? {} : { isVisible: true };
    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching projects.' });
  }
};

// @desc    Create a new project (Private/Admin Route)
// @route   POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const { title, description, techStack, githubLink, liveLink, imageUrl, isVisible } = req.body;

    const project = await Project.create({
      title,
      description,
      techStack,
      githubLink,
      liveLink,
      imageUrl,
      isVisible // Added this so your toggle switch works!
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating project.' });
  }
};

// @desc    Update a project (Private/Admin Route)
// @route   PUT /api/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } // Returns the newly updated document
    );
    
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating project.' });
  }
};

// @desc    Delete a project (Private/Admin Route)
// @route   DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    
    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting project.' });
  }
};