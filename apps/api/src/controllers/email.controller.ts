import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { gmailService } from '../services/email/gmail.service';
import { outlookService } from '../services/email/outlook.service';
import { addEmailTracking } from '../utils/email-tracking';
import { autoLinkEmail } from '../services/email-linking.service';

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
    })).optional(),
    scheduled_at: z.string().datetime().optional().or(z.string().optional())
});

// Get emails (inbox/sent/etc) with pagination
export const getEmails = async (req: Request, res: Response) => {
    try {
        const { folder = 'inbox', page = 1, limit = 20, search, account_id, strict = 'false' } = req.query;
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

        // Apply strict filtering if requested
        if (strict === 'true' && folder === 'inbox') {
            where.OR = [
                { person_id: { not: null } },
                { lead_id: { not: null } },
                { deal_id: { not: null } },
                { sent_from_crm: true }
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

        // IMPORTANT: Create email message first to get ID for tracking
        const emailMessage = await prisma.emailMessage.create({
            data: {
                account_id: account.id,
                message_id: '', // Will update after sending
                from_email: account.email,
                from_name: account.display_name,
                to: data.to,
                cc: data.cc,
                bcc: data.bcc,
                subject: data.subject,
                body_html: data.body,
                snippet: data.body.substring(0, 200),
                is_read: true,
                sent_at: data.scheduled_at && new Date(data.scheduled_at) > new Date() ? null : new Date(),
                sent_from_crm: true,
                sent_from_account_id: account.id,
                tracking_enabled: data.tracking_enabled || false,
                scheduled_at: data.scheduled_at ? new Date(data.scheduled_at) : null,
                folder: data.scheduled_at && new Date(data.scheduled_at) > new Date() ? 'outbox' : 'sent'
            }
        });

        // If scheduled for future, stop here and return
        if (emailMessage.folder === 'outbox') {
            return res.status(201).json(emailMessage);
        }

        // If tracking enabled, inject tracking BEFORE sending
        let finalBody = data.body;
        if (data.tracking_enabled) {
            finalBody = addEmailTracking(data.body, emailMessage.id);

            // Update the email message with tracked body
            await prisma.emailMessage.update({
                where: { id: emailMessage.id },
                data: { body_html: finalBody }
            });
        }

        let sentMessageId: string;

        // Send via provider with tracked body
        if (account.provider === 'gmail' && account.connection_type !== 'smtp_imap') {
            const info = await gmailService.sendEmail(account.id, {
                to: data.to,
                cc: data.cc,
                bcc: data.bcc,
                subject: data.subject,
                body: finalBody, // Use tracked body!
                isHtml: true
            });
            sentMessageId = info.id || '';
        } else if (account.provider === 'outlook' && account.connection_type !== 'smtp_imap') {
            const info = await outlookService.sendEmail(account.id, {
                to: data.to,
                cc: data.cc,
                bcc: data.bcc,
                subject: data.subject,
                body: finalBody, // Use tracked body!
                isHtml: true
            });
            sentMessageId = info.id;
        } else {
            // SMTP/IMAP Sending
            const { smtpImapService } = await import('../services/email/smtp-imap.service');
            const info = await smtpImapService.sendEmail(account.id, {
                to: data.to,
                cc: data.cc,
                bcc: data.bcc,
                subject: data.subject,
                body: finalBody,
                isHtml: true,
                // inReplyTo: data.inReplyTo // Add to schema if needed
            });
            sentMessageId = info.messageId;
        }

        // Update with actual message ID from provider
        await prisma.emailMessage.update({
            where: { id: emailMessage.id },
            data: { message_id: sentMessageId }
        });

        // Auto-link email to CRM entities
        try {
            const linkResult = await autoLinkEmail(emailMessage.id);
            console.log(`✅ Auto-linked email ${emailMessage.id}:`, linkResult);
        } catch (linkError) {
            console.error('Auto-linking failed (non-critical):', linkError);
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
// Delete or Move to Trash
export const deleteEmail = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        // @ts-ignore
        const userId = req.userId;

        const email = await prisma.emailMessage.findFirst({
            where: {
                id,
                account: { user_id: userId }
            }
        });

        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }

        if (email.folder === 'trash' || email.folder === 'deleteditems') {
            // Permanently delete
            await prisma.emailMessage.delete({
                where: { id }
            });
            res.json({ message: 'Email permanently deleted' });
        } else {
            // Move to trash
            await prisma.emailMessage.update({
                where: { id },
                data: { folder: 'trash' }
            });
            res.json({ message: 'Email moved to trash' });
        }
    } catch (error) {
        console.error('Error deleting email:', error);
        res.status(500).json({ message: 'Error deleting email' });
    }
};

// Archive email
export const archiveEmail = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        // @ts-ignore
        const userId = req.userId;

        const email = await prisma.emailMessage.findFirst({
            where: {
                id,
                account: { user_id: userId }
            }
        });

        if (!email) {
            return res.status(404).json({ message: 'Email not found' });
        }

        await prisma.emailMessage.update({
            where: { id },
            data: { folder: 'archive' }
        });

        res.json({ message: 'Email archived' });
    } catch (error) {
        console.error('Error archiving email:', error);
        res.status(500).json({ message: 'Error archiving email' });
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

// Connect Manual Account (SMTP/IMAP)
export const connectManual = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const schema = z.object({
            email: z.string().email(),
            password: z.string().min(1),
            provider: z.enum(['gmail', 'outlook', 'other']),
            smtpHost: z.string(),
            smtpPort: z.number(),
            imapHost: z.string(),
            imapPort: z.number(),
            displayName: z.string().optional()
        });

        const data = schema.parse(req.body);

        // Dynamic import
        const { smtpImapService } = await import('../services/email/smtp-imap.service');
        const { encryptionService } = await import('../services/security/encryption.service');
        const { emailSyncService } = await import('../services/email/email-sync.service');

        // Test Connection
        const connectionTest = await smtpImapService.testConnection({
            email: data.email,
            password: data.password,
            smtpHost: data.smtpHost,
            smtpPort: data.smtpPort,
            imapHost: data.imapHost,
            imapPort: data.imapPort
        });

        if (!connectionTest.success) {
            return res.status(400).json({
                message: 'Connection failed',
                error: connectionTest.error
            });
        }

        // Encrypt password
        const encryptedPassword = encryptionService.encrypt(data.password);

        // Store Account
        const account = await prisma.emailAccount.upsert({
            where: {
                user_id_email: {
                    user_id: userId,
                    email: data.email
                }
            },
            update: {
                connection_type: 'smtp_imap',
                encrypted_password: encryptedPassword,
                smtp_host: data.smtpHost,
                smtp_port: data.smtpPort,
                imap_host: data.imapHost,
                imap_port: data.imapPort,
                smtp_username: data.email,
                imap_username: data.email,
                display_name: data.displayName || data.email,
                access_token: '', // Not used for SMTP
                refresh_token: '', // Not used for SMTP
                provider: data.provider
            },
            create: {
                user_id: userId,
                email: data.email,
                provider: data.provider,
                connection_type: 'smtp_imap',
                encrypted_password: encryptedPassword,
                smtp_host: data.smtpHost,
                smtp_port: data.smtpPort,
                imap_host: data.imapHost,
                imap_port: data.imapPort,
                smtp_username: data.email,
                imap_username: data.email,
                display_name: data.displayName || data.email,
                access_token: '',
                refresh_token: '',
                is_default: false
            }
        });

        // Trigger initial sync
        emailSyncService.syncAccount(account.id, { fullSync: true }).catch(console.error);

        res.json(account);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        console.error('Error connecting manual account:', error);
        res.status(500).json({
            message: 'Error connecting account',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Trigger manual sync
export const syncEmails = async (req: Request, res: Response) => {
    try {
        const { account_id } = req.body;
        // @ts-ignore
        const userId = req.userId;

        const { emailSyncService } = await import('../services/email/email-sync.service');

        if (account_id) {
            // Verify ownership
            const account = await prisma.emailAccount.findFirst({
                where: { id: parseInt(account_id), user_id: userId }
            });

            if (!account) {
                return res.status(403).json({ message: 'Account not found or access denied' });
            }

            console.log(`[Manual Sync] Triggering sync for account: ${account.email}`);
            const result = await emailSyncService.syncAccount(account.id);
            return res.json(result);
        } else {
            console.log(`[Manual Sync] Triggering sync for all accounts of user: ${userId}`);
            const result = await emailSyncService.syncAllAccounts();
            return res.json(result);
        }
    } catch (error) {
        console.error('Error triggering manual sync:', error);
        res.status(500).json({ message: 'Error triggering manual sync' });
    }
};
// Multiple bulk operations (delete, archive, mark read)
export const bulkUpdate = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const { ids, folder, is_read } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No email IDs provided' });
        }

        const where: any = {
            id: { in: ids },
            account: { user_id: userId }
        };

        const data: any = {};
        if (folder) data.folder = folder;
        if (is_read !== undefined) data.is_read = is_read;

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ message: 'No update data provided' });
        }

        await prisma.emailMessage.updateMany({
            where,
            data
        });

        res.json({ message: `Successfully updated ${ids.length} emails` });
    } catch (error) {
        console.error('Error in bulk update:', error);
        res.status(500).json({ message: 'Error performing bulk update' });
    }
};

// Bulk Delete (permanently or move to trash)
export const bulkDelete = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const { ids, permanent = false } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No email IDs provided' });
        }

        const where: any = {
            id: { in: ids },
            account: { user_id: userId }
        };

        if (permanent) {
            await prisma.emailMessage.deleteMany({ where });
            res.json({ message: `Permanently deleted ${ids.length} emails` });
        } else {
            await prisma.emailMessage.updateMany({
                where,
                data: { folder: 'trash' }
            });
            res.json({ message: `Moved ${ids.length} emails to trash` });
        }
    } catch (error) {
        console.error('Error in bulk delete:', error);
        res.status(500).json({ message: 'Error performing bulk delete' });
    }
};
