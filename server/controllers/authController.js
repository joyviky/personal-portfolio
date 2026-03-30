const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if admin exists in MongoDB Atlas
    let admin = await Admin.findOne({ email });

    // If no admin in DB, create default admin on first login
    if (!admin && email === 'admin@portfolio.com' && password === (process.env.ADMIN_DEFAULT_PASSWORD || 'admin123')) {
      const hashedPassword = await bcrypt.hash(password, 12);
      admin = await Admin.create({
        email: 'admin@portfolio.com',
        password: hashedPassword,
        name: 'Admin',
      });
      console.log('✅ Default admin created in MongoDB Atlas');
    }

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For the auto-created admin, check plain password since we just created it
    let isPasswordValid;
    if (admin.isNew) {
      isPasswordValid = true; // Just created above
    } else {
      isPasswordValid = await bcrypt.compare(password, admin.password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log('✅ Admin logged in from MongoDB Atlas:', admin.email);
    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error('❌ Error during login:', error.message);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    console.error('❌ Error fetching admin:', error.message);
    res.status(500).json({ message: 'Failed to fetch admin', error: error.message });
  }
};

module.exports = {
  login,
  getCurrentAdmin
};
