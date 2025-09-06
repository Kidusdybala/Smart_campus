const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'ETB' },
  type: { type: String, enum: ['topup', 'food_order', 'parking'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'pending' },
  paymentMethod: { type: String, enum: ['chapa', 'wallet'], default: 'chapa' },
  transactionId: { type: String },
  chapaTransactionId: { type: String },
  description: { type: String },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);