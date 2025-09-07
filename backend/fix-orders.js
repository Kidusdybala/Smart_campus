const mongoose = require('mongoose');
const User = require('./models/User');
const { Order } = require('./models/Food');
require('dotenv').config();

const fixInvalidOrders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartcampus');
    console.log('Connected to MongoDB');

    // Get all orders and check them manually
    const ordersToCheck = await Order.find({});

    console.log(`Checking ${ordersToCheck.length} orders for validity`);

    const invalidOrderIds = [];

    for (const order of ordersToCheck) {
      let isInvalid = false;
      const orderId = order._id.toString().slice(-6);

      console.log(`Checking order ${orderId}: user=${order.user}, items=${order.items ? order.items.length : 0}`);

      // Check if user is null
      if (!order.user) {
        isInvalid = true;
        console.log(`Order ${orderId} has null user`);
      }

      // Check if items have null food references
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          console.log(`  Item: food=${item.food}, quantity=${item.quantity}`);
          if (!item.food) {
            isInvalid = true;
            console.log(`Order ${orderId} has null food in items`);
            break;
          }
        }
      } else {
        isInvalid = true;
        console.log(`Order ${orderId} has no items`);
      }

      if (isInvalid) {
        invalidOrderIds.push(order._id);
        console.log(`Order ${orderId} marked as invalid`);
      } else {
        console.log(`Order ${orderId} is valid`);
      }
    }

    console.log(`Found ${invalidOrderIds.length} invalid orders`);

    if (invalidOrderIds.length > 0) {
      // Delete invalid orders
      const result = await Order.deleteMany({
        _id: { $in: invalidOrderIds }
      });

      console.log(`Deleted ${result.deletedCount} invalid orders`);
    }

    // Check if referenced users exist
    const userIds = [...new Set(ordersToCheck.map(order => order.user).filter(user => user))];
    console.log(`\nChecking ${userIds.length} unique user references:`);
    const existingUsers = new Set();
    for (const userId of userIds) {
      const user = await User.findById(userId);
      if (user) {
        existingUsers.add(userId.toString());
        console.log(`User ${userId}: ${user.name} (${user.email})`);
      } else {
        console.log(`User ${userId}: NOT FOUND`);
      }
    }

    // Check if referenced foods exist
    const foodIds = [];
    ordersToCheck.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          if (item.food) foodIds.push(item.food);
        });
      }
    });
    const uniqueFoodIds = [...new Set(foodIds)];
    console.log(`\nChecking ${uniqueFoodIds.length} unique food references:`);
    const { Food } = require('./models/Food');
    const existingFoods = new Set();
    for (const foodId of uniqueFoodIds) {
      const food = await Food.findById(foodId);
      if (food) {
        existingFoods.add(foodId.toString());
        console.log(`Food ${foodId}: ${food.name}`);
      } else {
        console.log(`Food ${foodId}: NOT FOUND`);
      }
    }

    // Find orders with invalid references
    const ordersWithInvalidRefs = [];
    for (const order of ordersToCheck) {
      let hasInvalidRefs = false;

      // Check user reference
      if (order.user && !existingUsers.has(order.user.toString())) {
        hasInvalidRefs = true;
        console.log(`Order ${order._id.toString().slice(-6)} has invalid user reference`);
      }

      // Check food references
      if (order.items) {
        for (const item of order.items) {
          if (item.food && !existingFoods.has(item.food.toString())) {
            hasInvalidRefs = true;
            console.log(`Order ${order._id.toString().slice(-6)} has invalid food reference`);
            break;
          }
        }
      }

      if (hasInvalidRefs) {
        ordersWithInvalidRefs.push(order._id);
      }
    }

    console.log(`\nFound ${ordersWithInvalidRefs.length} orders with invalid references`);

    if (ordersWithInvalidRefs.length > 0) {
      // Delete orders with invalid references
      const result = await Order.deleteMany({
        _id: { $in: ordersWithInvalidRefs }
      });

      console.log(`Deleted ${result.deletedCount} orders with invalid references`);
    }

    // Verify all remaining orders have valid data
    const allOrders = await Order.find({})
      .populate('user', 'name email')
      .populate('items.food');

    console.log(`\nRemaining orders (${allOrders.length}):`);
    allOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order #${order._id.toString().slice(-6)}`);
      console.log(`   Customer: ${order.user ? order.user.name : 'NULL'}`);
      console.log(`   Items: ${order.items.length > 0 ? order.items.map(item => item.food ? item.food.name : 'NULL').join(', ') : 'No items'}`);
      console.log(`   Status: ${order.status}`);
      console.log('');
    });

    console.log('Order cleanup completed successfully!');

  } catch (error) {
    console.error('Error fixing orders:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

fixInvalidOrders();