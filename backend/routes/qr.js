const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

const router = express.Router();

// Scan QR for entrance
router.post('/scan', auth, async (req, res) => {
  try {
    const { qrCode, location } = req.body;
    const user = await User.findOne({ qrCode });
    if (!user) return res.status(404).json({ error: 'Invalid QR code' });

    // Log attendance
    const attendance = new Attendance({
      user: user._id,
      scannedAt: new Date(),
      location: location || 'Unknown'
    });
    await attendance.save();

    res.json({ message: 'Entry logged', user: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's QR code
router.get('/my-qr', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ qrCode: user.qrCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get scan history
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Attendance.find({ user: req.user.id })
      .sort({ scannedAt: -1 })
      .limit(10);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;