const express = require('express');
const { 
  login, 
  getCurrentAdmin
} = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes (require authentication)
router.get('/me', authenticateToken, getCurrentAdmin);

module.exports = router;
