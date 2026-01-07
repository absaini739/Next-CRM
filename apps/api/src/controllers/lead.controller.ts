import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const leadSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    company_name: z.string().optional(),
    job_title: z.string().optional(),
    website: z.string().optional(),
    linkedin_url: z.string().optional(),
    location: z.string().optional(),
    primary_email: z.string().optional(),
    secondary_email: z.string().optional(),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    lead_rating: z.string().optional(),
    no_employees: z.string().optional(),
    lead_value: z.number().optional(), // Decimal in DB, number in JSON
    status: z.number().int().optional().nullable(),
    person_id: z.number().int().optional().nullable(),
    organization_id: z.number().int().optional().nullable(),
    lead_source_id: z.number().int().optional().nullable(),
    lead_type_id: z.number().int().optional().nullable(),
    user_id: z.number().int().optional().nullable(),
    assigned_to_id: z.number().int().optional().nullable(),
    pipeline_id: z.number().int().optional().nullable(),
    stage_id: z.number().int().optional().nullable(),
});

export const createLead = async (req: Request, res: Response) => {
    try {
        const data = leadSchema.parse(req.body);
        // @ts-ignore
        const authUserId = req.userId;

        const lead = await prisma.lead.create({
            data: {
                ...data,
                user_id: data.user_id ?? authUserId, // Use provided owner or auth user
                // @ts-ignore - Prisma Client update locked by running server
                assigned_to_id: data.assigned_to_id,
                stage_id: data.stage_id ?? 1, // Default New
            },
        });

        // Auto-convert if created as Won
        if (lead.stage_id === 5) {
            await handleLeadConversion(lead);
        }

        res.status(201).json(lead);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        console.error(error);
        res.status(500).json({ message: 'Error creating lead' });
    }
};

export const getLeads = async (req: Request, res: Response) => {
    try {
        const leads = await prisma.lead.findMany({
            include: {
                person: true,
                organization: true,
                source: true,
                type: true,
                pipeline: true,
                stage: true,
                assigned_to: true, // Include assigned user
                user: true // Include owner
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
                organization: true,
                source: true,
                type: true,
                pipeline: true,
                stage: true,
                deals: true,
                assigned_to: true,
                user: true
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

        const currentLead = await prisma.lead.findUnique({ where: { id } });
        if (!currentLead) return res.status(404).json({ message: 'Lead not found' });

        const lead = await prisma.lead.update({
            where: { id },
            data: {
                ...data,
                // @ts-ignore
                assigned_to_id: data.assigned_to_id
            }
        });

        // Conversion logic: if stage_id is changed to 5 (Won)
        if (data.stage_id === 5 && currentLead.stage_id !== 5) {
            await handleLeadConversion(lead);
        }

        res.json(lead);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        console.error(error);
        res.status(500).json({ message: 'Error updating lead' });
    }
};

// Helper to handle Lead -> Deal conversion
const handleLeadConversion = async (lead: any) => {
    await prisma.$transaction(async (tx) => {
        const leadData = lead;

        // 1. Create Organization if company_name exists and not linked
        let organizationId = leadData.organization_id;
        if (!organizationId && leadData.company_name) {
            const org = await tx.organization.create({
                data: {
                    name: leadData.company_name,
                    website: leadData.website,
                    user_id: leadData.user_id
                }
            });
            organizationId = org.id;
        }

        // 2. Create Person if first_name exists and not linked
        let personId = leadData.person_id;
        if (!personId && leadData.first_name) {
            const person = await tx.person.create({
                data: {
                    name: `${leadData.first_name} ${leadData.last_name || ''}`.trim(),
                    emails: leadData.primary_email ? [{ value: leadData.primary_email, label: 'Work' }] : [],
                    contact_numbers: leadData.phone ? [{ value: leadData.phone, label: 'Work' }] : [],
                    organization_id: organizationId,
                    user_id: leadData.user_id
                }
            });
            personId = person.id;
        }

        // 3. Create Deal
        await tx.deal.create({
            data: {
                title: leadData.title,
                description: leadData.description,
                deal_value: leadData.lead_value,
                status: 'open', // Deal status is open initially
                person_id: personId,
                organization_id: organizationId,
                user_id: leadData.user_id,
                lead_id: leadData.id,
                pipeline_id: 1, // Default Pipeline
                stage_id: 1     // Default Stage
            }
        });

        // 4. Update lead with links to Person/Org
        if (personId !== leadData.person_id || organizationId !== leadData.organization_id) {
            await tx.lead.update({
                where: { id: leadData.id },
                data: {
                    person_id: personId,
                    organization_id: organizationId
                }
            });
        }
    });
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
