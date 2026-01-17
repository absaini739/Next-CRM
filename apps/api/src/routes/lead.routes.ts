import { Router } from 'express';
import { createLead, getLeads, getLead, updateLead, deleteLead, getLeadEmails, bulkUpdateLeads, bulkDeleteLeads } from '../controllers/lead.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createLead);
router.patch('/bulk', bulkUpdateLeads);
router.delete('/bulk', bulkDeleteLeads);
router.get('/', getLeads);
router.get('/:id', getLead);
router.get('/:id/emails', getLeadEmails);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;
