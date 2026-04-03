const mongoose = require('mongoose');

// Individual visitor record schema
const visitorSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      minlength: 6,
      maxlength: 50,
      index: true, // Index for fast IP lookups
      validate: {
        validator: function (v) {
          // Basic IPv4 and IPv6 validation
          return /^[\d.]+$|^[a-f0-9:]+$|^unknown$/.test(v);
        },
        message: 'Invalid IP address format',
      },
    },
    userAgent: {
      type: String,
      maxlength: 500,
      default: 'Unknown',
    },
    referrer: {
      type: String,
      maxlength: 500,
      default: 'Direct',
    },
    page: {
      type: String,
      maxlength: 200,
      default: '/',
      index: true,
    },
    // Track visit date for daily reset (UTC)
    visitDate: {
      type: Date,
      required: true,
      default: () => {
        const date = new Date();
        date.setUTCHours(0, 0, 0, 0);
        return date;
      },
      index: true,
    },
    country: String,
    city: String,
    // Track if this was a successful entry
    isTracked: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true,
    // Automatically delete old records after 90 days for storage optimization
    expires: 90 * 24 * 60 * 60 
  }
);

// Compound indexes for better query performance
visitorSchema.index({ ip: 1, createdAt: -1 }); // For duplicate checking
visitorSchema.index({ visitDate: 1, ip: 1 }); // For daily unique IPs
visitorSchema.index({ page: 1, visitDate: 1 }); // For page tracking
visitorSchema.index({ createdAt: -1 }); // For sorting by creation time

// Visitor tracking stats schema - for aggregate data
const visitorStatsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true,
      default: () => {
        const date = new Date();
        date.setUTCHours(0, 0, 0, 0);
        return date;
      },
    },
    totalAllTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    visitorsToday: {
      type: Number,
      default: 0,
      min: 0,
    },
    uniqueIPs: {
      type: Number,
      default: 0,
      min: 0,
    },
    uniqueIPsToday: {
      type: Number,
      default: 0,
      min: 0,
    },
    pageViews: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { 
    timestamps: true 
  }
);

visitorStatsSchema.index({ date: -1 });

// Create models
const Visitor = mongoose.model('Visitor', visitorSchema);
const VisitorStats = mongoose.model('VisitorStats', visitorStatsSchema);

module.exports = {
  Visitor,
  VisitorStats,
};