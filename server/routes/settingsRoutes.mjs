import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.mjs';
import { protect, authorize } from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.route('/').get(protect, getSettings).put(protect, authorize('Admin'), updateSettings);

export default router;
