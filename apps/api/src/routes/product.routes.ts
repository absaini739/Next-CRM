import { Router } from 'express';
import { createProduct, getProducts } from '../controllers/product.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createProduct);
router.get('/', getProducts);

export default router;
