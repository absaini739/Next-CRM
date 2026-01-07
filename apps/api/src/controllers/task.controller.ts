import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const taskSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    task_type: z.enum(['call', 'meeting', 'email', 'follow-up', 'deadline', 'custom']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    status: z.enum(['to_do', 'in_progress', 'completed', 'cancelled']).default('to_do'),
    due_date: z.string().optional(),
    due_time: z.string().optional(),
    estimated_duration: z.number().optional(),
    assigned_to_id: z.number().optional(),
    person_id: z.number().optional(),
    organization_id: z.number().optional(),
    lead_id: z.number().optional(),
    deal_id: z.number().optional(),
    is_recurring: z.boolean().default(false),
    recurrence_pattern: z.string().optional(),
    recurrence_end_date: z.string().optional(),
    tags: z.array(z.string()).optional(),
    checklist: z.array(z.object({ text: z.string(), completed: z.boolean() })).optional(),
});

// Get all tasks with filters
export const getTasks = async (req: Request, res: Response) => {
    try {
        const {
            status,
            priority,
            assigned_to,
            task_type,
            date_from,
            date_to,
            search,
            page = 1,
            limit = 20
        } = req.query;

        // @ts-ignore
        const userId = req.userId;
        // @ts-ignore
        const userRole = req.userRole;

        const where: any = {};

        // Role-based filtering: regular users only see their tasks
        if (userRole !== 'admin' && userRole !== 'senior') {
            where.OR = [
                { assigned_to_id: userId },
                { assigned_by_id: userId }
            ];
        } else if (assigned_to) {
            where.assigned_to_id = Number(assigned_to);
        }

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (task_type) where.task_type = task_type;

        if (date_from || date_to) {
            where.due_date = {};
            if (date_from) where.due_date.gte = new Date(date_from as string);
            if (date_to) where.due_date.lte = new Date(date_to as string);
        }

        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                include: {
                    assigned_to: { select: { id: true, name: true, email: true } },
                    assigned_by: { select: { id: true, name: true, email: true } },
                    person: { select: { id: true, name: true } },
                    organization: { select: { id: true, name: true } },
                    lead: { select: { id: true, title: true } },
                    deal: { select: { id: true, title: true } },
                    comments: {
                        include: { user: { select: { id: true, name: true } } },
                        orderBy: { created_at: 'desc' },
                        take: 3
                    },
                    time_logs: true
                },
                orderBy: [
                    { status: 'asc' },
                    { due_date: 'asc' },
                    { priority: 'desc' }
                ],
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit)
            }),
            prisma.task.count({ where })
        ]);

        res.json({
            tasks,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching tasks' });
    }
};

// Get single task
export const getTask = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                assigned_to: { select: { id: true, name: true, email: true } },
                assigned_by: { select: { id: true, name: true, email: true } },
                person: true,
                organization: true,
                lead: true,
                deal: true,
                comments: {
                    include: { user: { select: { id: true, name: true } } },
                    orderBy: { created_at: 'desc' }
                },
                time_logs: {
                    include: { user: { select: { id: true, name: true } } },
                    orderBy: { logged_at: 'desc' }
                }
            }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching task' });
    }
};

// Create task
export const createTask = async (req: Request, res: Response) => {
    try {
        const data = taskSchema.parse(req.body);
        // @ts-ignore
        const userId = Number(req.userId);

        let assignedToId = data.assigned_to_id;

        // Auto-assign logic: if no assignee provided, try to inherit from Lead or Deal
        if (!assignedToId) {
            if (data.lead_id) {
                const lead = await prisma.lead.findUnique({
                    where: { id: data.lead_id },
                    select: { assigned_to_id: true, user_id: true }
                });
                assignedToId = lead?.assigned_to_id || lead?.user_id || userId;
            } else if (data.deal_id) {
                const deal = await prisma.deal.findUnique({
                    where: { id: data.deal_id },
                    select: { user_id: true }
                });
                assignedToId = deal?.user_id || userId;
            } else {
                assignedToId = userId; // Default to creator
            }
        }

        const task = await prisma.task.create({
            data: {
                ...data,
                assigned_to_id: assignedToId!,
                assigned_by_id: userId,
                due_date: data.due_date ? new Date(data.due_date) : null,
                recurrence_end_date: data.recurrence_end_date ? new Date(data.recurrence_end_date) : null,
                tags: data.tags || [],
                checklist: data.checklist || []
            },
            include: {
                assigned_to: { select: { id: true, name: true, email: true } },
                assigned_by: { select: { id: true, name: true, email: true } }
            }
        });

        res.status(201).json(task);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Error creating task' });
    }
};

// Update task
export const updateTask = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;

        const task = await prisma.task.update({
            where: { id },
            data: {
                ...data,
                due_date: data.due_date ? new Date(data.due_date) : undefined,
                recurrence_end_date: data.recurrence_end_date ? new Date(data.recurrence_end_date) : undefined,
                completed_at: data.status === 'completed' && !data.completed_at ? new Date() : undefined
            },
            include: {
                assigned_to: { select: { id: true, name: true, email: true } },
                assigned_by: { select: { id: true, name: true, email: true } }
            }
        });

        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating task' });
    }
};

// Delete task
export const deleteTask = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        await prisma.task.delete({ where: { id } });

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting task' });
    }
};

// Get my tasks (assigned to me)
export const getMyTasks = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const { status } = req.query;

        const where: any = { assigned_to_id: userId };
        if (status) where.status = status;

        const tasks = await prisma.task.findMany({
            where,
            include: {
                assigned_by: { select: { id: true, name: true } },
                person: { select: { id: true, name: true } },
                lead: { select: { id: true, title: true } },
                deal: { select: { id: true, title: true } }
            },
            orderBy: [
                { status: 'asc' },
                { due_date: 'asc' }
            ]
        });

        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching tasks' });
    }
};

// Get today's tasks
export const getTodayTasks = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const tasks = await prisma.task.findMany({
            where: {
                assigned_to_id: userId,
                due_date: {
                    gte: today,
                    lt: tomorrow
                },
                status: { not: 'completed' }
            },
            include: {
                person: { select: { id: true, name: true } },
                lead: { select: { id: true, title: true } },
                deal: { select: { id: true, title: true } }
            },
            orderBy: { due_time: 'asc' }
        });

        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching today\'s tasks' });
    }
};

// Get overdue tasks
export const getOverdueTasks = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tasks = await prisma.task.findMany({
            where: {
                assigned_to_id: userId,
                due_date: { lt: today },
                status: { not: 'completed' }
            },
            include: {
                person: { select: { id: true, name: true } },
                lead: { select: { id: true, title: true } },
                deal: { select: { id: true, title: true } }
            },
            orderBy: { due_date: 'asc' }
        });

        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching overdue tasks' });
    }
};

// Add comment to task
export const addComment = async (req: Request, res: Response) => {
    try {
        const taskId = parseInt(req.params.id);
        const { comment } = req.body;
        // @ts-ignore
        const userId = req.userId;

        const taskComment = await prisma.taskComment.create({
            data: {
                task_id: taskId,
                user_id: userId,
                comment
            },
            include: {
                user: { select: { id: true, name: true } }
            }
        });

        res.status(201).json(taskComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding comment' });
    }
};

// Log time for task
export const logTime = async (req: Request, res: Response) => {
    try {
        const taskId = parseInt(req.params.id);
        const { duration, note } = req.body;
        // @ts-ignore
        const userId = req.userId;

        const timeLog = await prisma.taskTimeLog.create({
            data: {
                task_id: taskId,
                user_id: userId,
                duration,
                note
            },
            include: {
                user: { select: { id: true, name: true } }
            }
        });

        // Update task's actual duration
        const totalDuration = await prisma.taskTimeLog.aggregate({
            where: { task_id: taskId },
            _sum: { duration: true }
        });

        await prisma.task.update({
            where: { id: taskId },
            data: { actual_duration: totalDuration._sum.duration || 0 }
        });

        res.status(201).json(timeLog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging time' });
    }
};

// Get task analytics
export const getTaskAnalytics = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        // @ts-ignore
        const userRole = req.userRole;

        const where: any = {};
        if (userRole !== 'admin' && userRole !== 'senior') {
            where.assigned_to_id = userId;
        }

        const [
            totalTasks,
            completedTasks,
            overdueTasks,
            todayTasks,
            tasksByPriority,
            tasksByType
        ] = await Promise.all([
            prisma.task.count({ where }),
            prisma.task.count({ where: { ...where, status: 'completed' } }),
            prisma.task.count({
                where: {
                    ...where,
                    due_date: { lt: new Date() },
                    status: { not: 'completed' }
                }
            }),
            prisma.task.count({
                where: {
                    ...where,
                    due_date: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        lt: new Date(new Date().setHours(23, 59, 59, 999))
                    }
                }
            }),
            prisma.task.groupBy({
                by: ['priority'],
                where,
                _count: true
            }),
            prisma.task.groupBy({
                by: ['task_type'],
                where,
                _count: true
            })
        ]);

        res.json({
            total: totalTasks,
            completed: completedTasks,
            overdue: overdueTasks,
            today: todayTasks,
            completion_rate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0,
            by_priority: tasksByPriority,
            by_type: tasksByType
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
};
