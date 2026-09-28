import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.mjs';
import { protect } from '../middleware/authMiddleware.mjs';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

export default router;
