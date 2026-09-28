import express from 'express';
import {
  getFeedback,
  createFeedback,
  respondToFeedback,
  deleteFeedback,
} from '../controllers/feedbackController.mjs';
import { protect, authorize } from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.use(protect, authorize('Admin', 'Manager', 'Receptionist'));

router.route('/').get(getFeedback).post(createFeedback);
router.put('/:id/respond', authorize('Admin', 'Manager'), respondToFeedback);
router.delete('/:id', authorize('Admin'), deleteFeedback);

export default router;
