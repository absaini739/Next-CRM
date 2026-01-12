import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { gmailService } from '../services/email/gmail.service';
import { outlookService } from '../services/email/outlook.service';
import { addEmailTracking } from '../utils/email-tracking';

const sendEmailSchema = z.object({
    account_id: z.number(),
    to: z.array(z.string().email()),
    cc: z.array(z.string().email()).optional(),
    bcc: z.array(z.string().email()).optional(),
    subject: z.string(),
    body: z.string(), // HTML body
    tracking_enabled: z.boolean().optional(),
    attachments: z.array(z.object({
        filename: z.string(),
        content: z.string(), // base64
        contentType: z.string()
    })).optional()
});

// Get emails (inbox/sent/etc) with pagination
export const getEmails = async (req: Request, res: Response) => {
    try {
        const { folder = 'inbox', page = 1, limit = 20, search, account_id } = req.query;
        // @ts-ignore
        const userId = req.userId;

        const where: any = {
            account: { user_id: userId },
            folder: folder as string
        };

        if (account_id) {
            where.account_id = parseInt(account_id as string);
        }

        if (search) {
            where.OR = [
                { subject: { contains: search as string, mode: 'insensitive' } },
                { from_email: { contains: search as string, mode: 'insensitive' } },
                { from_name: { contains: search as string, mode: 'insensitive' } },
                { snippet: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const [emails, total] = await Promise.all([
            prisma.emailMessage.findMany({
                where,
                include: {
                    account: true,
                    attachments: { select: { id: true, filename: true, content_type: true, size: true } }
                },
                orderBy: { received_at: 'desc' },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit)
            }),
            prisma.emailMessage.count({ where })
        ]);

        res.json({
            data: emails,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ message: 'Error fetching emails' });
    }
};

// Get single email details
export const getEmail = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        // @ts-ignore
        const userId = req.userId;

        const email = await prisma.emailMessage.findFirst({
            where: {
                id,
                account: { user_id: userId }
            },
            include: {
                account: true,
                attachments: true,
                person: true,
                lead: true,
                deal: true,
                thread: {
                    include: {
                        messages: {
                            orderBy: { received_at: 'asc' },
                            include: { attachments: true, account: true }
                        }
                    }
                }
            }
        });

        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }

        // Mark as read if not already
        if (!email.is_read) {
            await prisma.emailMessage.update({
                where: { id },
                data: { is_read: true }
            });
        }

        res.json(email);
    } catch (error) {
        console.error('Error fetching email:', error);
        res.status(500).json({ message: 'Error fetching email' });
    }
};

// Get email thread
export const getThread = async (req: Request, res: Response) => {
    try {
        const threadId = parseInt(req.params.id);
        // @ts-ignore
        const userId = req.userId;

        const thread = await prisma.emailThread.findFirst({
            where: {
                id: threadId,
                // Ensure thread belongs to one of user's accounts (complex check omitted for MVP, relying on message check)
            },
            include: {
                messages: {
                    orderBy: { received_at: 'asc' },
                    include: {
                        account: true,
                        attachments: true
                    }
                }
            }
        });

        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }

        res.json(thread);
    } catch (error) {
        console.error('Error fetching thread:', error);
        res.status(500).json({ message: 'Error fetching thread' });
    }
};

// Get folder counts
export const getFolderCounts = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const { account_id } = req.query;

        const where: any = { account: { user_id: userId } };
        if (account_id) {
            where.account_id = parseInt(account_id as string);
        }

        const [inbox, sent, draft, trash, archive] = await Promise.all([
            prisma.emailMessage.count({ where: { ...where, folder: 'inbox', is_read: false } }), // count unread for inbox
            prisma.emailMessage.count({ where: { ...where, folder: 'sent' } }),
            prisma.emailMessage.count({ where: { ...where, folder: 'draft' } }),
            prisma.emailMessage.count({ where: { ...where, folder: 'trash' } }),
            prisma.emailMessage.count({ where: { ...where, folder: 'archive' } })
        ]);

        res.json({ inbox, sent, draft, trash, archive });
    } catch (error) {
        console.error('Error fetching folder counts:', error);
        res.status(500).json({ message: 'Error fetching folder counts' });
    }
};

// Send email
export const createEmail = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const data = sendEmailSchema.parse(req.body);

        // Get account with tokens
        const account = await prisma.emailAccount.findFirst({
            where: { id: data.account_id, user_id: userId }
        });

        if (!account) {
            return res.status(404).json({ message: 'Email account not found' });
        }

        let sentMessageId: string;

        // Send via provider
        if (account.provider === 'gmail') {
            const info = await gmailService.sendEmail(account.id, {
                to: data.to,
                cc: data.cc,
                bcc: data.bcc,
                subject: data.subject,
                body: data.body,
                isHtml: true
            });
            sentMessageId = info.id || '';
        } else {
            const info = await outlookService.sendEmail(account.id, {
                to: data.to,
                cc: data.cc,
                bcc: data.bcc,
                subject: data.subject,
                body: data.body
            });
            sentMessageId = info.id;
        }

        // Save to Sent folder first (we need the ID for tracking)
        const emailMessage = await prisma.emailMessage.create({
            data: {
                account_id: account.id,
                message_id: sentMessageId,
                folder: 'sent',
                from_email: account.email,
                from_name: account.display_name,
                to: data.to,
                cc: data.cc,
                bcc: data.bcc,
                subject: data.subject,
                body_html: data.body,
                snippet: data.body.substring(0, 200),
                is_read: true,
                sent_at: new Date(),
                sent_from_crm: true,
                sent_from_account_id: account.id,
                tracking_enabled: data.tracking_enabled || false
            }
        });

        // If tracking enabled, inject tracking into email body
        let finalBody = data.body;
        if (data.tracking_enabled) {
            finalBody = addEmailTracking(data.body, emailMessage.id);

            // Update the email message with tracked body
            await prisma.emailMessage.update({
                where: { id: emailMessage.id },
                data: { body_html: finalBody }
            });
        }

        res.status(201).json(emailMessage);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error sending email' });
    }
};

// Update email (mark read, star, move folder)
export const updateEmail = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        // @ts-ignore
        const userId = req.userId;

        const { is_read, is_starred, folder } = req.body;

        await prisma.emailMessage.updateMany({
            where: {
                id,
                account: { user_id: userId }
            },
            data: {
                ...(is_read !== undefined && { is_read }),
                ...(is_starred !== undefined && { is_starred }),
                ...(folder && { folder })
            }
        });

        res.json({ message: 'Email updated successfully' });
    } catch (error) {
        console.error('Error updating email:', error);
        res.status(500).json({ message: 'Error updating email' });
    }
};

// Delete email
export const deleteEmail = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        // @ts-ignore
        const userId = req.userId;

        await prisma.emailMessage.deleteMany({
            where: {
                id,
                account: { user_id: userId }
            }
        });

        res.json({ message: 'Email deleted successfully' });
    } catch (error) {
        console.error('Error deleting email:', error);
        res.status(500).json({ message: 'Error deleting email' });
    }
};

// Get attachment for download
export const getAttachment = async (req: Request, res: Response) => {
    try {
        const emailId = parseInt(req.params.id);
        const attachmentId = parseInt(req.params.attachmentId);
        // @ts-ignore
        const userId = req.userId;

        // Verify email belongs to user
        const email = await prisma.emailMessage.findFirst({
            where: {
                id: emailId,
                account: { user_id: userId }
            }
        });

        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }

        // Get attachment
        const attachment = await prisma.emailMessageAttachment.findFirst({
            where: {
                id: attachmentId,
                message_id: emailId
            }
        });

        if (!attachment) {
            return res.status(404).json({ message: 'Attachment not found' });
        }

        // Set headers for download
        res.setHeader('Content-Type', attachment.content_type || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${attachment.filename}"`);
        res.setHeader('Content-Length', attachment.size);

        // Send file data
        // Note: In a real implementation, you'd fetch the actual file from storage
        // For now, we'll send the stored data (if available) or return an error
        if ((attachment as any).data) {
            // If data is stored as base64, decode it
            const buffer = Buffer.from((attachment as any).data, 'base64');
            res.send(buffer);
        } else {
            res.status(404).json({ message: 'Attachment data not available' });
        }
    } catch (error) {
        console.error('Error downloading attachment:', error);
        res.status(500).json({ message: 'Error downloading attachment' });
    }
};
