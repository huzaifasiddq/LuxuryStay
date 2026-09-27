import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import route files
import authRoutes from './routes/authRoutes.mjs';
import roomRoutes from './routes/roomRoutes.mjs';
import guestRoutes from './routes/guestRoutes.mjs';
import reservationRoutes from './routes/reservationRoutes.mjs';
import invoiceRoutes from './routes/invoiceRoutes.mjs';
import taskRoutes from './routes/taskRoutes.mjs';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/tasks', taskRoutes);


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