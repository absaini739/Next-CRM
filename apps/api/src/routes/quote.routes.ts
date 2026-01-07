import { Router } from 'express';
import { createQuote, getQuotes } from '../controllers/quote.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createQuote);
router.get('/', getQuotes);

export default router;
