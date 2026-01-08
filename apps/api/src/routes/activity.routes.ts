import { Router } from 'express';
import { createActivity, getActivities, updateActivity, deleteActivity } from '../controllers/activity.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createActivity);
router.get('/', getActivities);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

export default router;
