const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
