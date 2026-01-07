import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as calendarController from '../controllers/calendar.controller';

const router = Router();

router.use(authMiddleware);

// Calendar views
router.get('/events', calendarController.getCalendarEvents);
router.get('/month/:year/:month', calendarController.getMonthView);
router.get('/week/:year/:week', calendarController.getWeekView);
router.get('/day/:date', calendarController.getDayView);

// Event CRUD
router.post('/events', calendarController.createCalendarEvent);
router.put('/events/:id', calendarController.updateCalendarEvent);
router.delete('/events/:id', calendarController.deleteCalendarEvent);

export default router;
