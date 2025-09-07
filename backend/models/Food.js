const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String },
  image: { type: String },
  available: { type: Boolean, default: true }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' }, quantity: Number }],
  total: { type: Number },
  status: { type: String, enum: ['ordered', 'preparing', 'ready', 'picked'], default: 'ordered' },
  orderedAt: { type: Date, default: Date.now },
  pickupTime: { type: Date }
});

module.exports.Food = mongoose.model('Food', foodSchema);
module.exports.Order = mongoose.model('Order', orderSchema);