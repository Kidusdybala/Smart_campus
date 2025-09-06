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
    const { items } = req.body;
    let total = 0;
    for (let item of items) {
      const food = await Food.findById(item.food);
      total += food.price * item.quantity;
    }
    const order = new Order({ user: req.user.id, items, total });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's orders
router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.food');
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

module.exports = router;