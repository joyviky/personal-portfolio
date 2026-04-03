const { Visitor, VisitorStats } = require('../models/Visitor');

/**
 * Normalize IP address (handle IPv6 ::1 mapping)
 * @param {string} ip - Raw IP address
 * @returns {string} Normalized IP
 */
const normalizeIP = (ip) => {
  if (!ip) return '0.0.0.0';
  
  // Handle IPv6 localhost
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    return '127.0.0.1';
  }
  // Remove IPv6 prefix if present
  if (ip.includes('::ffff:')) {
    return ip.replace('::ffff:', '');
  }
  // Remove any whitespace and convert to lowercase
  return ip.toLowerCase().trim();
};

/**
 * Get start of today's date in UTC (00:00:00 UTC)
 * @returns {Date} Start of day in UTC
 */
const getStartOfDayUTC = () => {
  const now = new Date();
  const utcDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return utcDate;
};

/**
 * Check if visitor is a duplicate within time window
 * Uses database index for performance
 */
const isDuplicateVisitor = async (ip, timeWindowMinutes = 5) => {
  try {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    
    const existingVisit = await Visitor.findOne({
      ip: ip,
      createdAt: { $gte: cutoffTime }
    }).select('ip createdAt').lean(); // .lean() for faster query
    
    return !!existingVisit;
  } catch (error) {
    console.error('❌ Error checking duplicate visitor:', error);
    return false; // Allow tracking on error (fail open)
  }
};

/**
 * Track a new visitor with enhanced duplicate prevention
 * Prevents duplicate counts within 5 minutes
 * Increments total and daily counts atomically
 */
const trackVisitor = async (req, res) => {
  try {
    const { page } = req.body;
    
    // Validate page input
    if (page && typeof page !== 'string') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid page parameter',
        isDuplicate: false 
      });
    }
    
    // Extract and normalize IP
    let ip = req.ip || 
             req.headers['x-forwarded-for']?.split(',')[0] ||
             req.connection.remoteAddress || 
             'unknown';
    ip = normalizeIP(ip);

    // Validate IP format
    if (!ip || ip === 'unknown') {
      console.warn('⚠️ Could not determine visitor IP');
    }

    const userAgent = (req.get('User-Agent') || 'Unknown').substring(0, 500); // Limit length
    const referrer = (req.get('Referrer') || 'Direct').substring(0, 500);
    const today = getStartOfDayUTC();
    const visitPage = (page || '/').substring(0, 200);

    // Check for duplicate visit (5-minute window)
    const isDuplicate = await isDuplicateVisitor(ip, 5);

    if (isDuplicate) {
      return res.status(200).json({
        success: true,
        message: 'Visitor tracked recently',
        isDuplicate: true,
        visitorIP: ip,
      });
    }

    // Create new visitor record with validation
    const visitor = new Visitor({
      ip,
      userAgent,
      referrer,
      page: visitPage,
      visitDate: today,
    });

    // Save visitor with error handling
    await visitor.save();

    // Update stats asynchronously (non-blocking)
    updateVisitorStats().catch(error => {
      console.error('⚠️ Error updating stats (non-blocking):', error.message);
    });

    res.status(200).json({
      success: true,
      message: 'Visitor tracked successfully',
      isDuplicate: false,
      visitorIP: ip,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Visitor tracking error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Tracking failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
};

/**
 * Update aggregate visitor statistics
 * Runs after each visit for real-time accuracy
 */
const updateVisitorStats = async () => {
  try {
    const today = getStartOfDayUTC();

    // Use aggregation pipeline for atomic operation
    const stats = await Visitor.aggregate([
      {
        $facet: {
          allTimeStats: [
            {
              $group: {
                _id: null,
                totalVisits: { $sum: 1 },
                uniqueIPs: { $addToSet: '$ip' }
              }
            }
          ],
          todayStats: [
            {
              $match: { visitDate: today }
            },
            {
              $group: {
                _id: null,
                todayVisits: { $sum: 1 },
                todayUniqueIPs: { $addToSet: '$ip' }
              }
            }
          ]
        }
      }
    ]);

    // Extract results
    const allTime = stats[0].allTimeStats[0] || { totalVisits: 0, uniqueIPs: [] };
    const todayData = stats[0].todayStats[0] || { todayVisits: 0, todayUniqueIPs: [] };

    // Update or create stats document
    await VisitorStats.findOneAndUpdate(
      { date: today },
      {
        date: today,
        totalAllTime: allTime.totalVisits,
        visitorsToday: todayData.todayVisits,
        uniqueIPs: allTime.uniqueIPs.length,
        uniqueIPsToday: todayData.todayUniqueIPs.length,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log('✅ Stats updated:', {
      totalVisits: allTime.totalVisits,
      todayVisits: todayData.todayVisits,
      uniqueIPs: allTime.uniqueIPs.length,
      todayUnique: todayData.todayUniqueIPs.length,
    });
  } catch (error) {
    console.error('❌ Error updating visitor stats:', error.message);
    throw error;
  }
};

/**
 * Get comprehensive visitor statistics
 * Returns accurate counts with multiple formats for compatibility
 */
const getVisitorStats = async (req, res) => {
  try {
    const today = getStartOfDayUTC();

    // Use single aggregation for efficiency
    const stats = await Visitor.aggregate([
      {
        $facet: {
          allTime: [
            {
              $group: {
                _id: null,
                totalVisits: { $sum: 1 },
                uniqueIPs: { $addToSet: '$ip' }
              }
            }
          ],
          todayData: [
            {
              $match: { visitDate: today }
            },
            {
              $group: {
                _id: null,
                todayVisits: { $sum: 1 },
                todayUniqueIPs: { $addToSet: '$ip' }
              }
            }
          ]
        }
      }
    ]);

    // Extract results safely
    const allTimeStats = stats[0].allTime[0];
    const todayStats = stats[0].todayData[0];

    const totalVisits = allTimeStats?.totalVisits || 0;
    const uniqueAllTime = allTimeStats?.uniqueIPs?.length || 0;
    const todayVisits = todayStats?.todayVisits || 0;
    const uniqueToday = todayStats?.todayUniqueIPs?.length || 0;

    // Prepare response with legacy and new formats
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        // Detailed format
        allTime: {
          totalVisits,
          uniqueVisitors: uniqueAllTime,
        },
        today: {
          visits: todayVisits,
          uniqueVisitors: uniqueToday,
        },
        // Legacy format (for compatibility)
        total: totalVisits,
        today: todayVisits,
        unique: uniqueAllTime,
        todayUnique: uniqueToday,
        hasData: totalVisits > 0,
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Error fetching visitor stats:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visitor stats',
      data: {
        total: 0,
        today: 0,
        unique: 0,
        todayUnique: 0,
        hasData: false,
      },
    });
  }
};

/**
 * Get detailed analytics dashboard data
 */
const getDetailedAnalytics = async (req, res) => {
  try {
    const today = getStartOfDayUTC();
    const lastWeek = new Date(today);
    lastWeek.setUTCDate(lastWeek.getUTCDate() - 7);

    // Visitors last 7 days
    const last7Days = await Visitor.countDocuments({
      createdAt: { $gte: lastWeek },
    });

    // Top pages with limit
    const topPages = await Visitor.aggregate([
      { $group: { _id: '$page', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { page: '$_id', count: 1, _id: 0 } }
    ]);

    // Top referrers with limit
    const topReferrers = await Visitor.aggregate([
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { referrer: '$_id', count: 1, _id: 0 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        last7Days,
        topPages,
        topReferrers,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
    });
  }
};

/**
 * Reset all visitor data (admin only) ⚠️
 * WARNING: This deletes all visitor records permanently
 */
const resetVisitorStats = async (req, res) => {
  try {
    // Double check before deletion
    const count = await Visitor.countDocuments();
    
    if (count === 0) {
      return res.status(200).json({
        success: true,
        message: 'No data to reset',
        data: {
          total: 0,
          today: 0,
          unique: 0,
          todayUnique: 0,
          deletedCount: 0,
        },
      });
    }

    // Delete all records
    const deleteResult = await Visitor.deleteMany({});
    await VisitorStats.deleteMany({});

    console.log(`🔄 Deleted ${deleteResult.deletedCount} visitor records`);

    res.status(200).json({
      success: true,
      message: 'Visitor stats reset successfully',
      data: {
        total: 0,
        today: 0,
        unique: 0,
        todayUnique: 0,
        deletedCount: deleteResult.deletedCount,
      },
    });
  } catch (error) {
    console.error('❌ Error resetting visitor stats:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to reset visitor stats',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error',
    });
  }
};

/**
 * Get daily visitor breakdown (for charts/analytics)
 */
const getDailyBreakdown = async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days || 30), 365); // Max 365 days
    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - days);
    startDate.setUTCHours(0, 0, 0, 0);

    const breakdown = await Visitor.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          visits: { $sum: 1 },
          uniqueIPs: { $addToSet: '$ip' },
        },
      },
      {
        $project: {
          date: '$_id',
          visits: 1,
          uniqueVisitors: { $size: '$uniqueIPs' },
          _id: 0,
        },
      },
      { $sort: { date: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: breakdown,
      daysRequested: days,
      daysReturned: breakdown.length,
    });
  } catch (error) {
    console.error('❌ Error fetching daily breakdown:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily breakdown',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error',
    });
  }
};

module.exports = {
  trackVisitor,
  getVisitorStats,
  getDetailedAnalytics,
  getDailyBreakdown,
  resetVisitorStats,
};