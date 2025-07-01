const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const routes = require("./routes");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Verify environment variables
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not defined in environment variables");
  process.exit(1);
}

// Verify Cloudinary environment variables
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error(
    "Cloudinary credentials are not properly configured in environment variables"
  );
  console.error(
    "Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set"
  );
  process.exit(1);
}

// Initialize express
const app = express();

// Connect to MongoDB
connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
  process.exit(1);
});

// Ensure temp directory exists
const tempDir = path.join(__dirname, "public", "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://local-lens-skvi.vercel.app",
  process.env.FRONTEND_URL,
  "https://local-lens-skvi-iqlabwnaq-xfactor1289-4763s-projects.vercel.app",
  "https://local-lens-skvi-git-main-xfactor1289-4763s-projects.vercel.app",
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('Blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use("/public", express.static(path.join(__dirname, "public")));

// Mount all routes under /api
app.use("/api", routes);

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "LocalLens API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something broke!",
    error: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
let server;

// Start server
const startServer = async () => {
  try {
    server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log("Environment variables loaded:");
      console.log("- MONGODB_URI is set:", !!process.env.MONGODB_URI);
      console.log("- JWT_SECRET is set:", !!process.env.JWT_SECRET);
      console.log(
        "- CLOUDINARY_CLOUD_NAME is set:",
        !!process.env.CLOUDINARY_CLOUD_NAME
      );
      console.log(
        "- CLOUDINARY_API_KEY is set:",
        !!process.env.CLOUDINARY_API_KEY
      );
      console.log(
        "- CLOUDINARY_API_SECRET is set:",
        !!process.env.CLOUDINARY_API_SECRET
      );
      console.log("- FRONTEND_URL is set:", !!process.env.FRONTEND_URL);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  if (server) {
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  shutdown();
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  shutdown();
});

// Start the server
startServer();

// Export for Vercel
module.exports = app;
