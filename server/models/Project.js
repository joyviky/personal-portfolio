const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: String,
    image: {
      type: String,
      default: '',
    },
    images: [String],
    category: {
      type: String,
      enum: ['MERN', 'Frontend', 'Backend', 'Full Stack', 'Mobile', 'Other'],
      default: 'Full Stack',
    },
    tags: [String],
    liveLink: String,
    githubLink: String,
    demoVideo: String,
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['In Progress', 'Completed', 'Paused'],
      default: 'Completed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
