const mongoose = require('mongoose');

const leetcodeStatsSchema = new mongoose.Schema(
  {
    username: String,
    totalSolved: Number,
    easy: Number,
    medium: Number,
    hard: Number,
    acceptanceRate: String,
    ranking: String,
    topPercentage: String,
    languages: String,
    streak: Number,
    lastFetched: Date,
    nextFetchTime: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeetCodeStats', leetcodeStatsSchema);
