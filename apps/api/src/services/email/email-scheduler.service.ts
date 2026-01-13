import { prisma } from '../../lib/prisma';
import { gmailService } from './gmail.service';
import { outlookService } from './outlook.service';
import { smtpImapService } from './smtp-imap.service';

export class EmailSchedulerService {
    private interval: NodeJS.Timeout | null = null;
    private isProcessing = false;

    /**
     * Start the scheduler
     */
    start(intervalMs: number = 60000) { // Default 1 minute
        if (this.interval) return;

        console.log('🚀 Email Scheduler started');
        this.interval = setInterval(() => this.processScheduledEmails(), intervalMs);

        // Run once immediately
        this.processScheduledEmails();
    }

    /**
     * Stop the scheduler
     */
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
     * Process emails that are due to be sent
     */
    async processScheduledEmails() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            const now = new Date();
            const pendingEmails = await prisma.emailMessage.findMany({
                where: {
                    folder: 'outbox',
                    scheduled_at: {
                        lte: now
                    }
                },
                include: {
                    account: true
                }
            });

            if (pendingEmails.length > 0) {
                console.log(`📨 Found ${pendingEmails.length} scheduled emails to send`);
            }

            for (const email of pendingEmails) {
                try {
                    await this.sendEmail(email);
                    console.log(`✅ Successfully sent scheduled email ID: ${email.id}`);
                } catch (error) {
                    console.error(`❌ Failed to send scheduled email ID: ${email.id}`, error);
                    // Optionally: Mark as failed or retry later
                    // For now, it will stay in 'outbox' and retry on next tick
                }
            }
        } catch (error) {
            console.error('Error in Email Scheduler:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    private async sendEmail(email: any) {
        const account = email.account;
        if (!account) throw new Error('Account not found for email');

        let sentMessageId: string;

        // Send via provider
        if (account.provider === 'gmail' && account.connection_type !== 'smtp_imap') {
            const info = await gmailService.sendEmail(account.id, {
                to: email.to as string[],
                cc: (email.cc as string[]) || undefined,
                bcc: (email.bcc as string[]) || undefined,
                subject: email.subject,
                body: email.body_html || email.body_text || '',
                isHtml: !!email.body_html
            });
            sentMessageId = info.id || '';
        } else if (account.provider === 'outlook' && account.connection_type !== 'smtp_imap') {
            const info = await outlookService.sendEmail(account.id, {
                to: email.to as string[],
                cc: (email.cc as string[]) || undefined,
                bcc: (email.bcc as string[]) || undefined,
                subject: email.subject,
                body: email.body_html || email.body_text || '',
                isHtml: !!email.body_html
            });
            sentMessageId = info.id;
        } else {
            // SMTP/IMAP
            const info = await smtpImapService.sendEmail(account.id, {
                to: email.to as string[],
                cc: (email.cc as string[]) || undefined,
                bcc: (email.bcc as string[]) || undefined,
                subject: email.subject,
                body: email.body_html || email.body_text || '',
                isHtml: !!email.body_html
            });
            sentMessageId = info.messageId;
        }

        // Update email record
        await prisma.emailMessage.update({
            where: { id: email.id },
            data: {
                message_id: sentMessageId,
                folder: 'sent',
                sent_at: new Date()
            }
        });
    }
}

export const emailSchedulerService = new EmailSchedulerService();
