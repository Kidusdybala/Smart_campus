const express = require('express');
const mongoose = require('mongoose');
const { auth, roleAuth } = require('../middleware/auth');
const Parking = require('../models/Parking');

const router = express.Router();

// Get parking slots
router.get('/', auth, async (req, res) => {
  try {
    const slots = await Parking.find();
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reserve slot
router.post('/reserve/:slot', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { plateNumber, carType, carModel, color } = req.body;

    // Validate required vehicle details
    if (!plateNumber || !carType) {
      return res.status(400).json({
        error: 'Plate number and car type are required for reservation.'
      });
    }

    // Check if user already has an active reservation
    const existingReservation = await Parking.findOne({
      user: userId,
      status: { $in: ['reserved', 'occupied'] }
    });

    if (existingReservation) {
      return res.status(400).json({
        error: 'You already have an active parking reservation. Please cancel or complete your current reservation before reserving a new spot.',
        currentReservation: existingReservation.slot
      });
    }

    const slot = await Parking.findOne({ slot: req.params.slot });
    if (!slot || slot.status !== 'available') return res.status(400).json({ error: 'Slot not available' });

    slot.status = 'reserved';
    slot.user = userId;
    slot.reservedAt = new Date();
    slot.vehicleDetails = {
      plateNumber,
      carType,
      carModel: carModel || '',
      color: color || ''
    };
    await slot.save();

    res.json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Occupy slot (simulate IoT)
router.post('/occupy/:slot', auth, async (req, res) => {
  try {
    const slot = await Parking.findOne({ slot: req.params.slot });
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    slot.status = 'occupied';
    slot.occupiedAt = new Date();
    await slot.save();

    res.json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel reservation
router.post('/cancel/:slot', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const slot = await Parking.findOne({ slot: req.params.slot });
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    // Check if the slot belongs to the user
    if (!slot.user || slot.user.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You can only cancel your own reservations' });
    }

    slot.status = 'available';
    slot.user = null;
    slot.reservedAt = null;
    await slot.save();

    res.json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// End parking session with payment
router.post('/end/:slot', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const slot = await Parking.findOne({ slot: req.params.slot });
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    // Check if the slot belongs to the user
    if (!slot.user || slot.user.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You can only end your own parking sessions' });
    }

    const user = await require('../models/User').findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Calculate duration and cost
    const startTime = slot.reservedAt || new Date();
    const endTime = new Date();
    const durationMs = endTime - startTime;
    const durationHours = durationMs / (1000 * 60 * 60);
    const cost = Math.max(10, Math.ceil(durationHours * 10)); // 10 ETB per hour, minimum 10 ETB

    // Check wallet balance
    if (user.walletBalance < cost) {
      return res.status(400).json({
        error: 'Insufficient wallet balance',
        required: cost,
        available: user.walletBalance
      });
    }

    // Deduct from wallet
    user.walletBalance -= cost;
    await user.save();

    // Update slot
    slot.status = 'available';
    slot.user = null;
    slot.endedAt = endTime;
    await slot.save();

    // Create payment record
    const Payment = require('../models/Payment');
    const payment = new Payment({
      user: userId,
      amount: cost,
      type: 'parking',
      status: 'completed',
      paymentMethod: 'wallet',
      description: `Parking payment for ${slot.slot} - ${durationHours.toFixed(2)} hours`
    });
    await payment.save();

    res.json({
      message: 'Parking session ended successfully',
      cost,
      duration: durationHours.toFixed(2),
      newBalance: user.walletBalance,
      paymentId: payment._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin add slots
router.post('/', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const slot = new Parking(req.body);
    await slot.save();
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin clear all reservations
router.post('/clear-all', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const result = await Parking.updateMany(
      { status: { $in: ['reserved', 'occupied'] } },
      {
        $set: { status: 'available' },
        $unset: { user: 1, reservedAt: 1, occupiedAt: 1 }
      }
    );
    res.json({
      message: `Cleared ${result.modifiedCount} reservations`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;