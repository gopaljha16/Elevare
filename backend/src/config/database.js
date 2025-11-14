const mongoose = require('mongoose');
const { optimizeConnectionPool, createIndexes, monitorSlowQueries } = require('../utils/dbOptimization');

const connectDB = async () => {
  console.log('\n=== Database Connection ===');
  console.log('🔌 Attempting to connect to MongoDB...');
  
  // Validate DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.error('   Please set DATABASE_URL in your environment configuration');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return;
  }
  
  // Log connection info (masked)
  const dbUrl = process.env.DATABASE_URL;
  const maskedUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log('📍 Database URL:', maskedUrl);
  
  try {
    // Get optimized connection options
    const connectionOptions = optimizeConnectionPool();
    console.log('⚙️  Connection options:', {
      maxPoolSize: connectionOptions.maxPoolSize,
      minPoolSize: connectionOptions.minPoolSize,
      serverSelectionTimeoutMS: connectionOptions.serverSelectionTimeoutMS
    });

    const startTime = Date.now();
    const conn = await mongoose.connect(process.env.DATABASE_URL, connectionOptions);
    const connectionTime = Date.now() - startTime;

    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Connection Time: ${connectionTime}ms`);
    console.log(`   Ready State: ${conn.connection.readyState} (1 = connected)`);
    console.log('===========================\n');

    // Create indexes for better performance
    console.log('📑 Creating database indexes...');
    await createIndexes();
    console.log('✅ Database indexes created\n');

    // Enable slow query monitoring in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🐌 Enabling slow query monitoring...');
      monitorSlowQueries();
    }

    // Connection event handlers
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error.message);
      console.error('   Error details:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected - attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

    mongoose.connection.on('reconnectFailed', () => {
      console.error('❌ MongoDB reconnection failed');
    });

  } catch (error) {
    console.error('\n❌ Database Connection Failed!');
    console.error('   Error:', error.message);
    console.error('   Error Code:', error.code);
    console.error('   Error Name:', error.name);
    
    // Provide helpful error messages
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check if DATABASE_URL is correct');
      console.error('   - Verify network connectivity');
      console.error('   - Ensure MongoDB server is running');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check database username and password');
      console.error('   - Verify user has correct permissions');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Database server may be slow or unreachable');
      console.error('   - Check firewall settings');
      console.error('   - Verify IP whitelist in MongoDB Atlas');
    }
    
    console.error('\n   Full error stack:');
    console.error(error.stack);
    console.error('===========================\n');
    
    if (process.env.NODE_ENV === 'production') {
      console.error('🛑 Exiting due to database connection failure in production');
      process.exit(1);
    }
  }
};

module.exports = connectDB;