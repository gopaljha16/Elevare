const connectDB = require('../config/database');
const { seedQuestions } = require('./seedQuestions');
const { seedLearningPaths } = require('./seedLearningPaths');

const initializeData = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Seeding questions...');
    await seedQuestions();
    
    console.log('Seeding learning paths...');
    await seedLearningPaths();
    
    console.log('Data initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing data:', error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  initializeData();
}

module.exports = { initializeData };