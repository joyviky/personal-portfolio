const express = require('express');
const {
  trackVisitor,
  getVisitorStats,
  getDetailedAnalytics,
  getDailyBreakdown,
  resetVisitorStats,
} = require('../controllers/visitorController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

/**
 * Track a new visitor (public)
 * POST /api/visitors/track
 * Body: { page: '/path' }
 */
router.post('/track', trackVisitor);

/**
 * Get visitor statistics (public)
 * GET /api/visitors/stats
 * Returns: { total, today, unique, todayUnique, hasData }
 */
router.get('/stats', getVisitorStats);

/**
 * Get detailed analytics (admin only)
 * GET /api/visitors/analytics
 * Returns: { last7Days, topPages, topReferrers }
 */
router.get('/analytics', authenticateToken, getDetailedAnalytics);

/**
 * Get daily breakdown for charts (admin only)
 * GET /api/visitors/breakdown?days=30
 * Returns: [ { date, visits, uniqueVisitors }, ... ]
 */
router.get('/breakdown', authenticateToken, getDailyBreakdown);

/**
 * Reset all visitor data (admin only) - PROTECTED
 * ⚠️ POST /api/visitors/reset
 * WARNING: Deletes all visitor records. Requires valid admin token.
 */
router.post('/reset', authenticateToken, resetVisitorStats);

module.exports = router;