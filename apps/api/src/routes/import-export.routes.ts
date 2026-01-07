import { Router } from 'express';
import { createImport, exportData } from '../controllers/import-export.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/import', createImport);
router.get('/export', exportData);

export default router;
