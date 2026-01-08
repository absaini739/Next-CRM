import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { gmailService } from '../services/email/gmail.service';
import { outlookService } from '../services/email/outlook.service';

const connectAccountSchema = z.object({
    provider: z.enum(['gmail', 'outlook'])
});

/**
 * Initiate OAuth flow - redirect user to provider
 */
export const initiateOAuth = async (req: Request, res: Response) => {
    try {
        const { provider } = connectAccountSchema.parse(req.body);
        // @ts-ignore
        const userId = req.userId;

        // Use userId as state to identify user after OAuth callback
        const state = Buffer.from(JSON.stringify({ userId, provider })).toString('base64');

        let authUrl: string;
        if (provider === 'gmail') {
            authUrl = gmailService.getAuthUrl(state);
        } else {
            authUrl = await outlookService.getAuthUrl(state);
        }

        res.json({ authUrl });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        console.error('Error initiating OAuth:', error);
        res.status(500).json({ message: 'Error initiating OAuth' });
    }
};

/**
 * Handle OAuth callback from provider
 */
export const handleOAuthCallback = async (req: Request, res: Response) => {
    try {
        const { code, state } = req.query;

        if (!code || !state) {
            return res.status(400).json({ message: 'Missing code or state' });
        }

        // Decode state to get userId and provider
        const { userId, provider } = JSON.parse(Buffer.from(state as string, 'base64').toString());

        let tokens: any;
        let userInfo: any;

        if (provider === 'gmail') {
            tokens = await gmailService.getTokensFromCode(code as string);
            userInfo = await gmailService.getUserInfo(tokens.access_token!);
        } else {
            tokens = await outlookService.getTokensFromCode(code as string);
            userInfo = await outlookService.getUserInfo(tokens.accessToken);
        }

        // Check if account already exists
        const existingAccount = await prisma.emailAccount.findFirst({
            where: {
                user_id: parseInt(userId),
                email: userInfo.email
            }
        });

        if (existingAccount) {
            // Update tokens
            await prisma.emailAccount.update({
                where: { id: existingAccount.id },
                data: {
                    access_token: provider === 'gmail' ? tokens.access_token! : tokens.accessToken,
                    refresh_token: provider === 'gmail' ? tokens.refresh_token : tokens.refreshToken,
                    token_expiry: provider === 'gmail'
                        ? (tokens.expiry_date ? new Date(tokens.expiry_date) : null)
                        : tokens.expiresOn
                }
            });
        } else {
            // Create new account
            await prisma.emailAccount.create({
                data: {
                    user_id: parseInt(userId),
                    provider,
                    email: userInfo.email,
                    display_name: userInfo.name,
                    access_token: provider === 'gmail' ? tokens.access_token! : tokens.accessToken,
                    refresh_token: provider === 'gmail' ? tokens.refresh_token : tokens.refreshToken,
                    token_expiry: provider === 'gmail'
                        ? (tokens.expiry_date ? new Date(tokens.expiry_date) : null)
                        : tokens.expiresOn,
                    is_default: false // User can set default later
                }
            });
        }

        // Redirect to frontend success page
        res.redirect(`http://localhost:3000/settings/email-accounts?success=true&email=${encodeURIComponent(userInfo.email)}`);
    } catch (error) {
        console.error('Error handling OAuth callback:', error);
        res.redirect(`http://localhost:3000/settings/email-accounts?error=true`);
    }
};

/**
 * Get all connected email accounts for user
 */
export const getEmailAccounts = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;

        const accounts = await prisma.emailAccount.findMany({
            where: { user_id: userId },
            select: {
                id: true,
                provider: true,
                email: true,
                display_name: true,
                is_default: true,
                sync_enabled: true,
                last_sync_at: true,
                created_at: true
            },
            orderBy: { created_at: 'desc' }
        });

        res.json(accounts);
    } catch (error) {
        console.error('Error fetching email accounts:', error);
        res.status(500).json({ message: 'Error fetching email accounts' });
    }
};

/**
 * Disconnect email account
 */
export const disconnectAccount = async (req: Request, res: Response) => {
    try {
        const accountId = parseInt(req.params.id);
        // @ts-ignore
        const userId = req.userId;

        // Verify account belongs to user
        const account = await prisma.emailAccount.findFirst({
            where: { id: accountId, user_id: userId }
        });

        if (!account) {
            return res.status(404).json({ message: 'Email account not found' });
        }

        // Delete account (will cascade delete messages)
        await prisma.emailAccount.delete({
            where: { id: accountId }
        });

        res.json({ message: 'Email account disconnected successfully' });
    } catch (error) {
        console.error('Error disconnecting account:', error);
        res.status(500).json({ message: 'Error disconnecting account' });
    }
};

/**
 * Set default email account
 */
export const setDefaultAccount = async (req: Request, res: Response) => {
    try {
        const accountId = parseInt(req.params.id);
        // @ts-ignore
        const userId = req.userId;

        // Verify account belongs to user
        const account = await prisma.emailAccount.findFirst({
            where: { id: accountId, user_id: userId }
        });

        if (!account) {
            return res.status(404).json({ message: 'Email account not found' });
        }

        // Unset all defaults for this user
        await prisma.emailAccount.updateMany({
            where: { user_id: userId },
            data: { is_default: false }
        });

        // Set this one as default
        await prisma.emailAccount.update({
            where: { id: accountId },
            data: { is_default: true }
        });

        res.json({ message: 'Default account updated successfully' });
    } catch (error) {
        console.error('Error setting default account:', error);
        res.status(500).json({ message: 'Error setting default account' });
    }
};

/**
 * Trigger manual sync for an account
 */
export const triggerSync = async (req: Request, res: Response) => {
    try {
        const accountId = parseInt(req.params.id);
        // @ts-ignore
        const userId = req.userId;

        // Verify account belongs to user
        const account = await prisma.emailAccount.findFirst({
            where: { id: accountId, user_id: userId }
        });

        if (!account) {
            return res.status(404).json({ message: 'Email account not found' });
        }

        // TODO: Trigger background sync job
        // For now, just update last_sync_at
        await prisma.emailAccount.update({
            where: { id: accountId },
            data: { last_sync_at: new Date() }
        });

        res.json({ message: 'Sync triggered successfully' });
    } catch (error) {
        console.error('Error triggering sync:', error);
        res.status(500).json({ message: 'Error triggering sync' });
    }
};
