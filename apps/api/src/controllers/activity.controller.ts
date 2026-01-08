import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const activitySchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    type: z.enum(['call', 'meeting', 'task', 'note', 'email']),
    start_at: z.string().datetime().optional(), // ISO string
    end_at: z.string().datetime().optional(),
    person_id: z.number().int().optional(),
    lead_id: z.number().int().optional(),
    deal_id: z.number().int().optional(),
});

export const createActivity = async (req: Request, res: Response) => {
    try {
        const data = activitySchema.parse(req.body);
        // @ts-ignore
        const userId = req.userId;

        const activity = await prisma.activity.create({
            data: {
                title: data.title,
                description: data.description,
                type: data.type,
                start_at: data.start_at,
                end_at: data.end_at,
                person_id: data.person_id,
                lead_id: data.lead_id,
                deal_id: data.deal_id,
                user_id: userId,
            },
            include: { user: true, person: true }
        });
        res.status(201).json(activity);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        console.error(error);
        res.status(500).json({ message: 'Error creating activity' });
    }
};

export const getActivities = async (req: Request, res: Response) => {
    try {
        const activities = await prisma.activity.findMany({
            include: { user: true, person: true, lead: true, deal: true },
            orderBy: { created_at: 'desc' }
        });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching activities' });
    }
};
export const updateActivity = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = activitySchema.partial().parse(req.body);

        const activity = await prisma.activity.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                start_at: data.start_at ? new Date(data.start_at) : undefined,
                end_at: data.end_at ? new Date(data.end_at) : undefined,
            },
            include: { user: true, person: true }
        });
        res.json(activity);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        console.error(error);
        res.status(500).json({ message: 'Error updating activity' });
    }
};

export const deleteActivity = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.activity.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting activity' });
    }
};
