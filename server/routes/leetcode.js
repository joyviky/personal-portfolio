const express = require('express');
const { getLeetCodeStats } = require('../controllers/leetcodeController');

const router = express.Router();

router.get('/', getLeetCodeStats);

module.exports = router;
