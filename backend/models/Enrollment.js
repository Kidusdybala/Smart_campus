const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  enrollmentDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['enrolled', 'dropped', 'completed', 'withdrawn'],
    default: 'enrolled'
  },
  grade: { type: String, enum: ['A', 'B', 'C', 'D', 'F', 'I', 'W'] },
  gradePoints: { type: Number, min: 0, max: 4 },
  semester: { type: String, required: true },
  year: { type: Number, required: true },
  attendanceCount: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1, semester: 1, year: 1 }, { unique: true });

// Update the updatedAt field before saving
enrollmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate grade points based on grade
enrollmentSchema.pre('save', function(next) {
  if (this.grade) {
    const gradePoints = {
      'A': 4.0,
      'B': 3.0,
      'C': 2.0,
      'D': 1.0,
      'F': 0.0,
      'I': 0.0, // Incomplete
      'W': 0.0  // Withdrawn
    };
    this.gradePoints = gradePoints[this.grade] || 0;
  }
  next();
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);