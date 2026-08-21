const dotenv = require("dotenv");
// Must run before any local require that transitively loads utils/redis.js
dotenv.config();

const express = require("express");
const cookieParser = require("cookie-parser");
const http = require("node:http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const ensureDb = require("./middleware/db.middleware");
const path = require("node:path");
const fs = require("node:fs");
const cors = require("cors");

const isVercel = Boolean(process.env.VERCEL);

const failFast = (message) => {
  console.error(message);
  // process.exit in a Vercel serverless function kills the instance so even
  // OPTIONS preflight returns 500 with no CORS headers.
  if (!isVercel) {
    process.exit(1);
  }
};

// Verify environment variables
if (!process.env.MONGODB_URI) {
  failFast("MONGODB_URI is not defined in environment variables");
}

if (!process.env.JWT_SECRET) {
  failFast("JWT_SECRET is not defined in environment variables");
}

// Verify Cloudinary environment variables
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  failFast(
    "Cloudinary credentials are not properly configured in environment variables"
  );
}

// Verify Upstash Redis environment variables
if (!process.env.UPSTASH_REDIS_REST_URL) {
  failFast("UPSTASH_REDIS_REST_URL is not defined in environment variables");
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  failFast("UPSTASH_REDIS_REST_TOKEN is not defined in environment variables");
}

// Load routes only after env is validated — avoids Upstash client
// instantiation with undefined/empty credentials when fail-fasting
const routes = require("./routes");

// Initialize express
const app = express();

// Trust first proxy (Render / Vercel) so req.ip reflects the real client IP
app.set("trust proxy", 1);

// On long-running hosts, connect at boot. On Vercel, connect per request
// via ensureDb so queries never run while Mongoose is still buffering.

// Create temp directory only in development environment
if (process.env.NODE_ENV === "development") {
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
  "http://localhost:3000",
  "https://local-lens-skvi.vercel.app",
  process.env.FRONTEND_URL?.replace(/\/$/, ""),
  "https://local-lens-skvi-iqlabwnaq-xfactor1289-4763s-projects.vercel.app",
  "https://local-lens-skvi-git-main-xfactor1289-4763s-projects.vercel.app",
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== "https:") return false;
    if (hostname === "local-lens-skvi.vercel.app") return true;
    if (
      hostname.startsWith("local-lens-skvi-") &&
      hostname.endsWith(".vercel.app")
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    // Never pass an Error here: it becomes a 500 with no CORS headers,
    // which the browser reports as a CORS failure instead of the real cause.
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.log("Blocked origin:", origin);
    console.log("Allowed origins:", allowedOrigins);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400,
};

const applyCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      corsOptions.methods.join(",")
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      corsOptions.allowedHeaders.join(",")
    );
    res.setHeader("Access-Control-Max-Age", String(corsOptions.maxAge));
    res.setHeader("Vary", "Origin");
  }
};

app.use((req, res, next) => {
  // On Vercel, CORS is applied in vercel.json so platform timeouts/413s
  // still include Access-Control-Allow-Origin. Express must not set it
  // again or browsers reject the duplicated header.
  if (!isVercel) {
    applyCorsHeaders(req, res);
  }
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

if (!isVercel) {
  app.use(cors(corsOptions));
}

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Serve static files only in development
if (process.env.NODE_ENV === "development") {
  app.use("/public", express.static(path.join(__dirname, "public")));
}

// Mount all routes under /api
app.use("/api", ensureDb, routes);

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "LocalLens API is running" });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  if (!isVercel) {
    applyCorsHeaders(req, res);
  }

  // Log the full error details
  console.error("Error details:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers,
  });

  if (err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image must be smaller than 4MB"
        : "File upload error";
    return res.status(400).json({
      message,
      error: err.message,
      type: "MulterError",
    });
  }

  // Send appropriate error response
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation error",
      errors: Object.values(err.errors).map((e) => e.message),
      type: "ValidationError",
    });
  }

  if (err.name === "MongoError" || err.name === "MongoServerError") {
    return res.status(500).json({
      message: "Database error",
      error: err.message,
      type: "DatabaseError",
    });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Authentication error",
      error: err.message,
      type: "AuthError",
    });
  }

  // Default error response
  res.status(500).json({
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "An unexpected error occurred",
    type: err.name || "UnknownError",
  });
});

// Enhanced 404 handler
app.use((req, res) => {
  if (!isVercel) {
    applyCorsHeaders(req, res);
  }

  console.log("404 Not Found:", {
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  res.status(404).json({
    message: "Route not found",
    path: req.path,
    method: req.method,
  });
});

const PORT = process.env.PORT || 5000;
let server;
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin));
    },
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

app.io = io;

// Start server
const startServer = async () => {
  try {
    await connectDB();
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
    if (!isVercel) {
      process.exit(1);
    }
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

if (!isVercel) {
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    shutdown();
  });

  process.on("unhandledRejection", (error) => {
    console.error("Unhandled Rejection:", error);
    shutdown();
  });

  startServer();
} else {
  console.log("Running on Vercel — skipping httpServer.listen()");
  console.log("Allowed CORS origins:", allowedOrigins);
}

// Export for Vercel
module.exports = app;
