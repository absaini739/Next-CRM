import { prisma } from '../../lib/prisma';
import { gmailService } from './gmail.service';
import { outlookService } from './outlook.service';

export class EmailSyncService {
    /**
     * Sync emails for a specific account
     */
    async syncAccount(accountId: number) {
        const account = await prisma.emailAccount.findUnique({
            where: { id: accountId }
        });

        if (!account || !account.sync_enabled) {
            return;
        }

        console.log(`Starting sync for account: ${account.email}`);

        try {
            if (account.provider === 'gmail') {
                await this.syncGmailAccount(account);
            } else if (account.provider === 'outlook') {
                await this.syncOutlookAccount(account);
            }

            // Update last sync time
            await prisma.emailAccount.update({
                where: { id: accountId },
                data: { last_sync_at: new Date() }
            });

            console.log(`Sync completed for account: ${account.email}`);
        } catch (error) {
            console.error(`Sync failed for account ${account.email}:`, error);
            throw error;
        }
    }

    /**
     * Sync Gmail account
     */
    private async syncGmailAccount(account: any) {
        const { messages } = await gmailService.fetchMessages(account.id, {
            maxResults: parseInt(process.env.EMAIL_SYNC_BATCH_SIZE || '50'),
            labelIds: ['INBOX', 'SENT']
        });

        for (const gmailMsg of messages) {
            const parsed = gmailService.parseMessage(gmailMsg);

            // Check if message already exists
            const existing = await prisma.emailMessage.findUnique({
                where: {
                    account_id_message_id: {
                        account_id: account.id,
                        message_id: parsed.message_id
                    }
                }
            });

            if (existing) {
                // Update if needed (e.g., read status changed)
                await prisma.emailMessage.update({
                    where: { id: existing.id },
                    data: {
                        is_read: parsed.is_read,
                        is_starred: parsed.is_starred,
                        labels: parsed.labels
                    }
                });
            } else {
                // Create new message
                await this.createEmailMessage(account.id, parsed);
            }
        }
    }

    /**
     * Sync Outlook account
     */
    private async syncOutlookAccount(account: any) {
        const messages = await outlookService.fetchMessages(account.id, {
            top: parseInt(process.env.EMAIL_SYNC_BATCH_SIZE || '50')
        });

        for (const outlookMsg of messages) {
            const parsed = outlookService.parseMessage(outlookMsg);

            // Check if message already exists
            const existing = await prisma.emailMessage.findUnique({
                where: {
                    account_id_message_id: {
                        account_id: account.id,
                        message_id: parsed.message_id
                    }
                }
            });

            if (existing) {
                // Update if needed
                await prisma.emailMessage.update({
                    where: { id: existing.id },
                    data: {
                        is_read: parsed.is_read,
                        is_starred: parsed.is_starred
                    }
                });
            } else {
                // Create new message
                await this.createEmailMessage(account.id, parsed);
            }
        }
    }

    /**
     * Create email message and handle threading
     */
    private async createEmailMessage(accountId: number, parsedMessage: any) {
        // Try to find or create thread
        let threadId: number | null = null;

        if (parsedMessage.in_reply_to || parsedMessage.references?.length > 0) {
            // Try to find existing thread by subject or message references
            const thread = await prisma.emailThread.findFirst({
                where: {
                    subject: parsedMessage.subject,
                    participant_emails: {
                        array_contains: parsedMessage.from_email
                    }
                }
            });

            if (thread) {
                threadId = thread.id;
                // Update thread
                await prisma.emailThread.update({
                    where: { id: thread.id },
                    data: {
                        last_message_at: parsedMessage.received_at || new Date(),
                        message_count: { increment: 1 }
                    }
                });
            }
        }

        // Create thread if not found
        if (!threadId && parsedMessage.subject) {
            const participants = [
                parsedMessage.from_email,
                ...parsedMessage.to.map((t: any) => t.email)
            ].filter((email, index, self) => self.indexOf(email) === index);

            const newThread = await prisma.emailThread.create({
                data: {
                    subject: parsedMessage.subject,
                    participant_emails: participants,
                    last_message_at: parsedMessage.received_at || new Date(),
                    message_count: 1
                }
            });
            threadId = newThread.id;
        }

        // Determine folder based on labels
        let folder = 'inbox';
        if (parsedMessage.labels) {
            if (parsedMessage.labels.includes('SENT')) folder = 'sent';
            else if (parsedMessage.labels.includes('DRAFT')) folder = 'draft';
            else if (parsedMessage.labels.includes('TRASH')) folder = 'trash';
        }

        // Auto-link to CRM records by email address
        const personMatch = await prisma.person.findFirst({
            where: {
                emails: {
                    path: '$[*].value',
                    array_contains: parsedMessage.from_email
                }
            }
        });

        const leadMatch = personMatch ? await prisma.lead.findFirst({
            where: { person_id: personMatch.id }
        }) : null;

        const dealMatch = personMatch ? await prisma.deal.findFirst({
            where: { person_id: personMatch.id }
        }) : null;

        // Create email message
        await prisma.emailMessage.create({
            data: {
                account_id: accountId,
                thread_id: threadId,
                message_id: parsedMessage.message_id,
                in_reply_to: parsedMessage.in_reply_to,
                references: parsedMessage.references || [],
                from_email: parsedMessage.from_email,
                from_name: parsedMessage.from_name,
                to: parsedMessage.to,
                cc: parsedMessage.cc || [],
                bcc: parsedMessage.bcc || [],
                subject: parsedMessage.subject,
                body_text: parsedMessage.body_text,
                body_html: parsedMessage.body_html,
                snippet: parsedMessage.snippet,
                folder,
                labels: parsedMessage.labels || [],
                is_read: parsedMessage.is_read,
                is_starred: parsedMessage.is_starred,
                has_attachments: parsedMessage.has_attachments,
                sent_at: parsedMessage.sent_at,
                received_at: parsedMessage.received_at,
                person_id: personMatch?.id,
                lead_id: leadMatch?.id,
                deal_id: dealMatch?.id,
                provider_data: parsedMessage.provider_data
            }
        });
    }

    /**
     * Sync all enabled accounts
     */
    async syncAllAccounts() {
        const accounts = await prisma.emailAccount.findMany({
            where: { sync_enabled: true }
        });

        for (const account of accounts) {
            try {
                await this.syncAccount(account.id);
            } catch (error) {
                console.error(`Failed to sync account ${account.email}:`, error);
                // Continue with other accounts
            }
        }
    }
}

export const emailSyncService = new EmailSyncService();
