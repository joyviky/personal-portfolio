const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Trust proxy - important for accurate IP tracking
app.set('trust proxy', 1);

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/leetcode', require('./routes/leetcode'));
app.use('/api/visitors', require('./routes/visitors'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', db: 'MongoDB Atlas connected' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Connect to MongoDB Atlas FIRST, then start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB(); // Must connect before accepting requests
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
};

startServer();
