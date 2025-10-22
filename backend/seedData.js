// Simple script to seed learning paths data
// Run with: node seedData.js

require('dotenv').config();
const mongoose = require('mongoose');
const { seedLearningPaths } = require('./src/utils/seedLearningPaths');

async function runSeed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('✅ Connected to MongoDB');

    console.log('🌱 Seeding learning paths...');
    const result = await seedLearningPaths();
    
    if (result.success) {
      console.log('✅ SUCCESS! Learning paths seeded successfully!');
      console.log('📊 2 learning paths added to database');
      console.log('');
      console.log('🎉 Now refresh your browser at: http://localhost:5173/learning-paths');
    } else {
      console.error('❌ Error:', result.error);
    }

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

runSeed();
