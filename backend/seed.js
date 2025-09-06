const mongoose = require('mongoose');
const User = require('./models/User');
const Parking = require('./models/Parking');
const { Food } = require('./models/Food');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartcampus');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Parking.deleteMany({});
    await Food.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = [
      {
        name: 'Alex Johnson',
        email: 'student@university.edu',
        password: 'password123',
        role: 'student'
      },
      {
        name: 'Dr. Sarah Williams',
        email: 'staff@university.edu',
        password: 'password123',
        role: 'staff'
      },
      {
        name: 'Michael Chen',
        email: 'admin@university.edu',
        password: 'password123',
        role: 'admin'
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.email}`);
    }

    // Create parking slots
    const parkingSlots = [];
    for (let i = 1; i <= 20; i++) {
      parkingSlots.push({
        slot: `A-${i.toString().padStart(2, '0')}`,
        status: i <= 15 ? 'available' : 'occupied'
      });
    }

    for (const slot of parkingSlots) {
      const parking = new Parking(slot);
      await parking.save();
    }
    console.log('Created parking slots');

    // Create food items
    const foodItems = [
      {
        name: 'Classic Burger',
        description: 'Beef patty with lettuce, tomato, and special sauce',
        price: 12.99,
        category: 'mains',
        available: true
      },
      {
        name: 'Chicken Caesar Salad',
        description: 'Grilled chicken with romaine, parmesan, and caesar dressing',
        price: 11.99,
        category: 'mains',
        available: true
      },
      {
        name: 'Pasta Carbonara',
        description: 'Creamy pasta with bacon and parmesan cheese',
        price: 13.99,
        category: 'mains',
        available: true
      },
      {
        name: 'Caffe Latte',
        description: 'Espresso with steamed milk and foam',
        price: 4.99,
        category: 'drinks',
        available: true
      },
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 3.99,
        category: 'drinks',
        available: true
      }
    ];

    for (const foodData of foodItems) {
      const food = new Food(foodData);
      await food.save();
    }
    console.log('Created food items');

    console.log('Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('Student: student@university.edu / password123');
    console.log('Staff: staff@university.edu / password123');
    console.log('Admin: admin@university.edu / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedDatabase();