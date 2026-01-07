import { Router } from 'express';
import {
    getPipelines,
    createPipeline,
    updatePipeline,
    deletePipeline,
    addStage,
    updateStage,
    deleteStage
} from '../controllers/pipeline.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getPipelines);
router.post('/', createPipeline);
router.put('/:id', updatePipeline);
router.delete('/:id', deletePipeline);
router.post('/:id/stages', addStage);
router.put('/:id/stages/:stageId', updateStage);
router.delete('/:id/stages/:stageId', deleteStage);

export default router;
