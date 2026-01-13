import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as emailController from '../controllers/email.controller';

const router = Router();

router.use(authMiddleware);

// Bulk Operations (Static routes first)
router.patch('/bulk', emailController.bulkUpdate);
router.post('/bulk/delete', emailController.bulkDelete);

// Folder & Stats
router.get('/folders/counts', emailController.getFolderCounts);
router.get('/thread/:id', emailController.getThread);

// Standard CRUD
router.get('/', emailController.getEmails);
router.get('/:id/attachments/:attachmentId', emailController.getAttachment);
router.get('/:id', emailController.getEmail);

// Manual Connect & Sync
router.post('/sync', emailController.syncEmails);
router.post('/connect-manual', emailController.connectManual);

router.post('/', emailController.createEmail);
router.patch('/:id', emailController.updateEmail);
router.post('/:id/archive', emailController.archiveEmail);
router.delete('/:id', emailController.deleteEmail);

export default router;
