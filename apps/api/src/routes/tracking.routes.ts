import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as trackingController from '../controllers/tracking.controller';

const router = Router();

// Public endpoints (no auth needed for tracking)
router.get('/pixel/:messageId', trackingController.trackOpen);
router.get('/click/:trackingId', trackingController.trackClick);

// Authenticated endpoint for stats
router.get('/stats/:messageId', authMiddleware, trackingController.getTrackingStats);

export default router;
