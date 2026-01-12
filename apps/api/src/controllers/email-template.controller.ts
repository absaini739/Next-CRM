import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const createTemplateSchema = z.object({
    name: z.string().min(1),
    subject: z.string(),
    body: z.string(),
    description: z.string().optional(),
    variables: z.array(z.string()).optional(),
    is_shared: z.boolean().optional(),
});

const updateTemplateSchema = createTemplateSchema.partial();

// Get all templates for user
export const getTemplates = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;

        const templates = await prisma.emailTemplate.findMany({
            where: {
                OR: [
                    { user_id: userId },
                    { is_shared: true },
                ],
            },
            orderBy: { created_at: 'desc' },
        });

        res.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ message: 'Error fetching templates' });
    }
};

// Get single template
export const getTemplate = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        // @ts-ignore
        const userId = req.userId;

        const template = await prisma.emailTemplate.findFirst({
            where: {
                id,
                OR: [
                    { user_id: userId },
                    { is_shared: true },
                ],
            },
        });

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        res.json(template);
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({ message: 'Error fetching template' });
    }
};

// Create template
export const createTemplate = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const data = createTemplateSchema.parse(req.body);

        const template = await prisma.emailTemplate.create({
            data: {
                user_id: userId,
                name: data.name,
                subject: data.subject,
                body: data.body,
                description: data.description,
                variables: data.variables || [],
                is_shared: data.is_shared || false,
            },
        });

        res.status(201).json(template);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error('Error creating template:', error);
        res.status(500).json({ message: 'Error creating template' });
    }
};

// Update template
export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        // @ts-ignore
        const userId = req.userId;
        const data = updateTemplateSchema.parse(req.body);

        // Verify ownership
        const existing = await prisma.emailTemplate.findFirst({
            where: { id, user_id: userId },
        });

        if (!existing) {
            return res.status(404).json({ message: 'Template not found or unauthorized' });
        }

        const template = await prisma.emailTemplate.update({
            where: { id },
            data: {
                ...data,
                variables: data.variables !== undefined ? data.variables : undefined,
            },
        });

        res.json(template);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error('Error updating template:', error);
        res.status(500).json({ message: 'Error updating template' });
    }
};

// Delete template
export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        // @ts-ignore
        const userId = req.userId;

        // Verify ownership
        const existing = await prisma.emailTemplate.findFirst({
            where: { id, user_id: userId },
        });

        if (!existing) {
            return res.status(404).json({ message: 'Template not found or unauthorized' });
        }

        await prisma.emailTemplate.delete({ where: { id } });

        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ message: 'Error deleting template' });
    }
};
