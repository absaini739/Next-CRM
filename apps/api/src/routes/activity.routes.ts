import { Router } from 'express';
import { createActivity, getActivities } from '../controllers/activity.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createActivity);
router.get('/', getActivities);

export default router;
