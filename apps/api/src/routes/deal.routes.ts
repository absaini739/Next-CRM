import { Router } from 'express';
import { createDeal, getDeals, getDeal, updateDeal, deleteDeal } from '../controllers/deal.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createDeal);
router.get('/', getDeals);
router.get('/:id', getDeal);
router.put('/:id', updateDeal);
router.delete('/:id', deleteDeal);

export default router;
