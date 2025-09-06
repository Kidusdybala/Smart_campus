const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
  slot: { type: String, required: true, unique: true },
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reservedAt: { type: Date },
  occupiedAt: { type: Date },
  vehicleDetails: {
    plateNumber: { type: String },
    carType: { type: String },
    carModel: { type: String },
    color: { type: String }
  }
});

module.exports = mongoose.model('Parking', parkingSchema);