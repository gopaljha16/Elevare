const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Remove deprecated options - they're not needed in newer versions
    const conn = await mongoose.connect(process.env.DATABASE_URL);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;