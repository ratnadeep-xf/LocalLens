const dotenv = require("dotenv");
// Must run before any local require that transitively loads utils/redis.js
dotenv.config();

const express = require("express");
const cookieParser = require("cookie-parser");
const http = require("node:http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const path = require("node:path");
const fs = require("node:fs");
const cors = require("cors");

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

// Verify Upstash Redis environment variables
if (!process.env.UPSTASH_REDIS_REST_URL) {
  console.error("UPSTASH_REDIS_REST_URL is not defined in environment variables");
  process.exit(1);
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error("UPSTASH_REDIS_REST_TOKEN is not defined in environment variables");
  process.exit(1);
}

// Load routes only after env is validated — avoids Upstash client
// instantiation with undefined/empty credentials when fail-fasting
const routes = require("./routes");

// Initialize express
const app = express();

// Trust first proxy (Render) so req.ip reflects the real client IP
app.set("trust proxy", 1);

// Connect to MongoDB
connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
  process.exit(1);
});

// Create temp directory only in development environment
if (process.env.NODE_ENV === 'development') {
  const tempDir = path.join(__dirname, "public", "temp");
  if (!fs.existsSync(tempDir)) {
    try {
      fs.mkdirSync(tempDir, { recursive: true });
    } catch (err) {
      console.warn("Warning: Could not create temp directory:", err.message);
      // Don't exit process, as this is not critical in production
    }
  }
}

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://local-lens-skvi.vercel.app",
  process.env.FRONTEND_URL,
  "https://local-lens-skvi-iqlabwnaq-xfactor1289-4763s-projects.vercel.app",
  "https://local-lens-skvi-git-main-xfactor1289-4763s-projects.vercel.app",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    console.log('Request origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Allowing request with no origin');
      return callback(null, true);
    }

    if (!allowedOrigins.includes(origin)) {
      console.log('Blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }

    console.log('Allowing origin:', origin);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight request for 10 minutes
};

app.use(cors(corsOptions));

// Add OPTIONS handling for all routes
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Serve static files only in development
if (process.env.NODE_ENV === 'development') {
  app.use("/public", express.static(path.join(__dirname, "public")));
}

// Mount all routes under /api
app.use("/api", routes);

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "LocalLens API is running" });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  // Log the full error details
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers,
  });

  // Send appropriate error response
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message),
      type: 'ValidationError'
    });
  }

  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      message: 'Database error',
      error: err.message,
      type: 'DatabaseError'
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Authentication error',
      error: err.message,
      type: 'AuthError'
    });
  }

  // Default error response
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    type: err.name || 'UnknownError'
  });
});

// Enhanced 404 handler
app.use((req, res) => {
  console.log('404 Not Found:', {
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
  });
  
  res.status(404).json({ 
    message: "Route not found",
    path: req.path,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;
let server;
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: corsOptions.methods,
    allowedHeaders: corsOptions.allowedHeaders,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join:article", (articleId) => {
    socket.join(`room:${articleId}`);
  });

  socket.on("leave:article", (articleId) => {
    socket.leave(`room:${articleId}`);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", socket.id, reason);
  });
});

// Start server
const startServer = async () => {
  try {
    server = httpServer.listen(PORT, () => {
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
      console.log("- NODE_ENV:", process.env.NODE_ENV);
      console.log("Allowed CORS origins:", allowedOrigins);
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
app.io = io;
