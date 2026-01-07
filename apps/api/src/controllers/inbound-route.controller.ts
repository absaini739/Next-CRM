import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Get all inbound routes
export const getAllRoutes = async (req: Request, res: Response) => {
    try {
        const routes = await prisma.inboundRoute.findMany({
            orderBy: { priority: 'asc' },
            include: {
                trunk: {
                    include: {
                        provider: true,
                    },
                },
            },
        });
        res.json(routes);
    } catch (error) {
        console.error('Error fetching inbound routes:', error);
        res.status(500).json({ error: 'Failed to fetch inbound routes' });
    }
};

// Get single inbound route
export const getRouteById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const route = await prisma.inboundRoute.findUnique({
            where: { id: parseInt(id) },
            include: {
                trunk: {
                    include: {
                        provider: true,
                    },
                },
            },
        });

        if (!route) {
            return res.status(404).json({ error: 'Inbound route not found' });
        }

        res.json(route);
    } catch (error) {
        console.error('Error fetching inbound route:', error);
        res.status(500).json({ error: 'Failed to fetch inbound route' });
    }
};

// Create inbound route
export const createRoute = async (req: Request, res: Response) => {
    try {
        const {
            name,
            did_pattern,
            destination_type,
            destination_id,
            trunk_id,
            priority = 1,
            active = true,
        } = req.body;

        // Validation
        if (!name || !did_pattern || !destination_type || !destination_id || !trunk_id) {
            return res.status(400).json({
                error: 'Name, DID pattern, destination type, destination ID, and trunk are required'
            });
        }

        const route = await prisma.inboundRoute.create({
            data: {
                name,
                did_pattern,
                destination_type,
                destination_id,
                trunk_id: parseInt(trunk_id),
                priority,
                active,
            },
            include: {
                trunk: {
                    include: {
                        provider: true,
                    },
                },
            },
        });

        res.status(201).json(route);
    } catch (error) {
        console.error('Error creating inbound route:', error);
        res.status(500).json({ error: 'Failed to create inbound route' });
    }
};

// Update inbound route
export const updateRoute = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            name,
            did_pattern,
            destination_type,
            destination_id,
            trunk_id,
            priority,
            active,
        } = req.body;

        const route = await prisma.inboundRoute.update({
            where: { id: parseInt(id) },
            data: {
                name,
                did_pattern,
                destination_type,
                destination_id,
                trunk_id: trunk_id ? parseInt(trunk_id) : undefined,
                priority,
                active,
            },
            include: {
                trunk: {
                    include: {
                        provider: true,
                    },
                },
            },
        });

        res.json(route);
    } catch (error) {
        console.error('Error updating inbound route:', error);
        res.status(500).json({ error: 'Failed to update inbound route' });
    }
};

// Delete inbound route
export const deleteRoute = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.inboundRoute.delete({
            where: { id: parseInt(id) },
        });

        res.json({ message: 'Inbound route deleted successfully' });
    } catch (error) {
        console.error('Error deleting inbound route:', error);
        res.status(500).json({ error: 'Failed to delete inbound route' });
    }
};
