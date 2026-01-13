import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as callController from '../controllers/call.controller';

const router = Router();

// Public webhooks (no auth required)
router.post('/twiml/outbound', callController.outboundTwiML);
router.post('/webhooks/status', callController.statusWebhook);

// Protected routes (require authentication)
router.use(authMiddleware);

// Token generation for WebRTC
router.get('/token', callController.getToken);

// Call management
router.post('/initiate', callController.initiateCall);
router.post('/:callSid/end', callController.endCall);

// Call history
router.get('/history', callController.getCallHistory);
router.get('/:id', callController.getCallDetails);

export default router;
