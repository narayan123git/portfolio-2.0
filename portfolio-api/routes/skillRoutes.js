const express = require('express');
const { getSkills, createSkill, updateSkill, deleteSkill } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getSkills)
  .post(protect, createSkill);

router.route('/:id')
  .put(protect, updateSkill)
  .delete(protect, deleteSkill);

module.exports = router;