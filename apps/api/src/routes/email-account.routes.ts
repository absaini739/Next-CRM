import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as emailAccountController from '../controllers/email-account.controller';

const router = Router();

router.use(authMiddleware);

// OAuth flow
router.post('/connect', emailAccountController.initiateOAuth);
router.get('/oauth/callback', emailAccountController.handleOAuthCallback);

// Account management
router.get('/', emailAccountController.getEmailAccounts);
router.delete('/:id', emailAccountController.disconnectAccount);
router.put('/:id/default', emailAccountController.setDefaultAccount);
router.post('/:id/sync', emailAccountController.triggerSync);

export default router;
