const express = require('express');
const { getPortfolio, updatePortfolio } = require('../controllers/portfolioController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.get('/', getPortfolio);
router.put('/', authenticateToken, updatePortfolio);

module.exports = router;
