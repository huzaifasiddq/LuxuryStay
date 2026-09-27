import express from 'express';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/roomController.mjs';
import { protect, authorize } from '../middleware/authMiddleware.mjs';

const router = express.Router();

// Routes for /api/rooms
router
  .route('/')
  .get(getRooms)
  .post(protect, authorize('Admin', 'Manager'), createRoom);

// Routes for /api/rooms/:id
router
  .route('/:id')
  .get(getRoomById)
  .put(protect, authorize('Admin', 'Manager', 'Receptionist'), updateRoom)
  .delete(protect, authorize('Admin'), deleteRoom);

export default router;