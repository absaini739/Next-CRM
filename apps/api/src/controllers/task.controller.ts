import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { NotificationService } from '../services/notification.service';

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
    progress: z.number().min(0).max(100).default(0),
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

        const [assigner, assignee] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId }, include: { role: true } }),
            prisma.user.findUnique({ where: { id: assignedToId! }, include: { role: true } })
        ]);

        const assignedByRole = assigner?.role.name || 'new';
        const assignedToRole = assignee?.role.name || 'new';

        // Role Weight Mapping
        const roleWeights: Record<string, number> = {
            'Administrator': 100,
            'Manager': 80,
            'Lead': 60,
            'Employee': 40,
            'new': 20
        };

        const assignerWeight = roleWeights[assignedByRole] || 0;
        const assigneeWeight = roleWeights[assignedToRole] || 0;

        // Hierarchy Validation
        let canAssign = false;
        if (assignedByRole === 'Administrator') {
            canAssign = true;
        } else if (assignedByRole === 'Manager' && assigneeWeight < 80) {
            canAssign = true;
        } else if (assignedByRole === 'Lead' && assigneeWeight < 60) {
            canAssign = true;
        }

        if (!canAssign) {
            return res.status(403).json({
                message: `You (${assignedByRole}) do not have permission to assign tasks to ${assignedToRole}.`
            });
        }

        const task = await prisma.task.create({
            data: {
                title: data.title,
                description: data.description,
                task_type: data.task_type,
                priority: data.priority,
                status: data.status,
                assigned_to_id: assignedToId!,
                assigned_by_id: userId,
                due_date: data.due_date ? new Date(data.due_date) : null,
                due_time: data.due_time,
                estimated_duration: data.estimated_duration,
                person_id: data.person_id,
                organization_id: data.organization_id,
                lead_id: data.lead_id,
                deal_id: data.deal_id,
                is_recurring: data.is_recurring,
                recurrence_pattern: data.recurrence_pattern,
                recurrence_end_date: data.recurrence_end_date ? new Date(data.recurrence_end_date) : null,
                tags: data.tags || [],
                checklist: data.checklist || [],
                progress: data.progress || 0,
                assigned_by_role: assignedByRole,
                assigned_to_role: assignedToRole
            },
            include: {
                assigned_to: { select: { id: true, name: true, email: true } },
                assigned_by: { select: { id: true, name: true, email: true } }
            }
        });

        // Trigger Notification
        if (assignedToId !== userId) {
            await NotificationService.notify(
                assignedToId!,
                `New task assigned by ${assigner?.name}: ${task.title}`,
                'task',
                task.id
            );
        }

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
        // @ts-ignore
        const userId = Number(req.userId);

        // Fetch existing task to check permissions and get current assignee
        const existingTask = await prisma.task.findUnique({
            where: { id },
            include: {
                assigned_to: { select: { id: true, name: true } },
                assigned_by: { select: { id: true, name: true } }
            }
        });

        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Fetch user roles for hierarchy check
        const currentUser = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
        const currentUserRole = currentUser?.role.name || 'new';

        // Role Weight Mapping
        const roleWeights: Record<string, number> = {
            'Administrator': 100,
            'Manager': 80,
            'Lead': 60,
            'Employee': 40,
            'new': 20
        };

        const currentWeight = roleWeights[currentUserRole] || 0;

        // If trying to reassign
        if (data.assigned_to_id && data.assigned_to_id !== existingTask.assigned_to_id) {
            const newAssignee = await prisma.user.findUnique({ where: { id: data.assigned_to_id }, include: { role: true } });
            const newAssigneeRole = newAssignee?.role.name || 'new';
            const newAssigneeWeight = roleWeights[newAssigneeRole] || 0;

            let canReassign = false;
            if (currentUserRole === 'Administrator') {
                canReassign = true;
            } else if (currentUserRole === 'Manager' && newAssigneeWeight < 80) {
                canReassign = true;
            } else if (currentUserRole === 'Lead' && newAssigneeWeight < 60) {
                canReassign = true;
            }

            if (!canReassign) {
                return res.status(403).json({
                    message: `You (${currentUserRole}) do not have permission to reassign tasks to ${newAssigneeRole}.`
                });
            }
        }

        const task = await prisma.task.update({
            where: { id },
            data: {
                ...data,
                due_date: data.due_date ? new Date(data.due_date) : undefined,
                recurrence_end_date: data.recurrence_end_date ? new Date(data.recurrence_end_date) : undefined,
                completed_at: data.status === 'completed' && !data.completed_at ? new Date() : undefined,
                progress: data.status === 'completed' ? 100 : data.progress
            },
            include: {
                assigned_to: { select: { id: true, name: true, email: true } },
                assigned_by: { select: { id: true, name: true, email: true } }
            }
        });

        // Trigger Notifications for updates
        const updater = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
        const updaterName = updater?.name || 'A user';

        // Notify Assignee if Assignor (or someone else) updates the task
        if (task.assigned_to_id !== userId) {
            let message = `Task "${task.title}" updated by ${updaterName}`;
            if (data.status === 'completed') {
                message = `Task "${task.title}" completed by ${updaterName}`;
            } else if (data.assigned_to_id && data.assigned_to_id !== existingTask.assigned_to_id) {
                message = `You have been assigned to task: "${task.title}" by ${updaterName}`;
            } else if (data.status && data.status !== existingTask.status) {
                message = `Task "${task.title}" status changed to ${data.status} by ${updaterName}`;
            } else if (data.progress !== undefined && data.progress !== existingTask.progress) {
                message = `Task "${task.title}" progress updated to ${data.progress}% by ${updaterName}`;
            }

            await NotificationService.notify(task.assigned_to_id, message, 'task', task.id);
        }

        // Notify Assignor if Assignee updates the task
        if (task.assigned_by_id !== userId && userId === existingTask.assigned_to_id) {
            let message = `Assignee ${updaterName} updated task "${task.title}"`;
            if (data.status === 'completed') {
                message = `Assignee ${updaterName} completed task "${task.title}"`;
            } else if (data.status && data.status !== existingTask.status) {
                message = `Assignee ${updaterName} changed status of "${task.title}" to ${data.status}`;
            } else if (data.progress !== undefined && data.progress !== existingTask.progress) {
                message = `Assignee ${updaterName} updated progress of "${task.title}" to ${data.progress}%`;
            }

            await NotificationService.notify(task.assigned_by_id, message, 'task', task.id);
        }

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
        const { status, mode } = req.query;

        const where: any = {};

        if (mode === 'assigned_by_me') {
            where.assigned_by_id = userId;
        } else {
            where.assigned_to_id = userId;
        }

        if (status) where.status = status;

        const tasks = await prisma.task.findMany({
            where,
            include: {
                assigned_to: { select: { id: true, name: true } },
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
                }
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
