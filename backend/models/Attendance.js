const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['present', 'absent'], default: 'present' },
  scannedAt: { type: Date },
  location: { type: String }
});

module.exports = mongoose.model('Attendance', attendanceSchema);