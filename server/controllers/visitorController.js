const Visitor = require('../models/Visitor');

const trackVisitor = async (req, res) => {
  try {
    const { page } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const referrer = req.get('Referrer');

    const visitor = new Visitor({
      ip,
      userAgent,
      referrer,
      page: page || '/',
    });

    await visitor.save();
    res.status(200).json({ message: 'Visitor tracked' });
  } catch (error) {
    console.error('Visitor tracking error:', error);
    res.status(500).json({ message: 'Tracking failed' });
  }
};

const getVisitorStats = async (req, res) => {
  try {
    const totalVisitors = await Visitor.countDocuments();
    const todayVisitors = await Visitor.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    const uniqueIPs = await Visitor.distinct('ip').then(ips => ips.length);

    res.json({
      total: totalVisitors,
      today: todayVisitors,
      unique: uniqueIPs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { trackVisitor, getVisitorStats };