const express = require('express');
const { auth, roleAuth } = require('../middleware/auth');
const { Food, Order } = require('../models/Food');

const router = express.Router();

// Get menu
router.get('/menu', auth, async (req, res) => {
  try {
    const foods = await Food.find({ available: true });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Place order
router.post('/order', auth, async (req, res) => {
  try {
    // Validate user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const { items } = req.body;

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    let total = 0;
    const validatedItems = [];

    for (let item of items) {
      if (!item.food || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ error: 'Invalid item data' });
      }

      const food = await Food.findById(item.food);
      if (!food) {
        return res.status(400).json({ error: `Food item ${item.food} not found` });
      }

      total += food.price * item.quantity;
      validatedItems.push({
        food: item.food,
        quantity: item.quantity
      });
    }

    const order = new Order({
      user: req.user.id,
      items: validatedItems,
      total,
      status: 'ordered'
    });

    await order.save();

    // Populate the order before returning
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.food');

    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user's orders
router.get('/orders', async (req, res) => {
  try {
    // For development, find student user by email
    const User = require('../models/User');
    const studentUser = await User.findOne({ email: 'student@university.edu' });
    if (!studentUser) {
      return res.status(404).json({ error: 'Student user not found' });
    }

    const orders = await Order.find({ user: studentUser._id }).populate('items.food');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin add food
router.post('/menu', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const food = new Food(req.body);
    await food.save();
    res.status(201).json(food);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cafeteria get all orders
router.get('/all-orders', auth, roleAuth(['admin', 'cafeteria']), async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('items.food')
      .sort({ orderedAt: -1 });

    console.log('Orders fetched:', orders.length);
    orders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`, {
        id: order._id,
        user: order.user,
        items: order.items,
        status: order.status
      });
    });

    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: err.message });
  }
});

// Cafeteria update order status
router.put('/order/:orderId/status', auth, roleAuth(['admin', 'cafeteria']), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId).populate('items.food');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const previousStatus = order.status;
    order.status = status;
    await order.save();

    // Send notification when order becomes ready
    if (status === 'ready' && previousStatus !== 'ready') {
      const { createOrderStatusNotification } = require('../utils/notification');
      await createOrderStatusNotification(order.user.toString(), orderId, status, order.items);
      console.log(`Notification sent to user ${order.user} for order ${orderId} status: ${status}`);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;