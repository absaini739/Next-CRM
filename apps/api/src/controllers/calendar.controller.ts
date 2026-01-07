import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const calendarEventSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    event_type: z.enum(['meeting', 'call', 'deadline', 'personal']),
    start_date: z.string(),
    end_date: z.string(),
    all_day: z.boolean().default(false),
    location: z.string().optional(),
    task_id: z.number().optional(),
    person_id: z.number().optional(),
    organization_id: z.number().optional(),
    lead_id: z.number().optional(),
    deal_id: z.number().optional(),
    is_recurring: z.boolean().default(false),
    recurrence_pattern: z.string().optional(),
});

// Get calendar events for a date range
export const getCalendarEvents = async (req: Request, res: Response) => {
    try {
        const { start_date, end_date, event_type } = req.query;
        // @ts-ignore
        const userId = req.userId;

        const where: any = { user_id: userId };

        if (start_date && end_date) {
            where.start_date = {
                gte: new Date(start_date as string),
                lte: new Date(end_date as string)
            };
        }

        if (event_type) {
            where.event_type = event_type;
        }

        const events = await prisma.calendarEvent.findMany({
            where,
            include: {
                task: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true
                    }
                },
                person: { select: { id: true, name: true } },
                organization: { select: { id: true, name: true } },
                lead: { select: { id: true, title: true } },
                deal: { select: { id: true, title: true } }
            },
            orderBy: { start_date: 'asc' }
        });

        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching calendar events' });
    }
};

// Get month view data
export const getMonthView = async (req: Request, res: Response) => {
    try {
        const { year, month } = req.params;
        // @ts-ignore
        const userId = req.userId;

        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

        const [events, tasks] = await Promise.all([
            prisma.calendarEvent.findMany({
                where: {
                    user_id: userId,
                    start_date: { gte: startDate, lte: endDate }
                },
                include: {
                    task: { select: { id: true, title: true, status: true, priority: true } }
                }
            }),
            prisma.task.findMany({
                where: {
                    OR: [
                        { assigned_to_id: userId },
                        { assigned_by_id: userId }
                    ],
                    due_date: { gte: startDate, lte: endDate }
                },
                select: {
                    id: true,
                    title: true,
                    task_type: true,
                    priority: true,
                    status: true,
                    due_date: true,
                    due_time: true
                }
            })
        ]);

        res.json({ events, tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching month view' });
    }
};

// Get week view data
export const getWeekView = async (req: Request, res: Response) => {
    try {
        const { year, week } = req.params;
        // @ts-ignore
        const userId = req.userId;

        // Calculate start and end of week
        const startDate = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59);

        const [events, tasks] = await Promise.all([
            prisma.calendarEvent.findMany({
                where: {
                    user_id: userId,
                    start_date: { gte: startDate, lte: endDate }
                },
                include: {
                    task: { select: { id: true, title: true, status: true, priority: true } }
                }
            }),
            prisma.task.findMany({
                where: {
                    OR: [
                        { assigned_to_id: userId },
                        { assigned_by_id: userId }
                    ],
                    due_date: { gte: startDate, lte: endDate }
                },
                select: {
                    id: true,
                    title: true,
                    task_type: true,
                    priority: true,
                    status: true,
                    due_date: true,
                    due_time: true
                }
            })
        ]);

        res.json({ events, tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching week view' });
    }
};

// Get day view data
export const getDayView = async (req: Request, res: Response) => {
    try {
        const { date } = req.params;
        // @ts-ignore
        const userId = req.userId;

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const [events, tasks] = await Promise.all([
            prisma.calendarEvent.findMany({
                where: {
                    user_id: userId,
                    start_date: { gte: startDate, lte: endDate }
                },
                include: {
                    task: { select: { id: true, title: true, status: true, priority: true } },
                    person: { select: { id: true, name: true } },
                    lead: { select: { id: true, title: true } },
                    deal: { select: { id: true, title: true } }
                },
                orderBy: { start_date: 'asc' }
            }),
            prisma.task.findMany({
                where: {
                    OR: [
                        { assigned_to_id: userId },
                        { assigned_by_id: userId }
                    ],
                    due_date: { gte: startDate, lte: endDate }
                },
                include: {
                    person: { select: { id: true, name: true } },
                    lead: { select: { id: true, title: true } },
                    deal: { select: { id: true, title: true } }
                },
                orderBy: { due_time: 'asc' }
            })
        ]);

        res.json({ events, tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching day view' });
    }
};

// Create calendar event
export const createCalendarEvent = async (req: Request, res: Response) => {
    try {
        const data = calendarEventSchema.parse(req.body);
        // @ts-ignore
        const userId = req.userId;

        const event = await prisma.calendarEvent.create({
            data: {
                ...data,
                user_id: userId,
                start_date: new Date(data.start_date),
                end_date: new Date(data.end_date)
            },
            include: {
                task: { select: { id: true, title: true } },
                person: { select: { id: true, name: true } },
                lead: { select: { id: true, title: true } },
                deal: { select: { id: true, title: true } }
            }
        });

        res.status(201).json(event);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Error creating calendar event' });
    }
};

// Update calendar event
export const updateCalendarEvent = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;

        const event = await prisma.calendarEvent.update({
            where: { id },
            data: {
                ...data,
                start_date: data.start_date ? new Date(data.start_date) : undefined,
                end_date: data.end_date ? new Date(data.end_date) : undefined
            },
            include: {
                task: { select: { id: true, title: true } }
            }
        });

        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating calendar event' });
    }
};

// Delete calendar event
export const deleteCalendarEvent = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        await prisma.calendarEvent.delete({ where: { id } });

        res.json({ message: 'Calendar event deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting calendar event' });
    }
};
