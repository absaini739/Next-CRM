import { Router } from 'express';
import { register, login, me, getUsers, deleteUser } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.get('/users', authMiddleware, getUsers);
router.delete('/users/:id', authMiddleware, deleteUser);

export default router;
