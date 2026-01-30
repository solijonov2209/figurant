const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const personRoutes = require('./routes/personRoutes');
const districtRoutes = require('./routes/districtRoutes');
const crimeTypeRoutes = require('./routes/crimeTypeRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server ishlayapti'
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/persons', personRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/crime-types', crimeTypeRoutes);
app.use('/api/users', userRoutes);

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route topilmadi'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server ishlayapti: http://localhost:${PORT}`);
  console.log(`Muhit: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
