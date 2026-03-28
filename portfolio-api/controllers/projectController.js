
const Project = require('../models/Project');

// @desc    Get all visible projects (Public Route)
// @route   GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    // Only fetch projects where isVisible is true, and sort by newest first
    const projects = await Project.find({ isVisible: true }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching projects.' });
  }
};

// @desc    Create a new project (Private/Admin Route)
// @route   POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const { title, description, techStack, githubLink, liveLink, imageUrl } = req.body;

    const project = await Project.create({
      title,
      description,
      techStack,
      githubLink,
      liveLink,
      imageUrl
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating project.' });
  }
};