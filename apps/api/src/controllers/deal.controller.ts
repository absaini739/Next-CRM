import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const dealSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    deal_value: z.number().optional(),
    person_id: z.number().int().optional(),
    lead_id: z.number().int().optional(),
    lead_pipeline_id: z.number().int().optional(),
    lead_pipeline_stage_id: z.number().int().optional(),
});

export const createDeal = async (req: Request, res: Response) => {
    try {
        const data = dealSchema.parse(req.body);
        // @ts-ignore
        const userId = req.userId;

        const deal = await prisma.deal.create({
            data: {
                ...data,
                user_id: userId,
                status: 'open',
            },
        });
        res.status(201).json(deal);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        console.error(error);
        res.status(500).json({ message: 'Error creating deal' });
    }
};

export const getDeals = async (req: Request, res: Response) => {
    try {
        const deals = await prisma.deal.findMany({
            include: {
                person: true,
                pipeline: true,
                stage: true // Pipeline Stage
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(deals);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching deals' });
    }
};

export const updateDeal = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const data = dealSchema.parse(req.body);

        const deal = await prisma.deal.update({
            where: { id },
            data,
        });

        res.json(deal);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Error updating deal' });
    }
};

export const deleteDeal = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.deal.delete({ where: { id } });
        res.json({ message: 'Deal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting deal' });
    }
};
