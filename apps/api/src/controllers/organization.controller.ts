import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const organizationSchema = z.object({
    name: z.string().min(1),
    address: z.array(z.object({
        line1: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        postal_code: z.string().optional(),
    })).optional(),
});

export const createOrganization = async (req: Request, res: Response) => {
    try {
        const data = organizationSchema.parse(req.body);
        // @ts-ignore
        const userId = req.userId;

        const organization = await prisma.organization.create({
            data: {
                ...data,
                user_id: userId,
            },
        });
        res.status(201).json(organization);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Error creating organization' });
    }
};

export const getOrganizations = async (req: Request, res: Response) => {
    try {
        const organizations = await prisma.organization.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(organizations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching organizations' });
    }
};

export const getOrganization = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const organization = await prisma.organization.findUnique({
            where: { id: Number(id) },
            include: { persons: true }
        });
        if (!organization) return res.status(404).json({ message: 'Organization not found' });
        res.json(organization);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching organization' });
    }
};

export const updateOrganization = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const data = organizationSchema.parse(req.body);

        const organization = await prisma.organization.update({
            where: { id },
            data,
        });

        res.json(organization);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Error updating organization' });
    }
};

export const deleteOrganization = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        await prisma.organization.delete({
            where: { id },
        });

        res.json({ message: 'Organization deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting organization' });
    }
};
