const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Log connection attempt (with redacted URI)
    const redactedUri = process.env.MONGODB_URI
      ? process.env.MONGODB_URI.replace(/:\/\/(.[^:]+):(.+)@/, '://***:***@')
      : 'undefined';
    console.log('Attempting MongoDB connection with URI:', redactedUri);

    // Connection options
    const options = {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      maxPoolSize: 50,
      minPoolSize: 10
    };

    await mongoose.connect(process.env.MONGODB_URI, options);

    // Log successful connection details
    console.log('MongoDB Connected:', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      readyState: mongoose.connection.readyState,
      name: mongoose.connection.name
    });

    // Set up connection error handler
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    // Set up disconnection handler
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    return mongoose.connection;
  } catch (error) {
    // Enhanced error logging
    console.error('MongoDB connection error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName,
      stack: error.stack
    });

    if (error.name === 'MongoParseError') {
      console.error('Invalid MongoDB connection string. Please check your MONGODB_URI environment variable.');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB server. Please check:');
      console.error('1. MongoDB server is running and accessible');
      console.error('2. Network/firewall settings allow connection');
      console.error('3. Database user has correct permissions');
    }

    process.exit(1);
  }
};

module.exports = connectDB;
