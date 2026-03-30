const Profile = require('../models/Profile');

const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();

    if (!profile) {
      // Create default profile in Atlas on first access
      profile = await Profile.create({
        name: 'Vignesh',
        title: 'Full Stack Developer',
        roles: ['Software Engineer', 'Full Stack Developer', 'Creative Coder'],
        bio: 'Crafting digital experiences that merge exceptional design with flawless engineering. I specialize in building scalable MERN stack applications with pixel-perfect user interfaces.',
        avatar: 'https://ui-avatars.com/api/?name=Vignesh&background=4f46e5&color=fff&size=256&font-size=0.4',
        socials: {
          github: 'https://github.com',
          linkedin: 'https://linkedin.com',
          email: 'vignesh@example.com'
        }
      });
      console.log('✅ Default profile created in MongoDB Atlas');
    }

    res.json(profile);
  } catch (error) {
    console.error('❌ Error fetching profile:', error.message);
    res.status(500).json({ message: 'Failed to fetch profile from database', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, title, roles, bio, socials, headerText } = req.body;

    let profile = await Profile.findOne();

    if (!profile) {
      profile = new Profile({});
    }

    if (name) profile.name = name;
    if (title) profile.title = title;
    if (roles) profile.roles = roles;
    if (bio) profile.bio = bio;
    if (socials) profile.socials = socials;
    if (headerText) profile.headerText = headerText;
    if (req.file) {
      profile.avatar = req.file.secure_url || req.file.path;
    } else if (req.body.avatar !== undefined) {
      profile.avatar = req.body.avatar;
    }
    if (req.body.backgroundImage !== undefined) {
      profile.backgroundImage = req.body.backgroundImage;
    }

    const savedProfile = await profile.save();
    console.log('✅ Profile updated in MongoDB Atlas');
    res.json(savedProfile);
  } catch (error) {
    console.error('❌ Error updating profile:', error.message);
    res.status(500).json({ message: 'Failed to update profile in database', error: error.message });
  }
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile({});
    }

    profile.resumePDF = {
      url: req.file.secure_url || req.file.path,
      uploadedAt: new Date(),
    };
    profile.resumeUrl = req.file.secure_url || req.file.path;

    const savedProfile = await profile.save();
    console.log('✅ Resume uploaded and saved to MongoDB Atlas');
    res.json({ message: 'Resume uploaded successfully', profile: savedProfile });
  } catch (error) {
    console.error('❌ Error uploading resume:', error.message);
    res.status(500).json({ message: 'Failed to upload resume', error: error.message });
  }
};

module.exports = { getProfile, updateProfile, uploadResume };
