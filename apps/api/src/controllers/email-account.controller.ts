import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { gmailService } from '../services/email/gmail.service';
import { outlookService } from '../services/email/outlook.service';
import { emailSyncService } from '../services/email/email-sync.service';

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
 * AUTO-TRIGGERS INITIAL SYNC for new accounts
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
        let accountId: number;
        let isNewAccount = false;

        if (provider === 'gmail') {
            tokens = await gmailService.getTokensFromCode(code as string);
            userInfo = await gmailService.getUserInfo(tokens.access_token!);

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
                        access_token: tokens.access_token!,
                        refresh_token: tokens.refresh_token || null,
                        token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                        sync_enabled: true
                    }
                });
                accountId = existingAccount.id;
            } else {
                // Create new account
                const newAccount = await prisma.emailAccount.create({
                    data: {
                        user_id: parseInt(userId),
                        provider,
                        email: userInfo.email,
                        display_name: userInfo.name,
                        access_token: tokens.access_token!,
                        refresh_token: tokens.refresh_token || null,
                        token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                        is_default: false,
                        sync_enabled: true
                    }
                });
                accountId = newAccount.id;
                isNewAccount = true;
            }
        } else {
            tokens = await outlookService.getTokensFromCode(code as string);
            userInfo = await outlookService.getUserInfo(tokens.accessToken);

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
                        access_token: tokens.accessToken,
                        refresh_token: tokens.refreshToken,
                        token_expiry: tokens.expiresOn,
                        sync_enabled: true
                    }
                });
                accountId = existingAccount.id;
            } else {
                // Create new account
                const newAccount = await prisma.emailAccount.create({
                    data: {
                        user_id: parseInt(userId),
                        provider,
                        email: userInfo.email,
                        display_name: userInfo.name,
                        access_token: tokens.accessToken,
                        refresh_token: tokens.refreshToken,
                        token_expiry: tokens.expiresOn,
                        is_default: false,
                        sync_enabled: true
                    }
                });
                accountId = newAccount.id;
                isNewAccount = true;
            }
        }

        // 🔄 AUTO-TRIGGER INITIAL SYNC FOR NEW ACCOUNTS
        // Run sync in background (don't await - redirect user immediately)
        if (isNewAccount) {
            console.log(`\n🆕 New account connected: ${userInfo.email} - Starting background sync...`);
            emailSyncService.initialSyncForNewAccount(accountId).catch(err => {
                console.error(`Background sync failed for ${userInfo.email}:`, err);
            });
        } else {
            // Even for existing accounts, trigger a sync to get latest emails
            console.log(`\n🔄 Existing account reconnected: ${userInfo.email} - Starting background sync...`);
            emailSyncService.syncAccount(accountId).catch(err => {
                console.error(`Background sync failed for ${userInfo.email}:`, err);
            });
        }

        // Redirect to frontend success page
        res.redirect(`http://localhost:3000/settings/email?success=true&email=${encodeURIComponent(userInfo.email)}`);
    } catch (error) {
        console.error('Error handling OAuth callback:', error);
        res.redirect(`http://localhost:3000/settings/email?error=true`);
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
 * Trigger manual sync for an account - ACTUALLY SYNCS ALL EMAILS
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

        // Start sync in background (don't block the response)
        console.log(`\n📧 Manual sync triggered for: ${account.email}`);

        // Respond immediately
        res.json({
            message: 'Sync started successfully',
            account_id: accountId,
            email: account.email
        });

        // Actually trigger the full sync in background
        emailSyncService.syncAccount(accountId).catch(err => {
            console.error(`Sync failed for ${account.email}:`, err);
        });

    } catch (error) {
        console.error('Error triggering sync:', error);
        res.status(500).json({ message: 'Error triggering sync' });
    }
};

/**
 * Toggle sync enabled/disabled for an account
 */
export const toggleSync = async (req: Request, res: Response) => {
    try {
        const accountId = parseInt(req.params.id);
        // @ts-ignore
        const userId = req.userId;

        const account = await prisma.emailAccount.findFirst({
            where: { id: accountId, user_id: userId }
        });

        if (!account) {
            return res.status(404).json({ message: 'Email account not found' });
        }

        await prisma.emailAccount.update({
            where: { id: accountId },
            data: { sync_enabled: !account.sync_enabled }
        });

        res.json({
            message: 'Sync toggled successfully',
            sync_enabled: !account.sync_enabled
        });
    } catch (error) {
        console.error('Error toggling sync:', error);
        res.status(500).json({ message: 'Error toggling sync' });
    }
};

export const emailAccountController = {
    initiateOAuth,
    handleOAuthCallback,
    getEmailAccounts,
    disconnectAccount,
    setDefaultAccount,
    triggerSync,
    toggleSync
};
/**
 * Manual sync - trigger immediate email sync for an account
 */
export const syncNow = async (req: Request, res: Response) => {
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

        // Trigger immediate sync
        console.log(`🔄 Manual sync triggered for account ${accountId}`);
        await emailSyncService.syncAccount(accountId);

        res.json({
            message: 'Sync completed successfully',
            account_id: accountId,
            synced_at: new Date()
        });
    } catch (error) {
        console.error('Error in manual sync:', error);
        res.status(500).json({ message: 'Error syncing emails' });
    }
};
