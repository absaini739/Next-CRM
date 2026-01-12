import { Router } from 'express';
import { createDeal, getDeals, getDeal, updateDeal, deleteDeal, getDealEmails } from '../controllers/deal.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createDeal);
router.get('/', getDeals);
router.get('/:id', getDeal);
router.get('/:id/emails', getDealEmails);
router.put('/:id', updateDeal);
router.delete('/:id', deleteDeal);

export default router;
