const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const migrateUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartcampus');
    console.log('Connected to MongoDB');

    // Update only students and staff to have walletBalance field if it doesn't exist
    const result = await User.updateMany(
      { walletBalance: { $exists: false }, role: { $in: ['student', 'staff'] } },
      { $set: { walletBalance: 0 } }
    );

    console.log(`Migration completed: ${result.modifiedCount} users updated`);

    // Verify the migration
    const userCount = await User.countDocuments({ walletBalance: { $exists: true } });
    console.log(`Total users with wallet balance: ${userCount}`);

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

migrateUsers();