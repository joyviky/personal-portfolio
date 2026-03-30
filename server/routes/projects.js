const express = require('express');
const { getProjects, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const authenticateToken = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.get('/', getProjects);
router.post('/', authenticateToken, upload.single('image'), createProject);
router.put('/:id', authenticateToken, upload.single('image'), updateProject);
router.delete('/:id', authenticateToken, deleteProject);

module.exports = router;
