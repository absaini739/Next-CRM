import { Router } from 'express';
import * as voipProviderController from '../controllers/voip-provider.controller';

const router = Router();

router.get('/', voipProviderController.getAllProviders);
router.get('/:id', voipProviderController.getProviderById);
router.post('/', voipProviderController.createProvider);
router.put('/:id', voipProviderController.updateProvider);
router.delete('/:id', voipProviderController.deleteProvider);

export default router;
