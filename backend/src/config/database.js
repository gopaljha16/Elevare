const mongoose = require('mongoose');
const { optimizeConnectionPool, createIndexes, monitorSlowQueries } = require('../utils/dbOptimization');

const connectDB = async () => {
  try {
    // Get optimized connection options
    const connectionOptions = optimizeConnectionPool();

    const conn = await mongoose.connect(process.env.DATABASE_URL, connectionOptions);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Create indexes for better performance
    await createIndexes();

    // Enable slow query monitoring in development
    if (process.env.NODE_ENV === 'development') {
      monitorSlowQueries();
    }

    // Connection event handlers
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;