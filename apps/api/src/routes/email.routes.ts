import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as emailController from '../controllers/email.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', emailController.getEmails);
router.get('/folders/counts', emailController.getFolderCounts);
router.get('/thread/:id', emailController.getThread);
router.get('/:id/attachments/:attachmentId', emailController.getAttachment);
router.get('/:id', emailController.getEmail);
// Manual Connect
router.post('/sync', emailController.syncEmails);
router.post('/connect-manual', emailController.connectManual);

router.post('/', emailController.createEmail);
router.patch('/:id', emailController.updateEmail);
router.post('/:id/archive', emailController.archiveEmail);
router.delete('/:id', emailController.deleteEmail);

export default router;
