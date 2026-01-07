import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Get all VoIP trunks
export const getAllTrunks = async (req: Request, res: Response) => {
    try {
        const trunks = await prisma.voipTrunk.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                provider: true,
                inbound_routes: true,
            },
        });
        res.json(trunks);
    } catch (error) {
        console.error('Error fetching VoIP trunks:', error);
        res.status(500).json({ error: 'Failed to fetch VoIP trunks' });
    }
};

// Get single VoIP trunk
export const getTrunkById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const trunk = await prisma.voipTrunk.findUnique({
            where: { id: parseInt(id) },
            include: {
                provider: true,
                inbound_routes: true,
            },
        });

        if (!trunk) {
            return res.status(404).json({ error: 'VoIP trunk not found' });
        }

        res.json(trunk);
    } catch (error) {
        console.error('Error fetching VoIP trunk:', error);
        res.status(500).json({ error: 'Failed to fetch VoIP trunk' });
    }
};

// Create VoIP trunk
export const createTrunk = async (req: Request, res: Response) => {
    try {
        const {
            name,
            provider_id,
            sip_domain,
            sip_port = 5060,
            transport_protocol = 'UDP',
            auth_method = 'username',
            sip_username,
            sip_password,
            registration_required = false,
            options_context,
            active = true,
        } = req.body;

        // Validation
        if (!name || !provider_id || !sip_domain) {
            return res.status(400).json({ error: 'Name, provider, and SIP domain are required' });
        }

        const trunk = await prisma.voipTrunk.create({
            data: {
                name,
                provider_id: parseInt(provider_id),
                sip_domain,
                sip_port,
                transport_protocol,
                auth_method,
                sip_username,
                sip_password,
                registration_required,
                options_context,
                active,
            },
            include: {
                provider: true,
            },
        });

        res.status(201).json(trunk);
    } catch (error) {
        console.error('Error creating VoIP trunk:', error);
        res.status(500).json({ error: 'Failed to create VoIP trunk' });
    }
};

// Update VoIP trunk
export const updateTrunk = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            name,
            provider_id,
            sip_domain,
            sip_port,
            transport_protocol,
            auth_method,
            sip_username,
            sip_password,
            registration_required,
            options_context,
            active,
        } = req.body;

        const trunk = await prisma.voipTrunk.update({
            where: { id: parseInt(id) },
            data: {
                name,
                provider_id: provider_id ? parseInt(provider_id) : undefined,
                sip_domain,
                sip_port,
                transport_protocol,
                auth_method,
                sip_username,
                sip_password,
                registration_required,
                options_context,
                active,
            },
            include: {
                provider: true,
            },
        });

        res.json(trunk);
    } catch (error) {
        console.error('Error updating VoIP trunk:', error);
        res.status(500).json({ error: 'Failed to update VoIP trunk' });
    }
};

// Delete VoIP trunk
export const deleteTrunk = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.voipTrunk.delete({
            where: { id: parseInt(id) },
        });

        res.json({ message: 'VoIP trunk deleted successfully' });
    } catch (error) {
        console.error('Error deleting VoIP trunk:', error);
        res.status(500).json({ error: 'Failed to delete VoIP trunk' });
    }
};
