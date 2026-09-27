import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.mjs';
import { protect } from '../middleware/authMiddleware.mjs';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (Requires valid JWT token)
router.get('/me', protect, getMe);

export default router;