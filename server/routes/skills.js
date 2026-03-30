const express = require('express');
const { getSkills, createSkill, updateSkill, deleteSkill } = require('../controllers/skillController');
const authenticateToken = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.get('/', getSkills);
router.post('/', authenticateToken, upload.single('image'), createSkill);
router.put('/:id', authenticateToken, upload.single('image'), updateSkill);
router.delete('/:id', authenticateToken, deleteSkill);

module.exports = router;
