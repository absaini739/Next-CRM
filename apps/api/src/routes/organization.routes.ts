import { Router } from 'express';
import { createOrganization, getOrganizations, getOrganization, updateOrganization, deleteOrganization } from '../controllers/organization.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createOrganization);
router.get('/', getOrganizations);
router.get('/:id', getOrganization);
router.put('/:id', updateOrganization);
router.delete('/:id', deleteOrganization);

export default router;
