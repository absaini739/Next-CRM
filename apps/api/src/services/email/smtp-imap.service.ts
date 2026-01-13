import nodemailer from 'nodemailer';
import { simpleParser } from 'mailparser';
import imaps from 'imap-simple';
import { encryptionService } from '../security/encryption.service';
import { prisma } from '../../lib/prisma';

export interface SmtpConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure?: boolean;
}

export interface ImapConfig {
    user: string;
    password: string;
    host: string;
    port: number;
    tls: boolean;
}

export class SmtpImapService {

    /**
     * Test connection for both SMTP and IMAP
     */
    async testConnection(config: {
        email: string;
        password: string;
        smtpHost: string;
        smtpPort: number;
        imapHost: string;
        imapPort: number;
    }): Promise<{ success: boolean; error?: string }> {
        try {
            // Test SMTP
            const transporter = nodemailer.createTransport({
                host: config.smtpHost,
                port: config.smtpPort,
                secure: config.smtpPort === 465, // true for 465, false for other ports
                auth: {
                    user: config.email,
                    pass: config.password,
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            await transporter.verify();

            // Test IMAP
            const imapConfig: any = {
                imap: {
                    user: config.email,
                    password: config.password,
                    host: config.imapHost,
                    port: config.imapPort,
                    tls: config.imapPort === 993,
                    tlsOptions: { rejectUnauthorized: false },
                    authTimeout: 10000
                }
            };

            const connection = await imaps.connect(imapConfig);
            await connection.end();

            return { success: true };
        } catch (error: any) {
            console.error('Connection test failed:', error);
            return {
                success: false,
                error: error.message || 'Failed to connect to email server'
            };
        }
    }

    /**
     * Send email via SMTP
     */
    async sendEmail(accountId: number, emailData: {
        to: string[];
        cc?: string[];
        bcc?: string[];
        subject: string;
        body: string;
        isHtml?: boolean;
        inReplyTo?: string;
        attachments?: any[];
    }) {
        const account = await prisma.emailAccount.findUnique({
            where: { id: accountId }
        });

        if (!account || !account.encrypted_password) {
            throw new Error('Account not found or missing credentials');
        }

        const password = encryptionService.decrypt(account.encrypted_password);

        const transporter = nodemailer.createTransport({
            host: account.smtp_host || '',
            port: account.smtp_port || 587,
            secure: account.smtp_port === 465,
            auth: {
                user: account.smtp_username || account.email,
                pass: password,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions: any = {
            from: `"${account.display_name || account.email}" <${account.email}>`,
            to: emailData.to.join(', '),
            cc: emailData.cc?.join(', '),
            bcc: emailData.bcc?.join(', '),
            subject: emailData.subject,
            [emailData.isHtml ? 'html' : 'text']: emailData.body,
            inReplyTo: emailData.inReplyTo,
            references: emailData.inReplyTo ? [emailData.inReplyTo] : undefined,
        };

        if (emailData.attachments) {
            mailOptions.attachments = emailData.attachments;
        }

        const info = await transporter.sendMail(mailOptions);
        return info;
    }

    /**
     * Fetch messages via IMAP
     */
    async fetchMessages(accountId: number, options: {
        folder?: string;
        since?: Date;
        lastUid?: number
    } = {}) {
        const account = await prisma.emailAccount.findUnique({
            where: { id: accountId }
        });

        if (!account || !account.encrypted_password) {
            throw new Error('Account not found or missing credentials');
        }

        const password = encryptionService.decrypt(account.encrypted_password);

        const config: any = {
            imap: {
                user: account.imap_username || account.email,
                password: password,
                host: account.imap_host || '',
                port: account.imap_port || 993,
                tls: account.imap_port === 993,
                tlsOptions: { rejectUnauthorized: false },
                authTimeout: 10000
            }
        };

        const connection = await imaps.connect(config);

        // Add error listener to prevent unhandled socket errors from crashing the process
        connection.on('error', (err: any) => {
            console.error(`[IMAP Socket Error] ${account.email}:`, err.message);
        });

        try {
            const folderLower = (options.folder || 'inbox').toLowerCase();

            const map: Record<string, string[]> = {
                'inbox': ['INBOX'],
                'sent': ['Sent Items', 'Sent Mail', '[Gmail]/Sent Mail', 'Sent'],
                'trash': ['Trash', '[Gmail]/Trash', 'Deleted Items', 'Bin'],
                'drafts': ['Drafts', '[Gmail]/Drafts'],
                'archive': ['Archive', '[Gmail]/All Mail']
            };

            const candidates = map[folderLower] || [options.folder || 'INBOX'];
            let boxOpened = false;

            for (const folderName of candidates) {
                try {
                    await connection.openBox(folderName);
                    boxOpened = true;
                    break;
                } catch (e) {
                    continue; // Try next candidate
                }
            }

            if (!boxOpened) {
                // If no folder worked, return empty array instead of throwing to avoid breaking sync
                console.warn(`[Sync] Could not open any candidates for folder ${folderLower}`);
                return [];
            }

            const searchCriteria: any[] = [];
            if (options.since) {
                searchCriteria.push(['SINCE', options.since]);
            } else {
                searchCriteria.push(['ALL']);
            }

            const fetchOptions = {
                bodies: ['HEADER', 'TEXT', ''],
                struct: true,
                markSeen: false
            };

            const messages = await connection.search(searchCriteria, fetchOptions);

            // Sort by UID descending to get newest messages first
            messages.sort((a: any, b: any) => b.attributes.uid - a.attributes.uid);

            // Limit to most recent 50 messages to prevent timeout/memory issues
            const limitedMessages = messages.slice(0, 50);

            const parsedMessages = [];

            for (const message of limitedMessages) {
                // Parse full message if possible
                const all = message.parts.find((part: any) => part.which === '');
                const id = message.attributes.uid;
                const flags = message.attributes.flags;

                if (all) {
                    const parsed: any = await simpleParser(all.body);

                    parsedMessages.push({
                        uid: id,
                        flags: flags,
                        message_id: parsed.messageId,
                        from: parsed.from?.value,
                        to: parsed.to?.value,
                        cc: parsed.cc?.value || [],
                        bcc: parsed.bcc?.value || [],
                        subject: parsed.subject,
                        text: parsed.text,
                        html: parsed.html,
                        date: parsed.date,
                        in_reply_to: parsed.inReplyTo,
                        references: parsed.references,
                    });
                }
            }

            return parsedMessages;

        } finally {
            connection.end();
        }
    }
}

export const smtpImapService = new SmtpImapService();
