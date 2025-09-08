const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Ensure .env is loaded from the backend folder regardless of CWD
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const qrRoutes = require('./routes/qr');
app.use('/api/qr', qrRoutes);

const foodRoutes = require('./routes/food');
app.use('/api/food', foodRoutes);

const parkingRoutes = require('./routes/parking');
app.use('/api/parking', parkingRoutes);

const recommendationRoutes = require('./routes/recommendations');
app.use('/api/recommendations', recommendationRoutes);

const scheduleRoutes = require('./routes/schedule');
app.use('/api/schedule', scheduleRoutes);

const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes);
console.log('Payment routes registered at /api/payment');

const gradeRoutes = require('./routes/grades');
app.use('/api/grades', gradeRoutes);
console.log('Grade routes registered at /api/grades');

const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);
console.log('Notification routes registered at /api/notifications');

// DB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartcampus')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));
app.get('/', (req, res) => res.send('Smart Campus API'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Socket.IO for real-time
io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

module.exports = { io };