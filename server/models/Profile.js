const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Vignesh',
    },
    title: {
      type: String,
      default: 'Full Stack Developer',
    },
    roles: [String],
    bio: {
      type: String,
      default: 'Crafting digital experiences that merge exceptional design with flawless engineering.',
    },
    avatar: String,
    backgroundImage: String,
    headerText: String,
    socials: {
      github: String,
      linkedin: String,
      twitter: String,
      email: String,
    },
    resumeUrl: String,
    resumePDF: {
      url: String,
      uploadedAt: Date,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
