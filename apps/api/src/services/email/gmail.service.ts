import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../lib/prisma';

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
];

export class GmailService {
    private oauth2Client: OAuth2Client;

    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            process.env.GMAIL_REDIRECT_URI
        );
    }

    /**
     * Generate OAuth URL for user to authorize
     */
    getAuthUrl(state: string): string {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            state, // Pass user ID or session ID
            prompt: 'consent' // Force to get refresh token
        });
    }

    /**
     * Exchange authorization code for tokens
     */
    async getTokensFromCode(code: string) {
        const { tokens } = await this.oauth2Client.getToken(code);
        return tokens;
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(refreshToken: string) {
        this.oauth2Client.setCredentials({
            refresh_token: refreshToken
        });

        const { credentials } = await this.oauth2Client.refreshAccessToken();
        return credentials;
    }

    /**
     * Get user's email and profile info
     */
    async getUserInfo(accessToken: string) {
        this.oauth2Client.setCredentials({ access_token: accessToken });

        const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
        const { data } = await oauth2.userinfo.get();

        return {
            email: data.email!,
            name: data.name || data.email!.split('@')[0]
        };
    }

    /**
     * Fetch messages from Gmail
     */
    async fetchMessages(
        accountId: number,
        options: {
            maxResults?: number;
            pageToken?: string;
            query?: string; // Gmail search query
            labelIds?: string[];
        } = {}
    ) {
        const account = await prisma.emailAccount.findUnique({
            where: { id: accountId }
        });

        if (!account) {
            throw new Error('Email account not found');
        }

        // Check if token needs refresh
        if (account.token_expiry && new Date(account.token_expiry) < new Date()) {
            const newTokens = await this.refreshAccessToken(account.refresh_token!);
            await prisma.emailAccount.update({
                where: { id: accountId },
                data: {
                    access_token: newTokens.access_token!,
                    token_expiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : null
                }
            });
            this.oauth2Client.setCredentials(newTokens);
        } else {
            this.oauth2Client.setCredentials({
                access_token: account.access_token,
                refresh_token: account.refresh_token
            });
        }

        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

        // List messages
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: options.maxResults || 50,
            pageToken: options.pageToken,
            q: options.query,
            labelIds: options.labelIds
        });

        const messages = response.data.messages || [];
        const nextPageToken = response.data.nextPageToken;

        // Fetch full message details
        const fullMessages = await Promise.all(
            messages.map(async (msg) => {
                const fullMsg = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id!,
                    format: 'full'
                });
                return fullMsg.data;
            })
        );

        return {
            messages: fullMessages,
            nextPageToken
        };
    }

    /**
     * Send email via Gmail
     */
    async sendEmail(
        accountId: number,
        emailData: {
            to: string[];
            cc?: string[];
            bcc?: string[];
            subject: string;
            body: string;
            isHtml?: boolean;
            inReplyTo?: string;
            references?: string[];
        }
    ) {
        const account = await prisma.emailAccount.findUnique({
            where: { id: accountId }
        });

        if (!account) {
            throw new Error('Email account not found');
        }

        // Refresh token if needed
        if (account.token_expiry && new Date(account.token_expiry) < new Date()) {
            const newTokens = await this.refreshAccessToken(account.refresh_token!);
            await prisma.emailAccount.update({
                where: { id: accountId },
                data: {
                    access_token: newTokens.access_token!,
                    token_expiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : null
                }
            });
            this.oauth2Client.setCredentials(newTokens);
        } else {
            this.oauth2Client.setCredentials({
                access_token: account.access_token,
                refresh_token: account.refresh_token
            });
        }

        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

        // Build email message
        const messageParts = [
            `From: ${account.email}`,
            `To: ${emailData.to.join(', ')}`,
        ];

        if (emailData.cc && emailData.cc.length > 0) {
            messageParts.push(`Cc: ${emailData.cc.join(', ')}`);
        }

        if (emailData.bcc && emailData.bcc.length > 0) {
            messageParts.push(`Bcc: ${emailData.bcc.join(', ')}`);
        }

        messageParts.push(`Subject: ${emailData.subject}`);

        if (emailData.inReplyTo) {
            messageParts.push(`In-Reply-To: ${emailData.inReplyTo}`);
        }

        if (emailData.references && emailData.references.length > 0) {
            messageParts.push(`References: ${emailData.references.join(' ')}`);
        }

        messageParts.push(`Content-Type: ${emailData.isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`);
        messageParts.push('');
        messageParts.push(emailData.body);

        const message = messageParts.join('\n');
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });

        return response.data;
    }

    /**
     * Mark message as read/unread
     */
    async modifyMessage(
        accountId: number,
        messageId: string,
        modifications: {
            addLabelIds?: string[];
            removeLabelIds?: string[];
        }
    ) {
        const account = await prisma.emailAccount.findUnique({
            where: { id: accountId }
        });

        if (!account) {
            throw new Error('Email account not found');
        }

        this.oauth2Client.setCredentials({
            access_token: account.access_token,
            refresh_token: account.refresh_token
        });

        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

        const response = await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: modifications
        });

        return response.data;
    }

    /**
     * Parse Gmail message to our format
     */
    parseMessage(gmailMessage: any) {
        const headers = gmailMessage.payload.headers;
        const getHeader = (name: string) => {
            const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
            return header?.value || '';
        };

        // Parse email addresses
        const parseAddresses = (addressString: string) => {
            if (!addressString) return [];
            return addressString.split(',').map(addr => {
                const match = addr.match(/(.+?)\s*<(.+?)>/) || addr.match(/(.+)/);
                if (match) {
                    return {
                        name: match[1]?.trim() || match[2]?.trim(),
                        email: match[2]?.trim() || match[1]?.trim()
                    };
                }
                return { name: addr.trim(), email: addr.trim() };
            });
        };

        // Get body
        let bodyText = '';
        let bodyHtml = '';

        const getBody = (part: any) => {
            if (part.mimeType === 'text/plain' && part.body.data) {
                bodyText = Buffer.from(part.body.data, 'base64').toString('utf-8');
            } else if (part.mimeType === 'text/html' && part.body.data) {
                bodyHtml = Buffer.from(part.body.data, 'base64').toString('utf-8');
            } else if (part.parts) {
                part.parts.forEach(getBody);
            }
        };

        if (gmailMessage.payload.parts) {
            gmailMessage.payload.parts.forEach(getBody);
        } else if (gmailMessage.payload.body.data) {
            const decoded = Buffer.from(gmailMessage.payload.body.data, 'base64').toString('utf-8');
            if (gmailMessage.payload.mimeType === 'text/html') {
                bodyHtml = decoded;
            } else {
                bodyText = decoded;
            }
        }

        return {
            message_id: gmailMessage.id,
            thread_id: gmailMessage.threadId,
            from_email: parseAddresses(getHeader('From'))[0]?.email || '',
            from_name: parseAddresses(getHeader('From'))[0]?.name || '',
            to: parseAddresses(getHeader('To')),
            cc: parseAddresses(getHeader('Cc')),
            subject: getHeader('Subject'),
            body_text: bodyText,
            body_html: bodyHtml,
            snippet: gmailMessage.snippet,
            in_reply_to: getHeader('In-Reply-To'),
            references: getHeader('References')?.split(' ').filter(Boolean) || [],
            labels: gmailMessage.labelIds || [],
            is_read: !gmailMessage.labelIds?.includes('UNREAD'),
            is_starred: gmailMessage.labelIds?.includes('STARRED'),
            has_attachments: gmailMessage.payload.parts?.some((p: any) => p.filename) || false,
            received_at: new Date(parseInt(gmailMessage.internalDate)),
            provider_data: gmailMessage
        };
    }
}

export const gmailService = new GmailService();
