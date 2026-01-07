import { Router } from 'express';
import * as callRecordingController from '../controllers/call-recording.controller';

const router = Router();

router.get('/', callRecordingController.getAllRecordings);
router.get('/:id', callRecordingController.getRecordingById);

export default router;
