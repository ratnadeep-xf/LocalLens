const connectDB = require("../config/db");

const ensureDb = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database unavailable:", error.message);
    res.status(503).json({
      message: "Database unavailable. Please try again.",
      error: error.message,
    });
  }
};

module.exports = ensureDb;
