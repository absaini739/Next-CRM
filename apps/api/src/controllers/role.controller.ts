import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

// Define all available permissions matching application structure
const PERMISSIONS_TREE = {
    dashboard: { label: 'Dashboard', permissions: ['view'] },
    persons: { label: 'Persons', permissions: ['create', 'view', 'edit', 'delete'] },
    organizations: { label: 'Organizations', permissions: ['create', 'view', 'edit', 'delete'] },
    leads: { label: 'Leads', permissions: ['create', 'view', 'edit', 'delete'] },
    deals: { label: 'Deals', permissions: ['create', 'view', 'edit', 'delete'] },
    products: { label: 'Products', permissions: ['create', 'view', 'edit', 'delete'] },
    quotes: { label: 'Quotes', permissions: ['create', 'edit', 'print', 'delete'] },
    tasks: { label: 'Tasks', permissions: ['create', 'view', 'edit', 'delete'] },
    calendar: { label: 'Calendar', permissions: ['view', 'create', 'edit', 'delete'] },
    activities: { label: 'Activities', permissions: ['create', 'view', 'edit', 'delete'] },
    voip: {
        label: 'VoIP',
        children: {
            providers: { label: 'Providers', permissions: ['create', 'edit', 'delete', 'view'] },
            trunks: { label: 'Trunks', permissions: ['create', 'edit', 'delete', 'view'] },
            inboundRoutes: { label: 'Inbound Routes', permissions: ['create', 'edit', 'delete', 'view'] },
            callRecordings: { label: 'Call Recordings', permissions: ['play', 'download', 'delete'] },
            calls: { label: 'Calls', permissions: ['initiate', 'all_calls'] }
        }
    },
    email: {
        label: 'Email',
        permissions: ['inbox', 'draft', 'outbox', 'sent', 'trash', 'create', 'view', 'edit', 'delete']
    },
    settings: {
        label: 'Settings',
        children: {
            users: { label: 'User Management', permissions: ['create', 'view', 'edit', 'delete'] },
            roles: { label: 'Roles & Permissions', permissions: ['create', 'view', 'edit', 'delete'] },
            pipelines: { label: 'Pipeline Configuration', permissions: ['create', 'view', 'edit', 'delete'] },
            sources: { label: 'Lead Sources', permissions: ['create', 'view', 'edit', 'delete'] },
            types: { label: 'Lead Types', permissions: ['create', 'view', 'edit', 'delete'] },
            emailIntegration: { label: 'Email Integration', permissions: ['create', 'view', 'edit', 'delete'] },
            dataTransfer: { label: 'Data Transfer', permissions: ['import', 'export'] },
            notifications: { label: 'Notifications', permissions: ['view', 'edit'] },
            customFields: { label: 'Custom Fields', permissions: ['create', 'view', 'edit', 'delete'] },
            security: { label: 'Security Settings', permissions: ['view', 'edit'] },
            company: { label: 'Company Profile', permissions: ['view', 'edit'] },
            emailTemplates: { label: 'Email Templates', permissions: ['create', 'view', 'edit', 'delete'] },
            businessHours: { label: 'Business Hours', permissions: ['view', 'edit'] },
            webForms: { label: 'Web Forms', permissions: ['view', 'create', 'edit', 'delete'] },
            tags: { label: 'Tags', permissions: ['create', 'view', 'edit', 'delete'] },
            attributes: { label: 'Attributes', permissions: ['create', 'view', 'edit', 'delete'] },
            webhooks: { label: 'Webhooks', permissions: ['create', 'view', 'edit', 'delete'] },
            workflows: { label: 'Workflows', permissions: ['create', 'view', 'edit', 'delete'] },
            campaigns: { label: 'Campaigns', permissions: ['create', 'view', 'edit', 'delete'] }
        }
    }
};

const roleSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    permissions: z.record(z.array(z.string())).optional(), // { "leads": ["create", "view"], "deals": ["create"] }
});

// Get permissions tree
export const getPermissionsTree = async (req: Request, res: Response) => {
    res.json(PERMISSIONS_TREE);
};

// Get all roles
export const getRoles = async (req: Request, res: Response) => {
    try {
        const roles = await prisma.role.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(roles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching roles' });
    }
};

// Get single role
export const getRole = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const role = await prisma.role.findUnique({
            where: { id }
        });

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        res.json(role);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching role' });
    }
};

// Create role
export const createRole = async (req: Request, res: Response) => {
    try {
        console.log('[Create Role] Request body:', JSON.stringify(req.body, null, 2));
        const data = roleSchema.parse(req.body);
        console.log('[Create Role] Parsed data:', JSON.stringify(data, null, 2));
        console.log('[Create Role] Permissions:', JSON.stringify(data.permissions, null, 2));

        const role = await prisma.role.create({
            data: {
                name: data.name,
                description: data.description,
                permission_type: 'custom',
                permissions: data.permissions || {}
            }
        });

        console.log('[Create Role] Created role:', JSON.stringify(role, null, 2));
        res.status(201).json(role);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        console.error(error);
        res.status(500).json({ message: 'Error creating role' });
    }
};

// Update role
export const updateRole = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const data = roleSchema.parse(req.body);

        const role = await prisma.role.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                permissions: data.permissions || {}
            }
        });

        res.json(role);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        console.error(error);
        res.status(500).json({ message: 'Error updating role' });
    }
};

// Delete role
export const deleteRole = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        // Check if role is system role
        const role = await prisma.role.findUnique({ where: { id } });
        if (role?.name === 'administrator') {
            return res.status(400).json({ message: 'Cannot delete administrator role' });
        }

        await prisma.role.delete({ where: { id } });
        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting role' });
    }
};
