import express from 'express';
import {
  getServiceRequests,
  createServiceRequest,
  updateServiceRequestStatus,
} from '../controllers/serviceRequestController.mjs';
import { protect, authorize } from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.use(protect);

const FRONT_DESK = ['Admin', 'Manager', 'Receptionist'];
const FULFILLING_DEPTS = ['Admin', 'Manager', 'Receptionist', 'Housekeeping', 'Kitchen', 'Laundry'];

router
  .route('/')
  .get(authorize(...FULFILLING_DEPTS), getServiceRequests)
  .post(authorize(...FRONT_DESK), createServiceRequest);

router.put('/:id/status', authorize(...FULFILLING_DEPTS), updateServiceRequestStatus);

export default router;
