const Project = require('../models/Project');

// @desc    Get projects (Public gets visible, Admin gets all)
// @route   GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    // If the frontend requests ?all=true, fetch everything. Otherwise, only visible.
    const query = req.query.all === 'true' ? {} : { isVisible: true };
    const projects = await Project.find(query).sort({ order: 1 }).lean(); // Sort by custom order

    const normalized = projects.map((project) => {
      const explicit = String(project.status || project.completionStatus || '').toLowerCase();
      const derivedStatus = explicit === 'completed' || explicit === 'done'
        ? 'completed'
        : explicit === 'ongoing' || explicit === 'in-progress'
          ? 'ongoing'
          : (project.liveLink ? 'completed' : 'ongoing');

      return { ...project, status: derivedStatus };
    });

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching projects.' });
  }
};

// @desc    Create a new project (Private/Admin Route)
// @route   POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const { title, description, status, techStack, githubLink, liveLink, imageUrl, isVisible, order } = req.body;
    const normalizedStatus = String(status || '').toLowerCase() === 'completed' ? 'completed' : 'ongoing';

    const project = await Project.create({
      title,
      description,
      status: normalizedStatus,
      techStack,
      githubLink,
      liveLink,
      imageUrl,
      isVisible,
      order: order || Date.now() // Allow custom order or default to timestamp
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
    const normalizedStatus = req.body.status
      ? (String(req.body.status).toLowerCase() === 'completed' ? 'completed' : 'ongoing')
      : undefined;

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      techStack: req.body.techStack,
      githubLink: req.body.githubLink,
      liveLink: req.body.liveLink,
      imageUrl: req.body.imageUrl,
      isVisible: req.body.isVisible,
      order: req.body.order,
      ...(normalizedStatus ? { status: normalizedStatus } : {})
    };

    // Remove undefined fields so partial updates don't erase data.
    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id, 
      updateData,
      { returnDocument: 'after', runValidators: true } // Returns the newly updated document
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