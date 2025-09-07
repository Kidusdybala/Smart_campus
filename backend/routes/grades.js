const express = require('express');
const mongoose = require('mongoose');
const { auth, roleAuth } = require('../middleware/auth');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Notification = require('../models/Notification');

const router = express.Router();

// Get courses taught by current instructor (staff)
router.get('/instructor/courses', async (req, res) => {
  try {
    // For development, find staff user by email
    const staffUser = await User.findOne({ email: 'staff@university.edu' });
    if (!staffUser) {
      return res.status(404).json({ error: 'Staff user not found' });
    }

    const courses = await Course.find({
      instructor: staffUser._id,
      status: 'active'
    }).select('name code semester year department');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get enrollments for a specific course
router.get('/course/:courseId/enrollments', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    // For development, allow access to staff courses
    const staffUser = await User.findOne({ email: 'staff@university.edu' });
    if (!staffUser || course.instructor.toString() !== staffUser._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const enrollments = await Enrollment.find({
      course: req.params.courseId,
      status: 'enrolled'
    }).populate('student', 'name email');

    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new grade sheet
router.post('/course/:courseId', async (req, res) => {
  try {
    const { assessmentType, assessmentName, totalMarks, weightage, grades } = req.body;

    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    // For development, check if staff user is the instructor
    const staffUser = await User.findOne({ email: 'staff@university.edu' });
    if (!staffUser || course.instructor.toString() !== staffUser._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const gradeSheet = new Grade({
      course: req.params.courseId,
      instructor: staffUser._id,
      semester: course.semester,
      year: course.year,
      assessmentType,
      assessmentName,
      totalMarks,
      weightage,
      grades,
      status: 'draft'
    });

    await gradeSheet.save();

    // Add to history
    gradeSheet.history.push({
      action: 'created',
      performedBy: staffUser._id,
      details: 'Grade sheet created'
    });
    await gradeSheet.save();

    res.status(201).json(gradeSheet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Submit grade sheet for approval
router.post('/:gradeId/submit', async (req, res) => {
  try {
    const gradeSheet = await Grade.findById(req.params.gradeId);
    if (!gradeSheet) return res.status(404).json({ error: 'Grade sheet not found' });

    // For development, check if staff user is the instructor
    const staffUser = await User.findOne({ email: 'staff@university.edu' });
    if (!staffUser || gradeSheet.instructor.toString() !== staffUser._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    gradeSheet.status = 'submitted';
    gradeSheet.submittedBy = staffUser._id;
    gradeSheet.submittedAt = new Date();

    // Add to history
    gradeSheet.history.push({
      action: 'submitted',
      performedBy: staffUser._id,
      details: 'Grade sheet submitted for approval'
    });

    await gradeSheet.save();
    res.json(gradeSheet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get grade sheets for instructor
router.get('/instructor/grades', async (req, res) => {
  try {
    const staffUser = await User.findOne({ email: 'staff@university.edu' });
    if (!staffUser) {
      return res.status(404).json({ error: 'Staff user not found' });
    }

    const gradeSheets = await Grade.find({ instructor: staffUser._id })
      .populate('course', 'name code')
      .sort({ createdAt: -1 });
    res.json(gradeSheets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending grade sheets for admin approval
router.get('/admin/pending', async (req, res) => {
  try {
    const pendingGrades = await Grade.find({ status: 'submitted' })
      .populate('course', 'name code')
      .populate('instructor', 'name')
      .sort({ submittedAt: 1 });
    res.json(pendingGrades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve grade sheet
router.post('/:gradeId/approve', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const { comments } = req.body;
    const gradeSheet = await Grade.findById(req.params.gradeId).populate('course', 'name');
    if (!gradeSheet) return res.status(404).json({ error: 'Grade sheet not found' });
    if (!gradeSheet.course) return res.status(404).json({ error: 'Associated course not found' });

    // For development, find admin user
    const adminUser = await User.findOne({ email: 'admin@university.edu' });
    if (!adminUser) return res.status(404).json({ error: 'Admin user not found' });

    gradeSheet.status = 'approved';
    gradeSheet.approvedBy = adminUser._id;
    gradeSheet.approvedAt = new Date();
    gradeSheet.approvalComments = comments;

    // Add to history
    gradeSheet.history.push({
      action: 'approved',
      performedBy: adminUser._id,
      details: `Grade sheet approved${comments ? ': ' + comments : ''}`
    });

    await gradeSheet.save();

    // Update enrollments with grades and create notifications
    const notifications = [];
    for (const gradeEntry of gradeSheet.grades) {
      await Enrollment.findOneAndUpdate(
        { student: gradeEntry.student, course: gradeSheet.course },
        {
          grade: gradeEntry.grade,
          gradePoints: gradeEntry.gradePoints,
          status: 'completed'
        }
      );

      // Create notification for student
      notifications.push({
        recipient: gradeEntry.student,
        type: 'grade_published',
        title: 'New Grade Available',
        message: `Your ${gradeSheet.assessmentName} grade for ${gradeSheet.course.name} has been published: ${gradeEntry.grade}`,
        data: {
          courseId: gradeSheet.course._id,
          gradeId: gradeSheet._id,
          assessmentType: gradeSheet.assessmentType,
          grade: gradeEntry.grade
        },
        priority: 'high',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
    }

    // Bulk create notifications
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json(gradeSheet);
  } catch (err) {
    console.error('Error approving grade sheet:', err);
    res.status(500).json({ error: err.message });
  }
});

// Reject grade sheet
router.post('/:gradeId/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const gradeSheet = await Grade.findById(req.params.gradeId);
    if (!gradeSheet) return res.status(404).json({ error: 'Grade sheet not found' });

    // For development, find admin user
    const adminUser = await User.findOne({ email: 'admin@university.edu' });
    if (!adminUser) return res.status(404).json({ error: 'Admin user not found' });

    gradeSheet.status = 'rejected';
    gradeSheet.rejectedBy = adminUser._id;
    gradeSheet.rejectedAt = new Date();
    gradeSheet.rejectionReason = reason;

    // Add to history
    gradeSheet.history.push({
      action: 'rejected',
      performedBy: adminUser._id,
      details: `Grade sheet rejected: ${reason}`
    });

    await gradeSheet.save();
    res.json(gradeSheet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Publish approved grades
router.post('/:gradeId/publish', async (req, res) => {
  try {
    const gradeSheet = await Grade.findById(req.params.gradeId);
    if (!gradeSheet) return res.status(404).json({ error: 'Grade sheet not found' });

    if (gradeSheet.status !== 'approved') {
      return res.status(400).json({ error: 'Grade sheet must be approved before publishing' });
    }

    // For development, find admin user
    const adminUser = await User.findOne({ email: 'admin@university.edu' });
    if (!adminUser) return res.status(404).json({ error: 'Admin user not found' });

    gradeSheet.status = 'published';
    gradeSheet.publishedBy = adminUser._id;
    gradeSheet.publishedAt = new Date();

    // Add to history
    gradeSheet.history.push({
      action: 'published',
      performedBy: adminUser._id,
      details: 'Grade sheet published to students'
    });

    await gradeSheet.save();
    res.json(gradeSheet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get student's grades
router.get('/student/grades', auth, roleAuth(['student']), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user.id,
      status: { $in: ['completed', 'enrolled'] }
    })
    .populate('course', 'name code semester year')
    .sort({ year: -1, semester: -1 });

    // Get published grades for each enrollment
    const gradesWithDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const gradeSheets = await Grade.find({
          course: enrollment.course,
          status: 'published',
          'grades.student': enrollment.student
        }).select('assessmentType assessmentName grades weightage');

        const courseGrades = gradeSheets.map(sheet => {
          const studentGrade = sheet.grades.find(g => g.student.toString() === enrollment.student.toString());
          return {
            assessmentType: sheet.assessmentType,
            assessmentName: sheet.assessmentName,
            grade: studentGrade?.grade,
            weightage: sheet.weightage,
            submittedAt: studentGrade?.submittedAt
          };
        });

        return {
          course: enrollment.course,
          enrollment: enrollment,
          grades: courseGrades,
          finalGrade: enrollment.grade,
          gradePoints: enrollment.gradePoints
        };
      })
    );

    res.json(gradesWithDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get student's enrolled courses
router.get('/student/courses', auth, roleAuth(['student']), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user.id,
      status: 'enrolled'
    })
    .populate('course', 'name code description instructor semester year credits department schedule')
    .populate('course.instructor', 'name')
    .sort({ 'course.year': -1, 'course.semester': -1 });

    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get audit trail for a grade sheet
router.get('/:gradeId/history', auth, roleAuth(['admin', 'staff']), async (req, res) => {
  try {
    const gradeSheet = await Grade.findById(req.params.gradeId)
      .populate('history.performedBy', 'name role');

    if (!gradeSheet) return res.status(404).json({ error: 'Grade sheet not found' });

    // Check permissions
    if (req.user.role === 'staff' && gradeSheet.instructor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(gradeSheet.history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user notifications
router.get('/notifications', async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    // For development, use student user
    const studentUser = await User.findOne({ email: 'student@university.edu' });
    if (!studentUser) return res.status(404).json({ error: 'Student user not found' });

    const query = { recipient: studentUser._id };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.post('/notifications/:notificationId/read', async (req, res) => {
  try {
    // For development, use student user
    const studentUser = await User.findOne({ email: 'student@university.edu' });
    if (!studentUser) return res.status(404).json({ error: 'Student user not found' });

    const notification = await Notification.findOne({
      _id: req.params.notificationId,
      recipient: studentUser._id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.markAsRead();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read
router.post('/notifications/mark-all-read', async (req, res) => {
  try {
    // For development, use student user
    const studentUser = await User.findOne({ email: 'student@university.edu' });
    if (!studentUser) return res.status(404).json({ error: 'Student user not found' });

    await Notification.updateMany(
      { recipient: studentUser._id, read: false },
      { read: true, readAt: new Date() }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread notification count
router.get('/notifications/unread-count', async (req, res) => {
  try {
    // For development, use student user
    const studentUser = await User.findOne({ email: 'student@university.edu' });
    if (!studentUser) return res.status(404).json({ error: 'Student user not found' });

    const count = await Notification.countDocuments({
      recipient: studentUser._id,
      read: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;