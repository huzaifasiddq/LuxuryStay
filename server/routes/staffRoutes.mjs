import express from 'express';
import {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  resetStaffPassword,
  toggleStaffStatus,
  deleteStaff,
} from '../controllers/staffController.mjs';
import { protect, authorize } from '../middleware/authMiddleware.mjs';

const router = express.Router();

// All staff-management routes require login + Admin/Manager role
router.use(protect, authorize('Admin', 'Manager'));

// Routes for /api/staff
router
  .route('/')
  .get(getStaff)
  .post(createStaff);

// Routes for /api/staff/:id
router
  .route('/:id')
  .get(getStaffById)
  .put(updateStaff)
  .delete(authorize('Admin'), deleteStaff);

router.put('/:id/password', resetStaffPassword);
router.put('/:id/status', toggleStaffStatus);

export default router;
