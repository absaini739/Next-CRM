import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as taskController from '../controllers/task.controller';

const router = Router();

router.use(authMiddleware);

// Task CRUD
router.get('/', taskController.getTasks);
router.get('/my-tasks', taskController.getMyTasks);
router.get('/today', taskController.getTodayTasks);
router.get('/overdue', taskController.getOverdueTasks);
router.get('/analytics', taskController.getTaskAnalytics);
router.get('/:id', taskController.getTask);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;
