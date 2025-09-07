const express = require('express');
const { auth, roleAuth } = require('../middleware/auth');
const Schedule = require('../models/Schedule');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

const router = express.Router();

// Get schedules for user
router.get('/', auth, async (req, res) => {
  try {
    let schedules;
    if (req.user.role === 'student') {
      schedules = await Schedule.find({ students: req.user.id });
    } else {
      schedules = await Schedule.find({ lecturer: req.user.id });
    }
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get today's schedules for user
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // For development, find student user by email
    const studentUser = await User.findOne({ email: 'student@university.edu' });
    if (!studentUser) {
      return res.status(404).json({ error: 'Student user not found' });
    }

    const schedules = await Schedule.find({
      students: studentUser._id,
      date: { $gte: today, $lt: tomorrow }
    });

    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Staff create schedule
router.post('/', auth, roleAuth(['staff', 'admin']), async (req, res) => {
  try {
    const schedule = new Schedule({ ...req.body, lecturer: req.user.id });
    await schedule.save();
    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get attendance for user
router.get('/attendance', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({ user: req.user.id }).populate('user');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance stats for user
router.get('/attendance/stats', async (req, res) => {
  try {
    // For development, find student user by email
    const studentUser = await User.findOne({ email: 'student@university.edu' });
    if (!studentUser) {
      return res.status(404).json({ error: 'Student user not found' });
    }

    const totalAttendance = await Attendance.countDocuments({ user: studentUser._id });
    const presentCount = await Attendance.countDocuments({ user: studentUser._id, status: 'present' });
    const percentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;
    res.json({
      present: presentCount,
      total: totalAttendance,
      percentage: Math.round(percentage * 100) / 100
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get campus status for student dashboard
router.get('/campus/status', async (req, res) => {
  try {
    // Mock data for now - in real app this would come from sensors/IoT
    const status = {
      libraryOccupancy: Math.floor(Math.random() * 40) + 60, // 60-100%
      cafeteriaQueue: Math.floor(Math.random() * 10) + 1, // 1-10 min
      parkingAvailable: Math.floor(Math.random() * 50) + 20 // 20-70 spots
    };
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get staff dashboard data
router.get('/staff/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // For development, find staff user by email
    const staffUser = await User.findOne({ email: 'staff@university.edu' });
    if (!staffUser) {
      return res.status(404).json({ error: 'Staff user not found' });
    }

    // Get today's classes for the staff member
    const todayClasses = await Schedule.find({
      lecturer: staffUser._id,
      date: { $gte: today, $lt: tomorrow }
    }).populate('students');

    // Get attendance stats
    const totalStudents = await User.countDocuments({ role: 'student' });
    const avgAttendance = 92; // Mock data - would calculate from attendance records

    // Get recent activity (mock data for now)
    const recentActivity = [
      { type: "attendance", message: `${Math.floor(Math.random() * 40) + 30} students checked into class`, time: "2 hours ago" },
      { type: "announcement", message: "Posted assignment deadline reminder", time: "4 hours ago" },
      { type: "grade", message: "Graded assignments", time: "1 day ago" },
    ];

    res.json({
      todayClasses: todayClasses.length,
      totalStudents,
      avgAttendance,
      recentActivity,
      classes: todayClasses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get admin dashboard data
router.get('/admin/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = Math.floor(totalUsers * 0.7); // Mock active users
    const parkingOccupancy = Math.floor(Math.random() * 40) + 30; // 30-70%
    const cafeteriaOrders = Math.floor(Math.random() * 100) + 150; // 150-250 orders

    // Mock building occupancy data
    const buildingOccupancy = [
      { name: "Main Building", current: Math.floor(Math.random() * 100) + 200, capacity: 300 },
      { name: "Science Wing", current: Math.floor(Math.random() * 100) + 150, capacity: 250 },
      { name: "Library", current: Math.floor(Math.random() * 100) + 100, capacity: 200 },
      { name: "Sports Complex", current: Math.floor(Math.random() * 80) + 70, capacity: 150 },
    ];

    // Calculate percentages
    buildingOccupancy.forEach(building => {
      building.percentage = Math.round((building.current / building.capacity) * 100);
    });

    // Mock alerts
    const recentAlerts = [
      { type: "warning", message: "Parking Lot A reaching capacity", time: "15 min ago" },
      { type: "info", message: `New user registrations: +${Math.floor(Math.random() * 10) + 15} today`, time: "1 hour ago" },
      { type: "error", message: "System maintenance completed", time: "2 hours ago" },
    ];

    res.json({
      totalUsers,
      activeUsers,
      parkingOccupancy,
      cafeteriaOrders,
      systemUptime: 99.8,
      buildingOccupancy,
      recentAlerts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Staff get attendance for class
router.get('/attendance/:scheduleId', auth, roleAuth(['staff', 'admin']), async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.scheduleId).populate('students');
    const attendance = await Attendance.find({ user: { $in: schedule.students }, date: { $gte: schedule.date } });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;