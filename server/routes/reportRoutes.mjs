import express from 'express';
import {
  getRevenueReport,
  getOccupancyReport,
  getDemandForecast,
  exportRevenueCsv,
} from '../controllers/reportController.mjs';
import { protect, authorize } from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.use(protect, authorize('Admin', 'Manager'));

router.get('/revenue', getRevenueReport);
router.get('/revenue/export', exportRevenueCsv);
router.get('/occupancy', getOccupancyReport);
router.get('/forecast', getDemandForecast);

export default router;
