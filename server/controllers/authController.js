const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const login = async (req, res) => {
  try {
    // Validate JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Validate email format basic check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if admin exists in MongoDB Atlas
    let admin = await Admin.findOne({ email });

    // If no admin in DB, create default admin on first login
    if (!admin && email === 'admin@portfolio.com') {
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD;
      if (!defaultPassword) {
        console.error('❌ ADMIN_DEFAULT_PASSWORD is not defined');
        return res.status(500).json({ message: 'Server configuration error' });
      }

      // Verify password matches configured default
      if (password !== defaultPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check again to prevent race condition
      admin = await Admin.findOne({ email });
      if (!admin) {
        try {
          const hashedPassword = await bcrypt.hash(defaultPassword, 12);
          admin = await Admin.create({
            email: 'admin@portfolio.com',
            password: hashedPassword,
            name: 'Admin',
          });
          console.log('✅ Default admin created in MongoDB Atlas');
        } catch (createError) {
          // Handle duplicate key error if another request created it first
          if (createError.code === 11000) {
            admin = await Admin.findOne({ email });
          } else {
            throw createError;
          }
        }
      }
    }

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Always use bcrypt.compare for password validation 
    const isPasswordValid = await bcrypt.compare(password, admin.password);

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
