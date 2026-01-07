import { Router } from 'express';
import {
    getDashboardStats,
    getLeadsByStages,
    getRevenueBySource,
    getRevenueByType,
    getLeadsOverTime
} from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', getDashboardStats);
router.get('/leads-by-stages', getLeadsByStages);
router.get('/revenue-by-source', getRevenueBySource);
router.get('/revenue-by-type', getRevenueByType);
router.get('/leads-over-time', getLeadsOverTime);

export default router;
