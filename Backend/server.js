const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const routes = require('./routes');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Verify environment variables
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

// Verify Cloudinary environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Cloudinary credentials are not properly configured in environment variables');
  console.error('Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set');
  process.exit(1);
}

// Initialize express
const app = express();

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'public', 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// CORS setup
const allowedOrigins = [
  'http://localhost:5173', // Local development
  'https://local-lens.vercel.app', // Production frontend (update this)
  process.env.FRONTEND_URL, // From environment variable
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Mount all routes under /api
app.use('/api', routes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'LocalLens API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something broke!', 
    error: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
let server;

// Start server
const startServer = async () => {
  try {
    server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Environment variables loaded:');
      console.log('- MONGODB_URI is set:', !!process.env.MONGODB_URI);
      console.log('- JWT_SECRET is set:', !!process.env.JWT_SECRET);
      console.log('- CLOUDINARY_CLOUD_NAME is set:', !!process.env.CLOUDINARY_CLOUD_NAME);
      console.log('- CLOUDINARY_API_KEY is set:', !!process.env.CLOUDINARY_API_KEY);
      console.log('- CLOUDINARY_API_SECRET is set:', !!process.env.CLOUDINARY_API_SECRET);
      console.log('- FRONTEND_URL is set:', !!process.env.FRONTEND_URL);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown();
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  shutdown();
});

// Start the server
startServer();

// Export for Vercel
module.exports = app;