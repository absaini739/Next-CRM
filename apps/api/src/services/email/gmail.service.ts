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

/**
 * Bulletproof Gmail Service
 * 
 * Features:
 * - Automatic token refresh BEFORE expiry
 * - Retry logic with exponential backoff
 * - Comprehensive error handling
 * - Rate limiting protection
 * - Never crashes on API errors
 */
export class GmailService {
    private oauth2Client: OAuth2Client;

    // Retry configuration
    private readonly MAX_RETRIES = 3;
    private readonly INITIAL_RETRY_DELAY = 1000; // 1 second

    // Token refresh buffer (refresh 5 minutes before expiry)
    private readonly TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            process.env.GMAIL_REDIRECT_URI
        );
    }

    /**
     * Sleep utility for retry delays
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Execute with retry logic and exponential backoff
     */
    private async withRetry<T>(
        operation: () => Promise<T>,
        operationName: string
    ): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                return await operation();
            } catch (error: any) {
                lastError = error;

                // Don't retry on auth errors - they need token refresh
                if (error.code === 401 || error.message?.includes('invalid_grant')) {
                    throw error;
                }

                // Don't retry on 404 (not found)
                if (error.code === 404) {
                    throw error;
                }

                // Rate limit - wait longer
                if (error.code === 429 || error.message?.includes('Rate Limit')) {
                    const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt) * 2;
                    console.log(`[Gmail] Rate limited on ${operationName}, waiting ${delay}ms before retry ${attempt}/${this.MAX_RETRIES}`);
                    await this.sleep(delay);
                    continue;
                }

                // Other errors - use exponential backoff
                if (attempt < this.MAX_RETRIES) {
                    const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
                    console.log(`[Gmail] ${operationName} failed (attempt ${attempt}/${this.MAX_RETRIES}), retrying in ${delay}ms...`);
                    await this.sleep(delay);
                }
            }
        }

        console.error(`[Gmail] ${operationName} failed after ${this.MAX_RETRIES} attempts:`, lastError?.message);
        throw lastError;
    }

    /**
     * Ensure tokens are valid - proactively refresh before expiry
     */
    private async ensureValidTokens(account: any): Promise<any> {
        const now = Date.now();
        const tokenExpiry = account.token_expiry ? new Date(account.token_expiry).getTime() : 0;

        // Check if token is expired or will expire soon
        if (tokenExpiry && tokenExpiry - now < this.TOKEN_REFRESH_BUFFER_MS) {
            console.log(`[Gmail] Token for ${account.email} expires soon, refreshing proactively...`);

            try {
                const newTokens = await this.refreshAccessToken(account.refresh_token!);

                // Update in database
                await prisma.emailAccount.update({
                    where: { id: account.id },
                    data: {
                        access_token: newTokens.access_token!,
                        token_expiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : null
                    }
                });

                console.log(`[Gmail] Token refreshed successfully for ${account.email}`);

                return {
                    ...account,
                    access_token: newTokens.access_token,
                    token_expiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : null
                };
            } catch (error: any) {
                console.error(`[Gmail] Failed to refresh token for ${account.email}:`, error.message);

                // If refresh fails due to invalid grant, mark account as needing reauthorization
                if (error.message?.includes('invalid_grant')) {
                    await prisma.emailAccount.update({
                        where: { id: account.id },
                        data: { sync_enabled: false }
                    });
                    console.error(`[Gmail] Account ${account.email} needs to be reconnected`);
                }
                throw error;
            }
        }

        return account;
    }

    /**
     * Generate OAuth URL for user to authorize
     */
    getAuthUrl(state: string): string {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            state,
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
     * Fetch messages from Gmail - BULLETPROOF VERSION
     * - Automatic token refresh
     * - Retry with exponential backoff
     * - Graceful error handling
     */
    async fetchMessages(
        accountId: number,
        options: {
            maxResults?: number;
            pageToken?: string;
            query?: string;
            labelIds?: string[];
        } = {}
    ): Promise<{ messages: any[]; nextPageToken?: string }> {
        try {
            // Get account and ensure tokens are valid
            let account = await prisma.emailAccount.findUnique({
                where: { id: accountId }
            });

            if (!account) {
                console.error(`[Gmail] Account ${accountId} not found`);
                return { messages: [], nextPageToken: undefined };
            }

            // Proactively refresh token if needed
            account = await this.ensureValidTokens(account);

            // Set credentials
            this.oauth2Client.setCredentials({
                access_token: account!.access_token,
                refresh_token: account!.refresh_token
            });

            const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

            // List messages with retry
            const response = await this.withRetry(async () => {
                return gmail.users.messages.list({
                    userId: 'me',
                    maxResults: options.maxResults || 50,
                    pageToken: options.pageToken,
                    q: options.query,
                    labelIds: options.labelIds
                });
            }, 'messages.list');

            const messages = response.data.messages || [];
            const nextPageToken = response.data.nextPageToken;

            if (messages.length === 0) {
                return { messages: [], nextPageToken: undefined };
            }

            // Fetch full message details with retry and rate limiting
            const fullMessages: any[] = [];

            for (const msg of messages) {
                try {
                    const fullMsg = await this.withRetry(async () => {
                        return gmail.users.messages.get({
                            userId: 'me',
                            id: msg.id!,
                            format: 'full'
                        });
                    }, `messages.get(${msg.id})`);

                    fullMessages.push(fullMsg.data);

                    // Small delay between requests to avoid rate limiting
                    await this.sleep(50);
                } catch (error: any) {
                    // Log error but continue with other messages
                    console.warn(`[Gmail] Failed to fetch message ${msg.id}: ${error.message}`);
                }
            }

            return {
                messages: fullMessages,
                nextPageToken: nextPageToken || undefined
            };
        } catch (error: any) {
            console.error(`[Gmail] fetchMessages failed for account ${accountId}:`, error.message);

            // Return empty result instead of throwing - sync should continue with other folders
            return { messages: [], nextPageToken: undefined };
        }
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
        let account = await prisma.emailAccount.findUnique({
            where: { id: accountId }
        });

        if (!account) {
            throw new Error('Email account not found');
        }

        // Ensure valid tokens
        account = await this.ensureValidTokens(account);

        this.oauth2Client.setCredentials({
            access_token: account!.access_token,
            refresh_token: account!.refresh_token
        });

        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

        // Build email message
        const messageParts = [
            `From: ${account!.email}`,
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

        // Send with retry
        const response = await this.withRetry(async () => {
            return gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedMessage
                }
            });
        }, 'messages.send');

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
        let account = await prisma.emailAccount.findUnique({
            where: { id: accountId }
        });

        if (!account) {
            throw new Error('Email account not found');
        }

        account = await this.ensureValidTokens(account);

        this.oauth2Client.setCredentials({
            access_token: account!.access_token,
            refresh_token: account!.refresh_token
        });

        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

        const response = await this.withRetry(async () => {
            return gmail.users.messages.modify({
                userId: 'me',
                id: messageId,
                requestBody: modifications
            });
        }, 'messages.modify');

        return response.data;
    }

    /**
     * Parse Gmail message to our format - SAFE VERSION
     * Never throws errors, returns safe defaults if parsing fails
     */
    parseMessage(gmailMessage: any) {
        try {
            const headers = gmailMessage?.payload?.headers || [];
            const getHeader = (name: string) => {
                const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
                return header?.value || '';
            };

            // Parse email addresses
            const parseAddresses = (addressString: string) => {
                if (!addressString) return [];
                try {
                    return addressString.split(',').map(addr => {
                        const match = addr.match(/(.+?)\s*<(.+?)>/) || addr.match(/(.+)/);
                        if (match) {
                            return {
                                name: match[1]?.trim() || match[2]?.trim() || '',
                                email: match[2]?.trim() || match[1]?.trim() || ''
                            };
                        }
                        return { name: addr.trim(), email: addr.trim() };
                    });
                } catch {
                    return [{ name: addressString, email: addressString }];
                }
            };

            // Get body safely
            let bodyText = '';
            let bodyHtml = '';

            const getBody = (part: any) => {
                try {
                    if (part?.mimeType === 'text/plain' && part?.body?.data) {
                        bodyText = Buffer.from(part.body.data, 'base64').toString('utf-8');
                    } else if (part?.mimeType === 'text/html' && part?.body?.data) {
                        bodyHtml = Buffer.from(part.body.data, 'base64').toString('utf-8');
                    } else if (part?.parts) {
                        part.parts.forEach(getBody);
                    }
                } catch {
                    // Ignore body parsing errors
                }
            };

            if (gmailMessage?.payload?.parts) {
                gmailMessage.payload.parts.forEach(getBody);
            } else if (gmailMessage?.payload?.body?.data) {
                try {
                    const decoded = Buffer.from(gmailMessage.payload.body.data, 'base64').toString('utf-8');
                    if (gmailMessage.payload.mimeType === 'text/html') {
                        bodyHtml = decoded;
                    } else {
                        bodyText = decoded;
                    }
                } catch {
                    // Ignore decoding errors
                }
            }

            return {
                message_id: gmailMessage?.id || `unknown_${Date.now()}`,
                thread_id: gmailMessage?.threadId || null,
                from_email: parseAddresses(getHeader('From'))[0]?.email || 'unknown@unknown.com',
                from_name: parseAddresses(getHeader('From'))[0]?.name || 'Unknown',
                to: parseAddresses(getHeader('To')),
                cc: parseAddresses(getHeader('Cc')),
                subject: getHeader('Subject') || '(No Subject)',
                body_text: bodyText,
                body_html: bodyHtml,
                snippet: gmailMessage?.snippet || '',
                in_reply_to: getHeader('In-Reply-To') || null,
                references: getHeader('References')?.split(' ').filter(Boolean) || [],
                labels: gmailMessage?.labelIds || [],
                is_read: !gmailMessage?.labelIds?.includes('UNREAD'),
                is_starred: gmailMessage?.labelIds?.includes('STARRED') || false,
                has_attachments: gmailMessage?.payload?.parts?.some((p: any) => p.filename) || false,
                received_at: gmailMessage?.internalDate ? new Date(parseInt(gmailMessage.internalDate)) : new Date(),
                provider_data: gmailMessage
            };
        } catch (error: any) {
            console.warn(`[Gmail] Failed to parse message:`, error.message);

            // Return minimal valid message object
            return {
                message_id: gmailMessage?.id || `error_${Date.now()}`,
                thread_id: null,
                from_email: 'unknown@unknown.com',
                from_name: 'Unknown',
                to: [],
                cc: [],
                subject: '(Parse Error)',
                body_text: '',
                body_html: '',
                snippet: '',
                in_reply_to: null,
                references: [],
                labels: [],
                is_read: true,
                is_starred: false,
                has_attachments: false,
                received_at: new Date(),
                provider_data: gmailMessage
            };
        }
    }
}

export const gmailService = new GmailService();
