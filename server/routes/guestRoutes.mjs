import express from 'express';
import {
  getGuests,
  getGuestById,
  createGuest,
  updateGuest,
} from '../controllers/guestController.mjs';
import { protect, authorize } from '../middleware/authMiddleware.mjs';

const router = express.Router();

// Apply protect middleware to all routes below
router.use(protect);

router
  .route('/')
  .get(authorize('Admin', 'Manager', 'Receptionist'), getGuests)
  .post(authorize('Admin', 'Manager', 'Receptionist'), createGuest);

router
  .route('/:id')
  .get(authorize('Admin', 'Manager', 'Receptionist'), getGuestById)
  .put(authorize('Admin', 'Manager', 'Receptionist'), updateGuest);

export default router;