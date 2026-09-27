import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updatePaymentStatus,
} from '../controllers/invoiceController.mjs';
import { protect, authorize } from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorize('Admin', 'Manager', 'Receptionist'), getInvoices)
  .post(authorize('Admin', 'Manager', 'Receptionist'), createInvoice);

router
  .route('/:id')
  .get(getInvoiceById);

router
  .route('/:id/payment')
  .patch(authorize('Admin', 'Manager', 'Receptionist'), updatePaymentStatus);

export default router;