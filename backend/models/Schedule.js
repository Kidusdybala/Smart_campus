const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  lecturer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  classroom: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: Date, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Schedule', scheduleSchema);