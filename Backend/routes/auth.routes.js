const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Publisher } = require("../models");
const {
  authLimiter,
  rateLimitMiddleware,
} = require("../middleware/rateLimit.middleware");

// Verify token endpoint
router.get("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "reader") {
      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({
        role: "reader",
        userId: user._id,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          preferredRegions: user.preferredRegions,
        },
      });
    } else if (decoded.role === "publisher") {
      const publisher = await Publisher.findOne({ email: decoded.email });
      if (!publisher) {
        return res.status(404).json({ message: "Publisher not found" });
      }
      return res.json({
        role: "publisher",
        publisherId: publisher._id,
        publisher: {
          id: publisher._id,
          agencyName: publisher.agencyName,
          email: publisher.email,
          regions: publisher.regions,
          contactPerson: publisher.contactPerson,
          phone: publisher.phone,
        },
      });
    }

    return res.status(401).json({ message: "Invalid token" });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    res
      .status(500)
      .json({ message: "Error verifying token", error: error.message });
  }
});

// User Registration
router.post("/user-register", async (req, res) => {
  try {
    const { name, email, password, preferredRegions } = req.body;

    // Log the received data (excluding password)
    console.log("Registration attempt:", {
      name,
      email,
      preferredRegions,
      bodyKeys: Object.keys(req.body),
    });

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
        missing: {
          name: !name,
          email: !email,
          password: !password,
        },
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password, // Will be hashed by the model middleware
      preferredRegions: Array.isArray(preferredRegions) ? preferredRegions : [],
    });

    // Log the user object (excluding password)
    console.log("User object created:", {
      name: user.name,
      email: user.email,
      preferredRegions: user.preferredRegions,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, role: "reader" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredRegions: user.preferredRegions,
        role: user.role,
      },
    });
  } catch (error) {
    // Enhanced error logging
    console.error("User registration error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code, // MongoDB error code if present
    });

    // Send appropriate error response
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res.status(400).json({ message: "Email already exists" });
    }

    res.status(500).json({
      message: "Error registering user",
      error: error.message,
      type: error.name,
    });
  }
});

// User Login - matches frontend /user-login
router.post(
  "/user-login",
  rateLimitMiddleware(authLimiter, (req) => `user-login:${req.ip}`),
  async (req, res) => {

  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, role: "reader" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredRegions: user.preferredRegions,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
  }
);

// Publisher Registration
router.post("/publisher-register", async (req, res) => {
  try {
    const { agencyName, email, password, regions, contactPerson, phone } =
      req.body;

    // Check if publisher already exists
    const existingPublisher = await Publisher.findOne({
      email,
    });
    if (existingPublisher) {
      return res.status(400).json({ message: "Publisher already exists" });
    }

    // Create new publisher
    const publisher = new Publisher({
      agencyName,
      email,
      password, // Will be hashed by the model middleware
      regions,
      contactPerson,
      phone,
    });

    await publisher.save();

    // Generate JWT token
    const token = jwt.sign(
      { email: publisher.email, role: "publisher" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Publisher registered successfully",
      token,
      publisher: {
        id: publisher._id,
        agencyName: publisher.agencyName,
        email: publisher.email,
        regions: publisher.regions,
        contactPerson: publisher.contactPerson,
        phone: publisher.phone,
        role: publisher.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering publisher", error: error.message });
  }
});

// Publisher Login - matches frontend /publisher-login
router.post(
  "/publisher-login",
  rateLimitMiddleware(authLimiter, (req) => `publisher-login:${req.ip}`),
  async (req, res) => {

  try {
    const { email, password } = req.body;

    // Find publisher
    const publisher = await Publisher.findOne({ email });
    if (!publisher) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await publisher.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Wrong password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: publisher.email, role: "publisher" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      publisher: {
        id: publisher._id,
        agencyName: publisher.agencyName,
        email: publisher.email,
        regions: publisher.regions,
        contactPerson: publisher.contactPerson,
        phone: publisher.phone,
        role: publisher.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
  }
);

module.exports = router;
