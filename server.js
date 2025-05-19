const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const photoRoutes = require('./routes/photos');
const blogRoutes = require('./routes/blogs');
const authRoutes = require('./routes/auth');

// Load environment variables
dotenv.config();

if (!process.env.JWT_SECRET || !process.env.MONGODB_URI) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

console.log('✅ Loaded JWT_SECRET in server.js');

// Initialize Express
const app = express();

// Middleware
app.use(cors({ origin: 'https://eclectic-rugelach-e6de8e.netlify.app/' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/photos', photoRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/auth', authRoutes);

// Default API status route
app.get('/api', (req, res) => {
  res.json({ message: 'API is running 🚀' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: '❌ Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// MongoDB connection and server start
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
