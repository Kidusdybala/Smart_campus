const mongoose = require('mongoose');
const User = require('./models/User');
const Parking = require('./models/Parking');
const { Food } = require('./models/Food');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Schedule = require('./models/Schedule');
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
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await Schedule.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = [
      {
        name: 'Abebe Kebede',
        email: 'student@university.edu',
        password: 'password123',
        role: 'student'
      },
      {
        name: 'Dr. Meseret Bekele',
        email: 'staff@university.edu',
        password: 'password123',
        role: 'staff'
      },
      {
        name: 'Solomon Gebremariam',
        email: 'admin@university.edu',
        password: 'password123',
        role: 'admin'
      },
      {
        name: 'Worknesh Alemu',
        email: 'cafeteria@university.edu',
        password: 'password123',
        role: 'cafeteria'
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${userData.email}`);
    }

    // Get staff and student users
    const staffUser = createdUsers.find(u => u.email === 'staff@university.edu');
    const studentUser = createdUsers.find(u => u.email === 'student@university.edu');

    // Create courses for the staff
    const courses = [
      {
        name: 'Database',
        code: 'CS101',
        description: 'Introduction to Database Management Systems',
        instructor: staffUser._id,
        semester: 'Fall',
        year: 2025,
        credits: 3,
        department: 'Computer Science',
        maxStudents: 30,
        status: 'active',
        schedule: [
          {
            day: 'Monday',
            startTime: '10:00',
            endTime: '11:30',
            room: 'CS-101'
          },
          {
            day: 'Wednesday',
            startTime: '10:00',
            endTime: '11:30',
            room: 'CS-101'
          }
        ]
      },
      {
        name: 'Database 2',
        code: 'CS201',
        description: 'Advanced Database Concepts and Design',
        instructor: staffUser._id,
        semester: 'Fall',
        year: 2025,
        credits: 3,
        department: 'Computer Science',
        maxStudents: 25,
        status: 'active',
        schedule: [
          {
            day: 'Tuesday',
            startTime: '14:00',
            endTime: '15:30',
            room: 'CS-201'
          },
          {
            day: 'Thursday',
            startTime: '14:00',
            endTime: '15:30',
            room: 'CS-201'
          }
        ]
      }
    ];

    const createdCourses = [];
    for (const courseData of courses) {
      const course = new Course(courseData);
      await course.save();
      createdCourses.push(course);
      console.log(`Created course: ${courseData.name}`);
    }

    // Create enrollments for the student
    for (const course of createdCourses) {
      const enrollment = new Enrollment({
        student: studentUser._id,
        course: course._id,
        semester: course.semester,
        year: course.year,
        status: 'enrolled'
      });
      await enrollment.save();
      console.log(`Enrolled student in: ${course.name}`);
    }

    // Create today's schedule based on the courses
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today

    const schedules = [
      {
        lecturer: staffUser._id,
        subject: 'Database',
        classroom: 'CS-101',
        time: '10:00 AM - 11:30 AM',
        date: today,
        students: [studentUser._id]
      },
      {
        lecturer: staffUser._id,
        subject: 'Database 2',
        classroom: 'CS-201',
        time: '2:00 PM - 3:30 PM',
        date: today,
        students: [studentUser._id]
      }
    ];

    for (const scheduleData of schedules) {
      const schedule = new Schedule(scheduleData);
      await schedule.save();
      console.log(`Created schedule: ${scheduleData.subject} at ${scheduleData.time}`);
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
    console.log('Student (Abebe Kebede): student@university.edu / password123');
    console.log('Staff (Dr. Meseret Bekele): staff@university.edu / password123');
    console.log('Admin (Solomon Gebremariam): admin@university.edu / password123');
    console.log('Cafeteria (Worknesh Alemu): cafeteria@university.edu / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedDatabase();