const mongoose = require('mongoose');

const gradeEntrySchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true },
  grade: { type: String, required: true, enum: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'I', 'W'] },
  gradePoints: { type: Number, min: 0, max: 4 },
  comments: { type: String },
  submittedAt: { type: Date, default: Date.now }
});

const gradeSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semester: { type: String, required: true },
  year: { type: Number, required: true },
  assessmentType: {
    type: String,
    required: true,
    enum: ['midterm', 'final', 'assignment', 'project', 'quiz', 'lab', 'other']
  },
  assessmentName: { type: String, required: true },
  totalMarks: { type: Number, required: true },
  weightage: { type: Number, required: true, min: 0, max: 100 }, // Percentage weight in final grade

  // Grade entries for each student
  grades: [gradeEntrySchema],

  // Approval workflow
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected', 'published'],
    default: 'draft'
  },

  // Submission details
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedAt: { type: Date },

  // Approval details
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  approvalComments: { type: String },

  // Rejection details
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },

  // Publishing details
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishedAt: { type: Date },

  // Audit trail
  history: [{
    action: {
      type: String,
      enum: ['created', 'submitted', 'approved', 'rejected', 'published', 'modified']
    },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    performedAt: { type: Date, default: Date.now },
    details: { type: String },
    oldData: { type: mongoose.Schema.Types.Mixed },
    newData: { type: mongoose.Schema.Types.Mixed }
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
gradeSchema.index({ course: 1, assessmentType: 1, semester: 1, year: 1 });
gradeSchema.index({ instructor: 1, status: 1 });
gradeSchema.index({ status: 1, submittedAt: 1 });

// Update the updatedAt field before saving
gradeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate grade points for each grade entry
gradeSchema.pre('save', function(next) {
  if (this.grades && this.grades.length > 0) {
    const gradePoints = {
      'A': 4.0,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2.0,
      'C-': 1.7,
      'D+': 1.3,
      'D': 1.0,
      'D-': 0.7,
      'F': 0.0,
      'I': 0.0, // Incomplete
      'W': 0.0  // Withdrawn
    };

    this.grades.forEach(gradeEntry => {
      if (gradeEntry.grade) {
        gradeEntry.gradePoints = gradePoints[gradeEntry.grade] || 0;
      }
    });
  }
  next();
});

// Add to history when status changes
gradeSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    const oldStatus = this.getChanges().$set?.status;
    if (oldStatus) {
      this.history.push({
        action: 'modified',
        performedBy: this.approvedBy || this.rejectedBy || this.submittedBy,
        details: `Status changed from ${this.status} to ${this.get('status')}`,
        oldData: { status: this.status },
        newData: { status: this.get('status') }
      });
    }
  }
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);