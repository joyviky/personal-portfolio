const express = require('express');
const { trackVisitor, getVisitorStats } = require('../controllers/visitorController');

const router = express.Router();

router.post('/track', trackVisitor);
router.get('/stats', getVisitorStats);

module.exports = router;