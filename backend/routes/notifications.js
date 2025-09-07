const express = require('express');
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

// Get all notifications for the authenticated user
router.get('/', async (req, res) => {
  try {
    // For development, find student user by email
    const User = require('../models/User');
    const studentUser = await User.findOne({ email: 'student@university.edu' });
    if (!studentUser) {
      return res.status(404).json({ error: 'Student user not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unreadOnly === 'true';

    // Build query
    const query = { recipient: studentUser._id };
    if (unreadOnly) {
      query.read = false;
    }

    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mark a notification as read
router.post('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // For development, find student user by email
    const User = require('../models/User');
    const studentUser = await User.findOne({ email: 'student@university.edu' });
    if (!studentUser) {
      return res.status(404).json({ error: 'Student user not found' });
    }

    // Check if notification belongs to user
    if (notification.recipient.toString() !== studentUser._id.toString()) {
      return res.status(403).json({ error: 'Notification does not belong to user' });
    }

    // Mark as read
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', async (req, res) => {
  try {
    // For development, find student user by email
    const User = require('../models/User');
    const studentUser = await User.findOne({ email: 'student@university.edu' });
    if (!studentUser) {
      return res.status(404).json({ error: 'Student user not found' });
    }

    // Update all unread notifications
    const result = await Notification.updateMany(
      { recipient: studentUser._id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      message: 'All notifications marked as read',
      count: result.modifiedCount
    });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get unread notification count
router.get('/unread-count', async (req, res) => {
  try {
    // For development, find student user by email
    const User = require('../models/User');
    const studentUser = await User.findOne({ email: 'student@university.edu' });
    if (!studentUser) {
      return res.status(404).json({ error: 'Student user not found' });
    }

    const count = await Notification.countDocuments({
      recipient: studentUser._id,
      read: false
    });

    res.json({ count });
  } catch (err) {
    console.error('Error getting unread notification count:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;