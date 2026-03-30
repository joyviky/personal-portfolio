const express = require('express');
const { submitMessage, getMessages, markAsRead, deleteMessage } = require('../controllers/messageController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/', submitMessage);
router.get('/', authenticateToken, getMessages);
router.put('/:id/read', authenticateToken, markAsRead);
router.delete('/:id', authenticateToken, deleteMessage);

module.exports = router;
