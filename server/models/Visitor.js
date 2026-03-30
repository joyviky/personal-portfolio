const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    ip: String,
    userAgent: String,
    referrer: String,
    page: String,
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visitor', visitorSchema);