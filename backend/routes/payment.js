const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { Food } = require('../models/Food');
const { 
  createPaymentSuccessNotification,
  createPaymentFailedNotification,
  createPaymentPendingNotification,
  createLowBalanceNotification
} = require('../utils/notification');

const router = express.Router();

console.log('Payment routes loaded successfully');

// Get wallet balance
router.get('/wallet', auth, async (req, res) => {
  try {
    console.log('Wallet balance request for user ID:', req.user.id);
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found for ID:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Found user:', {
      id: user._id,
      email: user.email,
      role: user.role,
      walletBalance: user.walletBalance
    });

    // Only students and staff can have wallets
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Admins do not have wallet access' });
    }

    // Handle case where walletBalance might not exist for existing users
    const balance = user.walletBalance || 0;
    console.log('Returning balance for user', user.email + ':', balance);
    res.json({ balance });
  } catch (err) {
    console.log('Wallet route error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only students and staff can view payment history
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Admins do not have payment history' });
    }

    const payments = await Payment.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize Chapa payment for wallet top-up
router.post('/topup', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only students and staff can top up wallets
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Admins cannot access wallet features' });
    }

    const { amount } = req.body;

    if (!amount || amount < 10) {
      return res.status(400).json({ error: 'Minimum top-up amount is 10 ETB' });
    }

    // Cancel any existing pending payments for this user
    await Payment.updateMany(
      { user: req.user.id, status: 'pending', type: 'topup' },
      { status: 'cancelled' }
    );

    // Create payment record
    const payment = new Payment({
      user: req.user.id,
      amount,
      type: 'topup',
      status: 'pending',
      description: `Wallet top-up of ${amount} ETB`
    });

    await payment.save();
    
    // Create pending payment notification
    await createPaymentPendingNotification(
      req.user.id,
      amount,
      'topup',
      payment._id
    );

    // Integrate with Chapa API
    try {
      const chapaResponse = await axios.post('https://api.chapa.co/v1/transaction/initialize', {
        amount: amount.toString(),
        currency: 'ETB',
        email: user.email,
        first_name: user.firstName || 'User',
        last_name: user.lastName || 'User',
        tx_ref: payment._id.toString(),
        callback_url: `${process.env.BASE_URL || 'http://localhost:5001'}/api/payment/chapa/callback/${payment._id}`,
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile/wallet?paymentId=${payment._id}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile/wallet`
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (chapaResponse.data.status === 'success') {
        res.json({
          paymentId: payment._id,
          checkoutUrl: chapaResponse.data.data.checkout_url,
          transactionId: chapaResponse.data.data.tx_ref
        });
      } else {
        // If Chapa fails, delete the payment record
        await Payment.findByIdAndDelete(payment._id);
        res.status(400).json({ error: 'Payment initialization failed' });
      }
    } catch (error) {
      console.error('Chapa API error:', error.response?.data || error.message);
      // If Chapa fails, delete the payment record
      await Payment.findByIdAndDelete(payment._id);
      res.status(500).json({ error: 'Payment service unavailable' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chapa payment callback/webhook
router.post('/chapa/callback/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment status
    payment.status = req.body.status === 'success' ? 'completed' : 'failed';
    payment.chapaTransactionId = req.body.tx_ref;
    await payment.save();

    // Get user for notification
    const user = await User.findById(payment.user);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (req.body.status === 'success') {
      // Add funds to user wallet
      user.walletBalance += payment.amount;
      await user.save();
      
      // Create success notification
      await createPaymentSuccessNotification(
        user._id,
        payment.amount,
        'topup',
        payment._id
      );
      
      // Check if balance is still low after top-up
      if (user.walletBalance < 100) {
        await createLowBalanceNotification(user._id, user.walletBalance);
      }
    } else {
      // Create failure notification
      await createPaymentFailedNotification(
        user._id,
        payment.amount,
        'topup',
        payment._id,
        'Payment processing failed'
      );
    }

    res.json({ message: `Payment ${req.body.status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pay for food order using wallet
router.post('/food-order/:orderId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only students and staff can make food payments
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Admins cannot make food payments' });
    }

    const { orderId } = req.params;
    const { Order } = require('../models/Food');
    const order = await Order.findById(orderId).populate('items.food');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify order belongs to user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Order does not belong to user' });
    }

    const totalAmount = order.total || order.items.reduce((sum, item) => {
      return sum + (item.food.price * item.quantity);
    }, 0);

    const currentBalance = user.walletBalance || 0;

    if (currentBalance < totalAmount) {
      return res.status(400).json({
        error: 'Insufficient wallet balance',
        required: totalAmount,
        available: currentBalance
      });
    }

    // Deduct from wallet
    user.walletBalance = currentBalance - totalAmount;
    await user.save();

    // Create payment record
    const payment = new Payment({
      user: req.user.id,
      amount: totalAmount,
      type: 'food_order',
      status: 'completed',
      paymentMethod: 'wallet',
      orderId: order._id,
      description: `Food order payment - ${order.items.length} items`
    });

    await payment.save();

    // Update order status
    order.status = 'preparing';
    await order.save();
    
    // Create notification for successful payment
    await createPaymentSuccessNotification(
      user._id,
      totalAmount,
      'food_order',
      payment._id
    );
    
    // Check if wallet balance is low (less than 100 ETB) and notify
    if (user.walletBalance < 100) {
      await createLowBalanceNotification(user._id, user.walletBalance);
    }

    res.json({
      message: 'Payment successful',
      newBalance: user.walletBalance,
      paymentId: payment._id
    });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Simulate payment completion for testing
router.post('/complete/:paymentId', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    console.log('Payment completion request for paymentId:', paymentId);
    console.log('Authenticated user ID:', req.user.id);

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      console.log('Payment not found:', paymentId);
      return res.status(404).json({ error: 'Payment not found' });
    }

    console.log('Payment found:', {
      id: payment._id,
      user: payment.user,
      amount: payment.amount,
      status: payment.status,
      type: payment.type
    });

    if (payment.user.toString() !== req.user.id) {
      console.log('Payment user mismatch:', {
        paymentUser: payment.user.toString(),
        requestUser: req.user.id
      });
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status === 'completed') {
      console.log('Payment already completed');
      return res.status(400).json({ error: 'Payment already completed' });
    }

    // Check user role
    const user = await User.findById(payment.user);
    if (!user) {
      console.log('User not found for payment:', payment.user);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found:', {
      id: user._id,
      email: user.email,
      role: user.role,
      currentBalance: user.walletBalance
    });

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Admins cannot access wallet features' });
    }

    // Update payment status
    payment.status = 'completed';
    await payment.save();
    console.log('Payment status updated to completed');

    // Add funds to user wallet
    const currentBalance = user.walletBalance || 0;
    user.walletBalance = currentBalance + payment.amount;
    await user.save();

    console.log('User wallet updated:', {
      oldBalance: currentBalance,
      newBalance: user.walletBalance,
      amountAdded: payment.amount
    });

    res.json({
      message: 'Payment completed successfully',
      newBalance: user.walletBalance
    });
  } catch (err) {
    console.error('Payment completion error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Manual wallet balance update for testing/fixing
router.post('/fix-balance', auth, async (req, res) => {
  try {
    console.log('Manual balance fix request for user ID:', req.user.id);
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find all completed topup payments for this user that haven't been added to balance
    const completedPayments = await Payment.find({
      user: req.user.id,
      type: 'topup',
      status: 'completed'
    });

    console.log('Found completed payments:', completedPayments.length);

    let totalAmount = 0;
    for (const payment of completedPayments) {
      // Check if this payment amount has already been added to balance
      // For now, we'll recalculate the total from all completed payments
      totalAmount += payment.amount;
    }

    console.log('Calculated total from completed payments:', totalAmount);

    // Update user's wallet balance
    const oldBalance = user.walletBalance || 0;
    user.walletBalance = totalAmount;
    await user.save();

    console.log('Updated user balance:', {
      oldBalance,
      newBalance: user.walletBalance,
      totalAdded: totalAmount
    });

    res.json({
      message: 'Wallet balance fixed',
      oldBalance,
      newBalance: user.walletBalance,
      paymentsProcessed: completedPayments.length
    });
  } catch (err) {
    console.error('Balance fix error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;