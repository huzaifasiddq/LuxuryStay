import express from 'express';
import {
  getReservations,
  getReservationById,
  createReservation,
  updateReservationStatus,
} from '../controllers/reservationController.mjs';
import { protect, authorize } from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorize('Admin', 'Manager', 'Receptionist'), getReservations)
  .post(authorize('Admin', 'Manager', 'Receptionist', 'Guest'), createReservation);

router
  .route('/:id')
  .get(getReservationById);

router
  .route('/:id/status')
  .patch(authorize('Admin', 'Manager', 'Receptionist'), updateReservationStatus);

export default router;