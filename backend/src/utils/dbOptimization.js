const mongoose = require('mongoose');

/**
 * Database optimization utilities
 */

/**
 * Create database indexes for better query performance
 */
const createIndexes = async () => {
  try {
    console.log('Creating database indexes...');
    
    // User indexes
    await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection('users').createIndex({ createdAt: -1 });
    
    // Resume indexes
    await mongoose.connection.db.collection('resumes').createIndex({ userId: 1 });
    await mongoose.connection.db.collection('resumes').createIndex({ userId: 1, isActive: 1 });
    await mongoose.connection.db.collection('resumes').createIndex({ userId: 1, updatedAt: -1 });
    await mongoose.connection.db.collection('resumes').createIndex({ 'personalInfo.email': 1 });
    await mongoose.connection.db.collection('resumes').createIndex({ skills: 1 });
    await mongoose.connection.db.collection('resumes').createIndex({ atsScore: -1 });
    
    // Analytics indexes
    await mongoose.connection.db.collection('useranalytics').createIndex({ userId: 1 }, { unique: true });
    await mongoose.connection.db.collection('useranalytics').createIndex({ 'actions.timestamp': -1 });
    
    // Interview session indexes
    await mongoose.connection.db.collection('interviewsessions').createIndex({ userId: 1 });
    await mongoose.connection.db.collection('interviewsessions').createIndex({ userId: 1, createdAt: -1 });
    
    // Learning path indexes
    await mongoose.connection.db.collection('learningpaths').createIndex({ category: 1 });
    await mongoose.connection.db.collection('learningpaths').createIndex({ difficulty: 1 });
    
    // User progress indexes
    await mongoose.connection.db.collection('userprogresses').createIndex({ userId: 1 });
    await mongoose.connection.db.collection('userprogresses').createIndex({ userId: 1, pathId: 1 });
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
  }
};

/**
 * Analyze query performance
 * @param {Object} model - Mongoose model
 * @param {Object} query - Query object
 * @returns {Object} - Query execution stats
 */
const analyzeQuery = async (model, query) => {
  try {
    const startTime = Date.now();
    const explain = await model.find(query).explain('executionStats');
    const endTime = Date.now();
    
    const stats = explain.executionStats;
    
    return {
      executionTime: endTime - startTime,
      documentsExamined: stats.totalDocsExamined,
      documentsReturned: stats.totalDocsReturned,
      indexesUsed: stats.executionStages?.indexName || 'COLLSCAN',
      efficiency: stats.totalDocsReturned / stats.totalDocsExamined || 0,
      isEfficient: stats.totalDocsExamined <= stats.totalDocsReturned * 2
    };
  } catch (error) {
    console.error('Query analysis error:', error);
    return null;
  }
};

/**
 * Optimize aggregation pipelines
 * @param {Array} pipeline - Aggregation pipeline
 * @returns {Array} - Optimized pipeline
 */
const optimizePipeline = (pipeline) => {
  const optimized = [...pipeline];
  
  // Move $match stages to the beginning
  const matchStages = optimized.filter(stage => stage.$match);
  const otherStages = optimized.filter(stage => !stage.$match);
  
  // Move $limit stages early when possible
  const limitStages = otherStages.filter(stage => stage.$limit);
  const remainingStages = otherStages.filter(stage => !stage.$limit);
  
  // Combine multiple $match stages
  const combinedMatch = matchStages.reduce((acc, stage) => {
    return { $match: { ...acc.$match, ...stage.$match } };
  }, { $match: {} });
  
  return [
    ...(Object.keys(combinedMatch.$match).length > 0 ? [combinedMatch] : []),
    ...limitStages,
    ...remainingStages
  ];
};

/**
 * Monitor slow queries
 */
const monitorSlowQueries = () => {
  // Skip profiling for MongoDB Atlas (cloud) as it's not allowed
  const isAtlas = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('mongodb.net');
  
  if (isAtlas) {
    console.log('ℹ️ MongoDB Atlas detected - profiling not available (this is normal)');
    return;
  }

  // Enable MongoDB profiling for slow queries (> 100ms) - only for local MongoDB
  mongoose.connection.db.admin().command({
    profile: 2,
    slowms: 100
  }).then(() => {
    console.log('✅ MongoDB slow query profiling enabled');
  }).catch(error => {
    console.warn('⚠️ MongoDB profiling not available:', error.message);
  });
};

/**
 * Get database statistics
 * @returns {Object} - Database statistics
 */
const getDatabaseStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    const collectionStats = {};
    for (const collection of collections) {
      const collStats = await mongoose.connection.db.collection(collection.name).stats();
      collectionStats[collection.name] = {
        documents: collStats.count,
        avgObjSize: collStats.avgObjSize,
        storageSize: collStats.storageSize,
        indexes: collStats.nindexes,
        indexSize: collStats.totalIndexSize
      };
    }
    
    return {
      database: {
        collections: stats.collections,
        objects: stats.objects,
        avgObjSize: stats.avgObjSize,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize
      },
      collections: collectionStats
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
};

/**
 * Connection pool optimization
 */
const optimizeConnectionPool = () => {
  const options = {
    maxPoolSize: 10, // Maximum number of connections
    minPoolSize: 2,  // Minimum number of connections
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    serverSelectionTimeoutMS: 5000, // How long to try selecting a server
    socketTimeoutMS: 45000, // How long to wait for a response
    bufferCommands: false, // Disable mongoose buffering
  };
  
  return options;
};

/**
 * Query optimization middleware
 */
const queryOptimizationMiddleware = (schema) => {
  schema.pre(/^find/, function() {
    // Add query timing
    this.start = Date.now();
  });
  
  schema.post(/^find/, function(result) {
    if (this.start) {
      const duration = Date.now() - this.start;
      if (duration > 100) {
        console.warn(`Slow query detected: ${this.getQuery()} - ${duration}ms`);
      }
    }
  });
  
  // Optimize common queries
  schema.pre(/^find/, function() {
    // Add common projections to reduce data transfer
    if (!this.getOptions().projection) {
      this.select('-__v'); // Exclude version field by default
    }
  });
};

/**
 * Batch operations utility
 */
class BatchOperations {
  constructor(model, batchSize = 100) {
    this.model = model;
    this.batchSize = batchSize;
    this.operations = [];
  }
  
  add(operation) {
    this.operations.push(operation);
    
    if (this.operations.length >= this.batchSize) {
      return this.execute();
    }
    
    return Promise.resolve();
  }
  
  async execute() {
    if (this.operations.length === 0) return;
    
    try {
      const result = await this.model.bulkWrite(this.operations);
      this.operations = [];
      return result;
    } catch (error) {
      console.error('Batch operation error:', error);
      throw error;
    }
  }
  
  async flush() {
    return this.execute();
  }
}

/**
 * Database health check
 */
const checkDatabaseHealth = async () => {
  try {
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const responseTime = Date.now() - start;
    
    const stats = await mongoose.connection.db.stats();
    
    return {
      status: 'healthy',
      responseTime,
      connections: mongoose.connection.readyState,
      collections: stats.collections,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

module.exports = {
  createIndexes,
  analyzeQuery,
  optimizePipeline,
  monitorSlowQueries,
  getDatabaseStats,
  optimizeConnectionPool,
  queryOptimizationMiddleware,
  BatchOperations,
  checkDatabaseHealth
};