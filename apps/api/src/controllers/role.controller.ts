import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

// Define all available permissions matching Krayin CRM
const PERMISSIONS_TREE = {
    dashboard: { label: 'Dashboard', permissions: ['view'] },
    leads: { label: 'Leads', permissions: ['create', 'view', 'edit', 'delete'] },
    deals: { label: 'Deals', permissions: ['create', 'view', 'edit', 'delete'] },
    quotes: { label: 'Quotes', permissions: ['create', 'edit', 'print', 'delete'] },
    mail: {
        label: 'Mail',
        permissions: ['inbox', 'draft', 'outbox', 'sent', 'trash', 'create', 'view', 'edit', 'delete']
    },
    activities: { label: 'Activities', permissions: ['create', 'edit', 'delete'] },
    contacts: {
        label: 'Contacts',
        children: {
            persons: { label: 'Persons', permissions: ['create', 'edit', 'delete', 'view'] },
            organizations: { label: 'Organizations', permissions: ['create', 'edit', 'delete'] }
        }
    },
    products: { label: 'Products', permissions: ['create', 'edit', 'delete', 'view'] },
    settings: {
        label: 'Settings',
        children: {
            user: {
                label: 'User',
                children: {
                    groups: { label: 'Groups', permissions: ['create', 'edit', 'delete'] },
                    roles: { label: 'Roles', permissions: ['create', 'edit', 'delete'] },
                    users: { label: 'Users', permissions: ['create', 'edit', 'delete'] }
                }
            },
            lead: {
                label: 'Lead',
                children: {
                    pipelines: { label: 'Pipelines', permissions: ['create', 'edit', 'delete'] },
                    sources: { label: 'Sources', permissions: ['create', 'edit', 'delete'] },
                    types: { label: 'Types', permissions: ['create', 'edit', 'delete'] }
                }
            },
            automation: {
                label: 'Automation',
                children: {
                    attributes: { label: 'Attributes', permissions: ['create', 'edit', 'delete'] },
                    webhook: { label: 'Webhook', permissions: ['create', 'edit', 'delete'] },
                    workflows: { label: 'Workflows', permissions: ['create', 'edit', 'delete'] },
                    events: { label: 'Event', permissions: ['create', 'edit', 'delete'] },
                    campaigns: { label: 'Campaigns', permissions: ['create', 'edit', 'delete'] },
                    emailTemplates: { label: 'Email Templates', permissions: ['create', 'edit', 'delete'] },
                    emailAccounts: { label: 'Email Accounts', permissions: ['create', 'edit', 'delete'] }
                }
            },
            otherSettings: {
                label: 'Other Settings',
                children: {
                    webForms: { label: 'Web Forms', permissions: ['view', 'create', 'edit', 'delete'] },
                    tags: { label: 'Tags', permissions: ['create', 'edit', 'delete'] },
                    dataTransfer: { label: 'Data Transfer', permissions: ['import', 'export'] }
                }
            }
        }
    },
    voip: {
        label: 'VoIP',
        children: {
            providers: { label: 'Providers', permissions: ['create', 'edit', 'delete'] },
            trunks: { label: 'Trunks', permissions: ['create', 'edit', 'delete'] },
            inboundRoutes: { label: 'Inbound Routes', permissions: ['create', 'edit', 'delete'] },
            callRecordings: { label: 'Call Recordings', permissions: ['play', 'download', 'delete'] },
            calls: { label: 'Calls', permissions: ['initiate', 'all_calls'] }
        }
    },
    configuration: { label: 'Configuration', permissions: ['view', 'edit'] }
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
        const data = roleSchema.parse(req.body);

        const role = await prisma.role.create({
            data: {
                name: data.name,
                description: data.description,
                permission_type: 'custom',
                permissions: data.permissions || {}
            }
        });

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
