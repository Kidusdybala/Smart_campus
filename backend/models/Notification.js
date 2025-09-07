const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['grade_published', 'grade_rejected', 'assignment_due', 'course_announcement', 'system', 'payment_success', 'payment_failed', 'wallet_topup', 'low_balance', 'payment_pending'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed }, // Additional data like course_id, grade_id, etc.
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: { type: Date }, // Optional expiration date
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-expiration

// Update the updatedAt field before saving
notificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);