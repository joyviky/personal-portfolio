const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    data: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
