const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const photoRoutes = require('./routes/photos');
const blogRoutes = require('./routes/blogs');
const authRoutes = require('./routes/auth');

// Load environment variables
dotenv.config();
console.log('Loaded JWT_SECRET in server.js:', process.env.JWT_SECRET);

// Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://eclectic-rugelach-e6de8e.netlify.app'
];

// Configure CORS
const app = express();
app.use(cors({
  origin: (origin, callback) => {
    console.log('CORS check - Request Origin:', origin);
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      console.log('CORS allowed for origin:', origin);
      return callback(null, true);
    } else {
      console.log(`CORS error: Origin ${origin} not allowed`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin} - Headers:`, req.headers);
  next();
});

// Routes
app.use('/api/photos', photoRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/auth', authRoutes);

// Test route to confirm server is running
app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS error: Origin not allowed' });
  }
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected to:', process.env.MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
