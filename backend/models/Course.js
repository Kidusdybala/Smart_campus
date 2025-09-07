const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semester: { type: String, required: true },
  year: { type: Number, required: true },
  credits: { type: Number, required: true, min: 1, max: 6 },
  department: { type: String, required: true },
  maxStudents: { type: Number, default: 50 },
  status: { type: String, enum: ['active', 'inactive', 'completed'], default: 'active' },
  schedule: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    startTime: { type: String },
    endTime: { type: String },
    room: { type: String }
  }],
  syllabus: { type: String },
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
courseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Course', courseSchema);