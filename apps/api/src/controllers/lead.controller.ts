import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const leadSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    lead_value: z.number().optional(), // Decimal in DB, number in JSON
    person_id: z.number().int(),
    lead_source_id: z.number().int(),
    lead_type_id: z.number().int(),
    lead_pipeline_id: z.number().int().optional(),
    lead_stage_id: z.number().int().optional(),
});

export const createLead = async (req: Request, res: Response) => {
    try {
        const data = leadSchema.parse(req.body);
        // @ts-ignore
        const userId = req.userId;

        const lead = await prisma.lead.create({
            data: {
                ...data,
                user_id: userId,
                status: 1, // Default Open
            },
        });
        res.status(201).json(lead);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Error creating lead' });
    }
};

export const getLeads = async (req: Request, res: Response) => {
    try {
        const leads = await prisma.lead.findMany({
            include: {
                person: true,
                source: true,
                type: true,
                pipeline: true,
                stage: true
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(leads);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching leads' });
    }
};

export const getLead = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const lead = await prisma.lead.findUnique({
            where: { id },
            include: {
                person: true,
                source: true,
                type: true,
                pipeline: true,
                stage: true,
                deals: true
            }
        });
        if (!lead) return res.status(404).json({ message: 'Lead not found' });
        res.json(lead);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lead' });
    }
};

export const updateLead = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const data = leadSchema.parse(req.body);

        const lead = await prisma.lead.update({
            where: { id },
            data,
        });

        res.json(lead);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Error updating lead' });
    }
};

export const deleteLead = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.lead.delete({ where: { id } });
        res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting lead' });
    }
};
