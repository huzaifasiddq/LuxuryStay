import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
} from '../controllers/taskController.mjs';
import { protect, authorize } from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(authorize('Admin', 'Manager', 'Receptionist'), createTask);

router
  .route('/:id')
  .get(getTaskById);

router
  .route('/:id/status')
  .patch(authorize('Admin', 'Manager', 'Housekeeping', 'Maintenance', 'Laundry', 'Kitchen'), updateTaskStatus);

export default router;