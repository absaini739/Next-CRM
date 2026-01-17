import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { getLeadEmails as fetchLeadEmails } from '../services/email-linking.service';
import { NotificationService } from '../services/notification.service';

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
    product_interest: z.string().optional(),
});

const calculateLeadScore = (data: any): number => {
    let score = 0;

    // 1. Profile Completeness (+10 each, max 130)
    const profileFields = [
        'first_name', 'last_name', 'company_name', 'job_title',
        'primary_email', 'secondary_email', 'phone', 'mobile',
        'website', 'linkedin_url', 'location', 'no_employees', 'product_interest'
    ];
    profileFields.forEach(field => {
        if (data[field] && String(data[field]).trim().length > 0) {
            score += 10;
        }
    });

    // 2. Priority Bonus
    if (data.lead_rating === 'Hot' || data.lead_rating_stars >= 4) score += 50;
    else if (data.lead_rating === 'Warm' || data.lead_rating_stars >= 2) score += 30;
    else if (data.lead_rating === 'Cold' || data.lead_rating_stars === 1) score += 10;

    // 3. Deal Value Bonus (+1 per $1,000, max 100)
    const dealValue = parseFloat(data.lead_value) || 0;
    score += Math.min(Math.floor(dealValue / 1000), 100);

    return score;
};

// Helper function to auto-create Person from Lead data
const createOrUpdatePersonFromLead = async (leadData: any, userId: number) => {
    // Only create Person if we have contact info and no person_id provided
    if (!leadData.person_id && leadData.first_name && (leadData.primary_email || leadData.phone || leadData.mobile)) {
        const personName = `${leadData.first_name} ${leadData.last_name || ''}`.trim();

        // Build emails array
        const emails = [];
        if (leadData.primary_email) {
            emails.push({ value: leadData.primary_email, label: 'primary' });
        }
        if (leadData.secondary_email) {
            emails.push({ value: leadData.secondary_email, label: 'secondary' });
        }

        // Build contact numbers array
        const contactNumbers = [];
        if (leadData.phone) {
            contactNumbers.push({ value: leadData.phone, label: 'phone' });
        }
        if (leadData.mobile) {
            contactNumbers.push({ value: leadData.mobile, label: 'mobile' });
        }

        // Create the Person
        const person = await prisma.person.create({
            data: {
                name: personName,
                emails: emails,
                contact_numbers: contactNumbers.length > 0 ? contactNumbers : undefined,
                organization_id: leadData.organization_id,
                user_id: userId,
            },
        });

        return person.id;
    }

    return leadData.person_id;
};

export const createLead = async (req: Request, res: Response) => {
    try {
        const data = leadSchema.parse(req.body);
        // @ts-ignore
        const authUserId = req.userId;

        // Auto-create Person if contact info provided
        const personId = await createOrUpdatePersonFromLead(data, authUserId);

        const leadScore = calculateLeadScore(data);

        const lead = await prisma.lead.create({
            data: {
                ...data,
                person_id: personId,
                user_id: data.user_id ?? authUserId, // Use provided owner or auth user
                // @ts-ignore - Prisma Client update locked by running server
                assigned_to_id: data.assigned_to_id,
                stage_id: data.stage_id ?? 1, // Default New
                lead_score: leadScore,
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
                user: true, // Include owner
                activities: {
                    where: { type: 'call' },
                    orderBy: { created_at: 'desc' }
                }
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
                user: true,
                activities: {
                    orderBy: { created_at: 'desc' }
                }
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
        const data = leadSchema.partial().parse(req.body);

        const currentLead = await prisma.lead.findUnique({ where: { id } });
        if (!currentLead) return res.status(404).json({ message: 'Lead not found' });

        // If moving to Won stage (ID 5), also update status to 1
        const updateData: any = { ...data };
        if (data.stage_id === 5) {
            updateData.status = 1;
        }

        // Recalculate score if relevant data changed
        const combinedData = { ...currentLead, ...data };
        updateData.lead_score = calculateLeadScore(combinedData);

        const lead = await prisma.lead.update({
            where: { id },
            data: updateData
        });

        // Trigger notification if assigned_to_id changed
        if (data.assigned_to_id && data.assigned_to_id !== currentLead.assigned_to_id) {
            // 1. Notify New Assignee
            await NotificationService.notify(
                data.assigned_to_id,
                `You have been assigned a new lead: ${lead.first_name || lead.title}`,
                'lead',
                lead.id
            );

            // 2. Notify Creator/Owner if they are not the one assigning and not the new assignee
            // (Assuming user_id is the creator/owner)
            // @ts-ignore
            const authUserId = req.userId;
            if (lead.user_id && lead.user_id !== authUserId && lead.user_id !== data.assigned_to_id) {
                await NotificationService.notify(
                    lead.user_id,
                    `Lead "${lead.first_name || lead.title}" was re-assigned to a new user`,
                    'lead',
                    lead.id
                );
            }
        }

        // Conversion logic: if stage_id is changed to 5 (Won)
        if (data.stage_id === 5 && currentLead.stage_id !== 5) {
            try {
                console.log(`Lead ${lead.id} moved to Won stage. Starting conversion...`);
                await handleLeadConversion(lead);
                console.log(`Lead ${lead.id} converted to deal successfully`);
            } catch (conversionError) {
                console.error('Lead conversion failed:', conversionError);
                // We'll continue even if conversion failed, but now we know why
            }
        }

        res.json(lead);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        console.error('Error updating lead:', error);
        res.status(500).json({
            message: 'Error updating lead',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
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

        // 3. Find Default Deal Pipeline and its "Closed Won" stage
        const dealPipeline = await tx.dealPipeline.findFirst({
            where: { is_default: true },
            include: { stages: true }
        });

        if (!dealPipeline) {
            throw new Error('Default deal pipeline not found');
        }

        const wonStage = dealPipeline.stages.find(s => s.name.toLowerCase().includes('won'));
        if (!wonStage) {
            throw new Error('Deal stage "Won" not found in default pipeline');
        }

        // 4. Create Deal
        await tx.deal.create({
            data: {
                title: leadData.title,
                description: leadData.description,
                deal_value: leadData.lead_value,
                status: 'won', // Auto-won based on Lead status
                person_id: personId,
                organization_id: organizationId,
                user_id: leadData.user_id,
                lead_id: leadData.id,
                pipeline_id: dealPipeline.id,
                stage_id: wonStage.id
            }
        });

        // 5. Update lead with links to Person/Org
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

export const bulkUpdateLeads = async (req: Request, res: Response) => {
    try {
        const { ids, data } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No lead IDs provided' });
        }

        const validatedData = leadSchema.partial().parse(data);

        // Update each lead one by one to ensure score calculation and conversion logic triggers
        // or we can use updateMany if we don't care about the custom logic per lead.
        // Given our complex updateLead logic (score, conversion), a loop or a smarter transaction is better.

        const results = await Promise.all(ids.map(async (id) => {
            const currentLead = await prisma.lead.findUnique({ where: { id } });
            if (!currentLead) return null;

            const updateData: any = { ...validatedData };
            if (validatedData.stage_id === 5) {
                updateData.status = 1;
            }

            const combinedData = { ...currentLead, ...validatedData };
            updateData.lead_score = calculateLeadScore(combinedData);

            const updated = await prisma.lead.update({
                where: { id },
                data: updateData
            });

            // Trigger notification if assigned_to_id changed in bulk
            if (validatedData.assigned_to_id && validatedData.assigned_to_id !== currentLead.assigned_to_id) {
                await NotificationService.notify(
                    validatedData.assigned_to_id,
                    `You have been assigned a new lead: ${updated.first_name || updated.title}`,
                    undefined,
                    updated.id
                );
            }

            // Conversion logic if needed
            if (validatedData.stage_id === 5 && currentLead.stage_id !== 5) {
                try {
                    await handleLeadConversion(updated);
                } catch (e) {
                    console.error('Bulk conversion error:', e);
                }
            }

            return updated;
        }));

        res.json({ message: 'Leads updated successfully', count: results.filter(Boolean).length });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        console.error('Bulk update error:', error);
        res.status(500).json({ message: 'Error updating leads bulk' });
    }
};

export const bulkDeleteLeads = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No lead IDs provided' });
        }

        await prisma.lead.deleteMany({
            where: { id: { in: ids } }
        });

        res.json({ message: 'Leads deleted successfully' });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({ message: 'Error deleting leads bulk' });
    }
};

export const getLeadEmails = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const lead = await prisma.lead.findUnique({ where: { id } });
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        const emails = await fetchLeadEmails(id);
        res.json(emails);
    } catch (error) {
        console.error('Error fetching lead emails:', error);
        res.status(500).json({ message: 'Error fetching emails' });
    }
};
