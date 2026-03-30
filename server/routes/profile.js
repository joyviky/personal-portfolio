const express = require('express');
const { getProfile, updateProfile, uploadResume } = require('../controllers/profileController');
const authenticateToken = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.get('/', getProfile);
router.put('/', authenticateToken, upload.single('avatar'), updateProfile);
router.post('/resume', authenticateToken, upload.single('resume'), uploadResume);

module.exports = router;
