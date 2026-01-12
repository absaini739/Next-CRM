import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as templateController from '../controllers/email-template.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplate);
router.post('/', templateController.createTemplate);
router.put('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);

export default router;
