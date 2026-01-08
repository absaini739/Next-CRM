import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication, AuthorizationUrlRequest, AuthorizationCodeRequest } from '@azure/msal-node';
import { prisma } from '../../lib/prisma';
import 'isomorphic-fetch';

const SCOPES = [
    'https://graph.microsoft.com/Mail.Read',
    'https://graph.microsoft.com/Mail.Send',
    'https://graph.microsoft.com/Mail.ReadWrite',
    'https://graph.microsoft.com/User.Read'
];

export class OutlookService {
    private msalClient: ConfidentialClientApplication;

    constructor() {
        this.msalClient = new ConfidentialClientApplication({
            auth: {
                clientId: process.env.OUTLOOK_CLIENT_ID!,
                authority: `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}`,
                clientSecret: process.env.OUTLOOK_CLIENT_SECRET!
            }
        });
    }

    /**
     * Generate OAuth URL for user to authorize
     */
    async getAuthUrl(state: string): Promise<string> {
        const authCodeUrlParameters: AuthorizationUrlRequest = {
            scopes: SCOPES,
            redirectUri: process.env.OUTLOOK_REDIRECT_URI!,
            state
        };

        const authUrl = await this.msalClient.getAuthCodeUrl(authCodeUrlParameters);
        return authUrl;
    }

    /**
     * Exchange authorization code for tokens
     */
    async getTokensFromCode(code: string) {
        const tokenRequest: AuthorizationCodeRequest = {
            code,
            scopes: SCOPES,
            redirectUri: process.env.OUTLOOK_REDIRECT_URI!
        };

        const response = await this.msalClient.acquireTokenByCode(tokenRequest);

        if (!response) {
            throw new Error('Failed to acquire token');
        }

        return {
            accessToken: response.accessToken,
            refreshToken: response.account?.homeAccountId || '', // Store account ID instead
            expiresOn: response.expiresOn || undefined
        };
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(accountHomeId: string) {
        const account = await this.msalClient.getTokenCache().getAccountByHomeId(accountHomeId);

        if (!account) {
            throw new Error('Account not found in cache');
        }

        const silentRequest = {
            account,
            scopes: SCOPES
        };

        const response = await this.msalClient.acquireTokenSilent(silentRequest);

        if (!response) {
            throw new Error('Failed to refresh token');
        }

        return {
            accessToken: response.accessToken,
            refreshToken: response.account?.homeAccountId || '',
            expiresOn: response.expiresOn || undefined
        };
    }

    /**
     * Get authenticated Graph client
     */
    private getGraphClient(accessToken: string): Client {
        return Client.init({
            authProvider: (done) => {
                done(null, accessToken);
            }
        });
    }

    /**
     * Get user's email and profile info
     */
    async getUserInfo(accessToken: string) {
        const client = this.getGraphClient(accessToken);
        const user = await client.api('/me').get();

        return {
            email: user.mail || user.userPrincipalName,
            name: user.displayName || user.mail
        };
    }

    /**
     * Fetch messages from Outlook
     */
    async fetchMessages(
        accountId: number,
        options: {
            top?: number;
            skip?: number;
            filter?: string;
            search?: string;
            folder?: string;
        } = {}
    ) {
        const account = await prisma.emailAccount.findUnique({
            where: { id: accountId }
        });

        if (!account) {
            throw new Error('Email account not found');
        }

        // Check if token needs refresh
        let accessToken = account.access_token;
        if (account.token_expiry && new Date(account.token_expiry) < new Date()) {
            const newTokens = await this.refreshAccessToken(account.refresh_token!);
            await prisma.emailAccount.update({
                where: { id: accountId },
                data: {
                    access_token: newTokens.accessToken,
                    refresh_token: newTokens.refreshToken,
                    token_expiry: newTokens.expiresOn
                }
            });
            accessToken = newTokens.accessToken;
        }

        const client = this.getGraphClient(accessToken);

        // Build API endpoint
        let endpoint = options.folder
            ? `/me/mailFolders/${options.folder}/messages`
            : '/me/messages';

        let query = client.api(endpoint)
            .top(options.top || 50)
            .skip(options.skip || 0)
            .orderby('receivedDateTime DESC');

        if (options.filter) {
            query = query.filter(options.filter);
        }

        if (options.search) {
            query = query.search(`"${options.search}"`);
        }

        const response = await query.get();
        return response.value;
    }

    /**
     * Send email via Outlook
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
        }
    ) {
        const account = await prisma.emailAccount.findUnique({
            where: { id: accountId }
        });

        if (!account) {
            throw new Error('Email account not found');
        }

        // Refresh token if needed
        let accessToken = account.access_token;
        if (account.token_expiry && new Date(account.token_expiry) < new Date()) {
            const newTokens = await this.refreshAccessToken(account.refresh_token!);
            await prisma.emailAccount.update({
                where: { id: accountId },
                data: {
                    access_token: newTokens.accessToken,
                    refresh_token: newTokens.refreshToken,
                    token_expiry: newTokens.expiresOn
                }
            });
            accessToken = newTokens.accessToken;
        }

        const client = this.getGraphClient(accessToken);

        const message = {
            subject: emailData.subject,
            body: {
                contentType: emailData.isHtml ? 'HTML' : 'Text',
                content: emailData.body
            },
            toRecipients: emailData.to.map(email => ({
                emailAddress: { address: email }
            })),
            ccRecipients: emailData.cc?.map(email => ({
                emailAddress: { address: email }
            })),
            bccRecipients: emailData.bcc?.map(email => ({
                emailAddress: { address: email }
            }))
        };

        const response = await client.api('/me/sendMail').post({
            message,
            saveToSentItems: true
        });

        return response;
    }

    /**
     * Mark message as read/unread
     */
    async markAsRead(accountId: number, messageId: string, isRead: boolean) {
        const account = await prisma.emailAccount.findUnique({
            where: { id: accountId }
        });

        if (!account) {
            throw new Error('Email account not found');
        }

        const client = this.getGraphClient(account.access_token);

        await client.api(`/me/messages/${messageId}`).patch({
            isRead
        });
    }

    /**
     * Move message to folder
     */
    async moveMessage(accountId: number, messageId: string, destinationFolderId: string) {
        const account = await prisma.emailAccount.findUnique({
            where: { id: accountId }
        });

        if (!account) {
            throw new Error('Email account not found');
        }

        const client = this.getGraphClient(account.access_token);

        await client.api(`/me/messages/${messageId}/move`).post({
            destinationId: destinationFolderId
        });
    }

    /**
     * Parse Outlook message to our format
     */
    parseMessage(outlookMessage: any) {
        const parseAddresses = (addresses: any[]) => {
            if (!addresses) return [];
            return addresses.map(addr => ({
                name: addr.emailAddress.name || addr.emailAddress.address,
                email: addr.emailAddress.address
            }));
        };

        return {
            message_id: outlookMessage.id,
            from_email: outlookMessage.from?.emailAddress?.address || '',
            from_name: outlookMessage.from?.emailAddress?.name || '',
            to: parseAddresses(outlookMessage.toRecipients || []),
            cc: parseAddresses(outlookMessage.ccRecipients || []),
            bcc: parseAddresses(outlookMessage.bccRecipients || []),
            subject: outlookMessage.subject || '',
            body_text: outlookMessage.bodyPreview || '',
            body_html: outlookMessage.body?.contentType === 'html' ? outlookMessage.body.content : '',
            snippet: outlookMessage.bodyPreview?.substring(0, 200) || '',
            in_reply_to: outlookMessage.conversationId,
            is_read: outlookMessage.isRead || false,
            is_starred: outlookMessage.flag?.flagStatus === 'flagged',
            has_attachments: outlookMessage.hasAttachments || false,
            received_at: new Date(outlookMessage.receivedDateTime),
            sent_at: new Date(outlookMessage.sentDateTime),
            provider_data: outlookMessage
        };
    }
}

export const outlookService = new OutlookService();
