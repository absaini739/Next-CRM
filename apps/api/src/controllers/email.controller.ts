import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const emailSchema = z.object({
    from: z.string().email(),
    to: z.array(z.string().email()),
    cc: z.array(z.string().email()).optional(),
    bcc: z.array(z.string().email()).optional(),
    subject: z.string(),
    body: z.string(),
    folder: z.enum(['inbox', 'draft', 'outbox', 'sent', 'archive', 'trash']).optional(),
    person_id: z.number().optional(),
    lead_id: z.number().optional(),
    deal_id: z.number().optional(),
});

// Get all emails with folder filter
export const getEmails = async (req: Request, res: Response) => {
    try {
        const { folder = 'inbox', page = 1, limit = 10, search } = req.query;
        // @ts-ignore
        const userId = req.userId;

        const where: any = {
            user_id: userId,
            folder: folder as string
        };

        if (search) {
            where.OR = [
                { subject: { contains: search as string, mode: 'insensitive' } },
                { from: { contains: search as string, mode: 'insensitive' } },
                { body: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const [emails, total] = await Promise.all([
            prisma.email.findMany({
                where,
                include: {
                    person: true,
                    lead: true,
                    deal: true,
                    attachments: true
                },
                orderBy: { created_at: 'desc' },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit)
            }),
            prisma.email.count({ where })
        ]);

        res.json({
            emails,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching emails' });
    }
};

// Get folder counts
export const getFolderCounts = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;

        const counts = await Promise.all([
            prisma.email.count({ where: { user_id: userId, folder: 'inbox' } }),
            prisma.email.count({ where: { user_id: userId, folder: 'draft' } }),
            prisma.email.count({ where: { user_id: userId, folder: 'outbox' } }),
            prisma.email.count({ where: { user_id: userId, folder: 'sent' } }),
            prisma.email.count({ where: { user_id: userId, folder: 'archive' } }),
            prisma.email.count({ where: { user_id: userId, folder: 'trash' } }),
        ]);

        res.json({
            inbox: counts[0],
            draft: counts[1],
            outbox: counts[2],
            sent: counts[3],
            archive: counts[4],
            trash: counts[5]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching folder counts' });
    }
};

// Get single email
export const getEmail = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        // @ts-ignore
        const userId = req.userId;

        const email = await prisma.email.findFirst({
            where: { id, user_id: userId },
            include: {
                person: true,
                lead: true,
                deal: true,
                attachments: true
            }
        });

        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }

        // Mark as read
        if (!email.is_read) {
            await prisma.email.update({
                where: { id },
                data: { is_read: true }
            });
        }

        res.json(email);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching email' });
    }
};

// Create/send email
export const createEmail = async (req: Request, res: Response) => {
    try {
        const data = emailSchema.parse(req.body);
        // @ts-ignore
        const userId = req.userId;

        const email = await prisma.email.create({
            data: {
                from: data.from,
                to: data.to,
                cc: data.cc || [],
                bcc: data.bcc || [],
                subject: data.subject,
                body: data.body,
                folder: data.folder || 'sent',
                user_id: userId,
                person_id: data.person_id,
                lead_id: data.lead_id,
                deal_id: data.deal_id,
                sent_at: data.folder === 'sent' ? new Date() : null
            }
        });

        res.status(201).json(email);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        console.error(error);
        res.status(500).json({ message: 'Error creating email' });
    }
};

// Update email (mark read, star, move folder)
export const updateEmail = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        // @ts-ignore
        const userId = req.userId;

        const { is_read, is_starred, folder } = req.body;

        const email = await prisma.email.updateMany({
            where: { id, user_id: userId },
            data: {
                ...(is_read !== undefined && { is_read }),
                ...(is_starred !== undefined && { is_starred }),
                ...(folder && { folder })
            }
        });

        res.json({ message: 'Email updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating email' });
    }
};

// Delete email
export const deleteEmail = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        // @ts-ignore
        const userId = req.userId;

        await prisma.email.deleteMany({
            where: { id, user_id: userId }
        });

        res.json({ message: 'Email deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting email' });
    }
};
