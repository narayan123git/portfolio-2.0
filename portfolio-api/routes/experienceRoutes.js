const express = require('express');
const { getExperience, createExperience, updateExperience, deleteExperience } = require('../controllers/experienceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getExperience)
  .post(protect, createExperience);

router.route('/:id')
  .put(protect, updateExperience)
  .delete(protect, deleteExperience);

module.exports = router;