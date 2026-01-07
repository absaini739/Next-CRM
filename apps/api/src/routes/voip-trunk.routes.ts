import { Router } from 'express';
import * as voipTrunkController from '../controllers/voip-trunk.controller';

const router = Router();

router.get('/', voipTrunkController.getAllTrunks);
router.get('/:id', voipTrunkController.getTrunkById);
router.post('/', voipTrunkController.createTrunk);
router.put('/:id', voipTrunkController.updateTrunk);
router.delete('/:id', voipTrunkController.deleteTrunk);

export default router;
