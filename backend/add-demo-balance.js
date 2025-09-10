const mongoose = require('mongoose');
const User = require('./models/User');
const Payment = require('./models/Payment');
require('dotenv').config();

async function addDemoBalance() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find a user (you can modify this to find a specific user)
    const user = await User.findOne({ role: 'student' }).limit(1);
    if (!user) {
      console.log('No student user found');
      return;
    }

    console.log(`Found user: ${user.email} (${user._id})`);
    console.log(`Current balance: ${user.walletBalance || 0} ETB`);

    // Add 5000 ETB to wallet
    const currentBalance = user.walletBalance || 0;
    user.walletBalance = currentBalance + 5000;
    await user.save();

    // Create a demo payment record
    const payment = new Payment({
      user: user._id,
      amount: 5000,
      type: 'topup',
      status: 'completed',
      paymentMethod: 'chapa',
      description: 'Demo wallet top-up of 5000 ETB'
    });

    await payment.save();

    console.log(`✅ Successfully added 5000 ETB to ${user.email}`);
    console.log(`New balance: ${user.walletBalance} ETB`);
    console.log(`Payment record created with ID: ${payment._id}`);

  } catch (error) {
    console.error('Error adding demo balance:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
addDemoBalance();