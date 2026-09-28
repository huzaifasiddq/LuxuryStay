import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import route files
import authRoutes from './routes/authRoutes.mjs';
import roomRoutes from './routes/roomRoutes.mjs';
import guestRoutes from './routes/guestRoutes.mjs';
import reservationRoutes from './routes/reservationRoutes.mjs';
import invoiceRoutes from './routes/invoiceRoutes.mjs';
import taskRoutes from './routes/taskRoutes.mjs';
import staffRoutes from './routes/staffRoutes.mjs';
import settingsRoutes from './routes/settingsRoutes.mjs';
import notificationRoutes from './routes/notificationRoutes.mjs';
import feedbackRoutes from './routes/feedbackRoutes.mjs';
import serviceRequestRoutes from './routes/serviceRequestRoutes.mjs';
import reportRoutes from './routes/reportRoutes.mjs';

dotenv.config();

const app = express();

// Middlewares
app.use(helmet()); // sets secure HTTP headers
app.use(cors());
app.use(express.json());

// Basic rate limiting to reduce brute-force / abuse risk (NFR: Security)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// Stricter limiter specifically for login attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/reports', reportRoutes);


// Test Route
app.get('/', (req, res) => {
  res.send('LuxuryStay Hospitality API is running...');
});

// Database Connection & Server Startup
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully!');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });