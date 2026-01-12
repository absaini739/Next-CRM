import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as emailAccountController from '../controllers/email-account.controller';

const router = Router();

// OAuth callback - NO AUTH REQUIRED (comes from Google/Microsoft)
router.get('/oauth/callback', emailAccountController.handleOAuthCallback);

// All other routes require authentication
router.use(authMiddleware);

// OAuth flow
router.post('/connect', emailAccountController.initiateOAuth);

// Account management
router.get('/', emailAccountController.getEmailAccounts);
router.delete('/:id', emailAccountController.disconnectAccount);
router.put('/:id/default', emailAccountController.setDefaultAccount);
router.post('/:id/sync', emailAccountController.triggerSync);
router.post('/:id/sync-now', emailAccountController.syncNow);

export default router;
