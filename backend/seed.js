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
      },
      {
        name: 'Cafeteria Manager',
        email: 'cafeteria@university.edu',
        password: 'password123',
        role: 'cafeteria'
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
        name: 'Doro Wat',
        description: 'Slow-cooked Ethiopian chicken stew with berbere spice, onions, and hard-boiled eggs',
        price: 250,
        category: 'mains',
        image: '/doro.jpg',
        available: true
      },
      {
        name: 'Shiro',
        description: 'Creamy chickpea flour stew cooked with Ethiopian spices and served with injera',
        price: 150,
        category: 'mains',
        image: '/shiro.jpg',
        available: true
      },
      {
        name: 'Atekilt',
        description: 'Traditional Ethiopian mixed vegetable stew with cabbage, carrots, and potatoes',
        price: 150,
        category: 'mains',
        image: '/atakilt.jpg',
        available: true
      },
      {
        name: 'Agelgil Alicha',
        description: 'Mild lamb stew with turmeric, garlic, and mixed vegetables, served with injera',
        price: 350,
        category: 'mains',
        image: '/agelgil.jpg',
        available: true
      },
      {
        name: 'Kitfo',
        description: 'Finely minced raw beef seasoned with mitmita spice and clarified butter',
        price: 700,
        category: 'mains',
        image: '/kitfo.jpg',
        available: true
      },
      {
        name: 'Coca Cola',
        description: 'Refreshing Coca Cola soft drink',
        price: 50,
        category: 'drinks',
        image: '/coca cola.jpg',
        available: true
      },
      {
        name: 'Fanta',
        description: 'Orange flavored Fanta soft drink',
        price: 50,
        category: 'drinks',
        image: '/fanta',
        available: true
      },
      {
        name: 'Sprite',
        description: 'Lemon-lime Sprite soft drink',
        price: 50,
        category: 'drinks',
        image: '/sprite.jpg',
        available: true
      },
      {
        name: 'Mirinda',
        description: 'Fruit flavored Mirinda soft drink',
        price: 50,
        category: 'drinks',
        image: '/mirinda',
        available: true
      },
      {
        name: 'Sofi Malta',
        description: 'Traditional Sofi Malta malt drink',
        price: 50,
        category: 'drinks',
        image: '/sofi malta.jpg',
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
    console.log('Cafeteria: cafeteria@university.edu / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedDatabase();