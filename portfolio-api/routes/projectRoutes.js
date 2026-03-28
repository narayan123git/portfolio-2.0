const express = require('express');
const router = express.Router();
const { getProjects, createProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// Public route to view projects
router.get('/', getProjects);

// Protected route to add a project (Requires your JWT)
router.post('/', protect, createProject);

module.exports = router;