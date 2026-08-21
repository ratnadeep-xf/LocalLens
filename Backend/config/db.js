const mongoose = require("mongoose");

const globalCache = global;
if (!globalCache._mongoose) {
  globalCache._mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const cached = globalCache._mongoose;
  const state = mongoose.connection.readyState;

  // 1 = connected
  if (cached.conn && state === 1) {
    return cached.conn;
  }

  // 0 = disconnected, 3 = disconnecting — drop stale cache and reconnect
  if (state === 0 || state === 3) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const isServerless = Boolean(process.env.VERCEL);
    const redactedUri = process.env.MONGODB_URI
      ? process.env.MONGODB_URI.replace(/:\/\/(.[^:]+):(.+)@/, "://***:***@")
      : "undefined";
    console.log("Attempting MongoDB connection with URI:", redactedUri);

    const options = {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      maxPoolSize: isServerless ? 5 : 50,
      minPoolSize: isServerless ? 0 : 10,
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, options)
      .then((connection) => {
        console.log("MongoDB Connected:", {
          host: connection.connection.host,
          port: connection.connection.port,
          readyState: connection.connection.readyState,
          name: connection.connection.name,
        });
        return connection;
      })
      .catch((error) => {
        cached.promise = null;
        console.error("MongoDB connection error:", {
          name: error.name,
          message: error.message,
          code: error.code,
          codeName: error.codeName,
        });
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
