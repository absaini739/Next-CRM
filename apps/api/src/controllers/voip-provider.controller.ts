import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Get all VoIP providers
export const getAllProviders = async (req: Request, res: Response) => {
    try {
        const providers = await prisma.voipProvider.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                trunks: true,
            },
        });
        res.json(providers);
    } catch (error) {
        console.error('Error fetching VoIP providers:', error);
        res.status(500).json({ error: 'Failed to fetch VoIP providers' });
    }
};

// Get single VoIP provider
export const getProviderById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const provider = await prisma.voipProvider.findUnique({
            where: { id: parseInt(id) },
            include: {
                trunks: true,
            },
        });

        if (!provider) {
            return res.status(404).json({ error: 'VoIP provider not found' });
        }

        res.json(provider);
    } catch (error) {
        console.error('Error fetching VoIP provider:', error);
        res.status(500).json({ error: 'Failed to fetch VoIP provider' });
    }
};

// Create VoIP provider
export const createProvider = async (req: Request, res: Response) => {
    try {
        const {
            name,
            provider_type,
            account_sid,
            auth_token,
            api_key_sid,
            api_key_secret,
            twiml_app_sid,
            api_key,
            connection_id,
            webhook_secret,
            sip_server,
            sip_port,
            sip_username,
            sip_password,
            transport,
            from_number,
            active = true,
        } = req.body;

        // Validation
        if (!name || !provider_type || !from_number) {
            return res.status(400).json({ error: 'Name, provider type, and from number are required' });
        }

        const provider = await prisma.voipProvider.create({
            data: {
                name,
                provider_type,
                account_sid,
                auth_token,
                api_key_sid,
                api_key_secret,
                twiml_app_sid,
                api_key,
                connection_id,
                webhook_secret,
                sip_server,
                sip_port,
                sip_username,
                sip_password,
                transport,
                from_number,
                active,
            },
        });

        res.status(201).json(provider);
    } catch (error) {
        console.error('Error creating VoIP provider:', error);
        res.status(500).json({ error: 'Failed to create VoIP provider' });
    }
};

// Update VoIP provider
export const updateProvider = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            name,
            provider_type,
            account_sid,
            auth_token,
            api_key_sid,
            api_key_secret,
            twiml_app_sid,
            api_key,
            connection_id,
            webhook_secret,
            sip_server,
            sip_port,
            sip_username,
            sip_password,
            transport,
            from_number,
            active,
        } = req.body;

        const provider = await prisma.voipProvider.update({
            where: { id: parseInt(id) },
            data: {
                name,
                provider_type,
                account_sid,
                auth_token,
                api_key_sid,
                api_key_secret,
                twiml_app_sid,
                api_key,
                connection_id,
                webhook_secret,
                sip_server,
                sip_port,
                sip_username,
                sip_password,
                transport,
                from_number,
                active,
            },
        });

        res.json(provider);
    } catch (error) {
        console.error('Error updating VoIP provider:', error);
        res.status(500).json({ error: 'Failed to update VoIP provider' });
    }
};

// Delete VoIP provider
export const deleteProvider = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.voipProvider.delete({
            where: { id: parseInt(id) },
        });

        res.json({ message: 'VoIP provider deleted successfully' });
    } catch (error) {
        console.error('Error deleting VoIP provider:', error);
        res.status(500).json({ error: 'Failed to delete VoIP provider' });
    }
};
