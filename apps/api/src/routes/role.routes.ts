import { Router } from 'express';
import { getRoles, getRole, createRole, updateRole, deleteRole, getPermissionsTree } from '../controllers/role.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/permissions-tree', getPermissionsTree);
router.get('/', getRoles);
router.get('/:id', getRole);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router;

