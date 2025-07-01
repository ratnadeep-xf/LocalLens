const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Log the MongoDB URI (with sensitive parts redacted)
    const redactedUri = process.env.MONGODB_URI
      ? process.env.MONGODB_URI.replace(/:\/\/(.[^:]+):(.+)@/, '://***:***@')
      : 'undefined';
    console.log('Attempting MongoDB connection with URI:', redactedUri);

    // Set mongoose connection options
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // Timeout after 15 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 15000, // Give up initial connection after 15 seconds
      maxPoolSize: 50, // Maintain up to 50 socket connections
      minPoolSize: 10, // Maintain at least 10 socket connections
      maxIdleTimeMS: 60000, // Close idle connections after 60 seconds
      retryWrites: true, // Retry write operations on connection loss
      retryReads: true // Retry read operations on connection loss
    });

    // Log successful connection
    console.log('MongoDB Connected Successfully:', {
      host: conn.connection.host,
      port: conn.connection.port,
      name: conn.connection.name,
      readyState: conn.connection.readyState
    });

    // Handle connection events
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    
    // If this is a connection timeout, provide more specific error
    if (error.name === 'MongooseServerSelectionError') {
      console.error('Could not connect to MongoDB server. Please check:');
      console.error('1. MongoDB connection string is correct');
      console.error('2. MongoDB server is running and accessible');
      console.error('3. Network/firewall settings allow connection');
      console.error('4. MongoDB Atlas IP whitelist includes Vercel deployment IPs');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
