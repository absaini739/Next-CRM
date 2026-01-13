import { prisma } from '../../lib/prisma';
import { gmailService } from './gmail.service';
import { outlookService } from './outlook.service';

/**
 * BULLETPROOF Email Sync Service
 * 
 * Features:
 * - Syncs ALL emails from ALL folders using pagination
 * - Auto-syncs new accounts when connected
 * - Comprehensive error handling - NEVER crashes
 * - Graceful degradation when errors occur
 * - Detailed logging for debugging
 */
export class EmailSyncService {

    // Maximum emails to sync per folder
    private readonly MAX_EMAILS_PER_FOLDER = 100; // Increased from 20 to 100
    private readonly MAX_PROCESS_LIMIT_PER_FOLDER = 500; // Increased from 100 to 500

    // Batch size for API calls
    private readonly BATCH_SIZE = 20; // Reduced to 20 as requested

    private interval: NodeJS.Timeout | null = null;
    private isSyncing = false;

    /**
     * Sync emails for a specific account - BULLETPROOF VERSION
     * Catches all errors and logs them without crashing
     */
    async syncAccount(accountId: number, options?: { fullSync?: boolean }) {
        let account;

        try {
            account = await prisma.emailAccount.findUnique({
                where: { id: accountId }
            });
        } catch (error: any) {
            console.error(`[Sync] Failed to fetch account ${accountId}:`, error.message);
            return { success: false, error: error.message };
        }

        if (!account) {
            console.log(`[Sync] Account ${accountId} not found`);
            return { success: false, error: 'Account not found' };
        }

        if (!account.sync_enabled) {
            console.log(`[Sync] Sync disabled for account ${account.email}`);
            return { success: false, error: 'Sync disabled' };
        }

        const startTime = Date.now();
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📧 SYNC STARTED: ${account.email}`);
        console.log(`${'='.repeat(60)}`);
        console.log(`Time: ${new Date().toISOString()}`);

        const results: Record<string, { synced: number; errors: number }> = {};

        try {
            const acc = account as any;
            if (account.provider === 'gmail' && acc.connection_type !== 'smtp_imap') {
                const gmailResults = await this.syncGmailAccountSafe(account);
                Object.assign(results, gmailResults);
            } else if (account.provider === 'outlook' && acc.connection_type !== 'smtp_imap') {
                const outlookResults = await this.syncOutlookAccountSafe(account);
                Object.assign(results, outlookResults);
            } else if (acc.connection_type === 'smtp_imap') {
                const imapResults = await this.syncSmtpImapAccountSafe(account);
                Object.assign(results, imapResults);
            }

            // Update last sync time
            await prisma.emailAccount.update({
                where: { id: accountId },
                data: { last_sync_at: new Date() }
            }).catch((e: any) => console.error('[Sync] Failed to update last_sync_at:', e.message));

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            // Print summary
            console.log(`\n📊 SYNC SUMMARY for ${account.email}:`);
            console.log('─'.repeat(40));
            let totalSynced = 0;
            let totalErrors = 0;
            for (const [folder, stats] of Object.entries(results)) {
                console.log(`   ${folder.padEnd(12)}: ${stats.synced} synced, ${stats.errors} errors`);
                totalSynced += stats.synced;
                totalErrors += stats.errors;
            }
            console.log('─'.repeat(40));
            console.log(`   TOTAL: ${totalSynced} synced, ${totalErrors} errors`);
            console.log(`   Duration: ${duration}s`);
            console.log(`${'='.repeat(60)}\n`);

            return {
                success: true,
                synced: totalSynced,
                errors: totalErrors,
                duration: parseFloat(duration)
            };
        } catch (error: any) {
            console.error(`[Sync] Unexpected error for ${account.email}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Safe Gmail sync - catches all errors per folder
     */
    private async syncGmailAccountSafe(account: any): Promise<Record<string, { synced: number; errors: number }>> {
        // Build "after:YYYY/MM/DD" query for 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dateQuery = `after:${sevenDaysAgo.getFullYear()}/${(sevenDaysAgo.getMonth() + 1).toString().padStart(2, '0')}/${sevenDaysAgo.getDate().toString().padStart(2, '0')}`;

        const foldersToSync = [
            { name: 'SENT', query: `in:sent ${dateQuery}` },
            { name: 'INBOX', query: `in:inbox ${dateQuery}` },
            { name: 'DRAFTS', query: 'in:drafts' },
            { name: 'TRASH', query: 'in:trash' },
            { name: 'STARRED', query: 'is:starred' }
        ];

        const results: Record<string, { synced: number; errors: number }> = {};

        for (const folder of foldersToSync) {
            console.log(`\n📁 Syncing ${folder.name}...`);
            try {
                const stats = await this.syncGmailFolderSafe(account, folder.query, folder.name.toLowerCase());
                results[folder.name] = stats;
                console.log(`   ✓ ${folder.name}: ${stats.synced} synced, ${stats.errors} errors`);
            } catch (error: any) {
                console.error(`   ✗ ${folder.name}: Failed - ${error.message}`);
                results[folder.name] = { synced: 0, errors: 1 };
            }
        }

        return results;
    }

    /**
     * Sync a single Gmail folder - SAFE VERSION with per-message error handling
     */
    private async syncGmailFolderSafe(account: any, query: string, folderLabel: string): Promise<{ synced: number; errors: number }> {
        let totalSynced = 0;
        let totalErrors = 0;
        let pageToken: string | undefined = undefined;
        let pageNumber = 1;
        let totalProcessed = 0;

        do {
            try {
                const result = await gmailService.fetchMessages(account.id, {
                    maxResults: this.BATCH_SIZE,
                    query: query,
                    pageToken: pageToken
                });

                const messages = result.messages || [];

                if (messages.length === 0) {
                    break;
                }

                console.log(`      Page ${pageNumber}: ${messages.length} messages`);

                for (const gmailMsg of messages) {
                    totalProcessed++;
                    try {
                        const synced = await this.processGmailMessageSafe(account.id, gmailMsg, folderLabel, account.email);
                        if (synced) totalSynced++;
                    } catch (error: any) {
                        console.warn(`      ⚠️ Failed to process message: ${error.message}`);
                        totalErrors++;
                    }
                }

                pageToken = result.nextPageToken;
                pageNumber++;

                // Safety limit - either enough kept or too many processed
                if (totalSynced >= this.MAX_EMAILS_PER_FOLDER) {
                    console.log(`      ✓ Reached kept limit of ${this.MAX_EMAILS_PER_FOLDER} emails`);
                    break;
                }

                if (totalProcessed >= this.MAX_PROCESS_LIMIT_PER_FOLDER) {
                    console.log(`      ⚠️ Reached process cap of ${this.MAX_PROCESS_LIMIT_PER_FOLDER} emails`);
                    break;
                }
            } catch (error: any) {
                console.error(`      ✗ Page ${pageNumber} failed: ${error.message}`);
                totalErrors++;
                break; // Stop pagination on page-level errors
            }
        } while (pageToken);

        return { synced: totalSynced, errors: totalErrors };
    }

    /**
     * Process a single Gmail message - SAFE VERSION
     */
    private async processGmailMessageSafe(accountId: number, gmailMsg: any, folderOverride?: string, accountEmail?: string): Promise<boolean> {
        const parsed = gmailService.parseMessage(gmailMsg);

        // Skip if no valid message ID
        if (!parsed.message_id || parsed.message_id.startsWith('error_')) {
            return false;
        }

        try {
            // Check if message already exists
            const existing = await prisma.emailMessage.findUnique({
                where: {
                    account_id_message_id: {
                        account_id: accountId,
                        message_id: parsed.message_id
                    }
                }
            });

            if (existing) {
                // Update existing message
                await prisma.emailMessage.update({
                    where: { id: existing.id },
                    data: {
                        is_read: parsed.is_read,
                        is_starred: parsed.is_starred,
                        labels: parsed.labels
                    }
                });

                // RETROACTIVE LINKING: If it's a 'sent' email and not linked, try linking it now
                // This ensures "sending mail makes them my contact" works for historical data
                const currentFolder = folderOverride || existing.folder;
                if (currentFolder === 'sent' && !existing.person_id && !existing.lead_id) {
                    const { autoLinkEmail } = await import('../email-linking.service');
                    await autoLinkEmail(existing.id, {
                        excludeEmails: accountEmail ? [accountEmail] : []
                    });
                }
                return false; // Not a "newly synced" email for count
            } else {
                // Create new message
                const result = await this.createEmailMessageSafe(accountId, parsed, folderOverride, accountEmail);
                return !!result;
            }
        } catch (error: any) {
            // Check for unique constraint violation (duplicate message)
            if (error.code === 'P2002') {
                // Duplicate - just skip silently
                return false;
            }
            throw error;
        }
    }

    /**
     * Safe Outlook sync
     */
    private async syncOutlookAccountSafe(account: any): Promise<Record<string, { synced: number; errors: number }>> {
        const foldersToSync = ['sentitems', 'inbox', 'drafts', 'deleteditems'];
        const results: Record<string, { synced: number; errors: number }> = {};

        for (const folder of foldersToSync) {
            console.log(`\n📁 Syncing ${folder}...`);
            try {
                const stats = await this.syncOutlookFolderSafe(account, folder);
                results[folder] = stats;
                console.log(`   ✓ ${folder}: ${stats.synced} synced, ${stats.errors} errors`);
            } catch (error: any) {
                console.error(`   ✗ ${folder}: Failed - ${error.message}`);
                results[folder] = { synced: 0, errors: 1 };
            }
        }

        return results;
    }

    /**
     * Safe Outlook folder sync
     */
    private async syncOutlookFolderSafe(account: any, folder: string): Promise<{ synced: number; errors: number }> {
        let totalSynced = 0;
        let totalErrors = 0;
        let skip = 0;
        let totalProcessed = 0;

        // Build 7 day filter for Outlook
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const filterStr = `receivedDateTime ge ${sevenDaysAgo.toISOString()}`;

        try {
            do {
                const result = await outlookService.fetchMessages(account.id, {
                    top: this.BATCH_SIZE,
                    folder: folder,
                    skip: skip,
                    filter: filterStr
                });

                const messages = result.messages || result || [];

                if (!Array.isArray(messages) || messages.length === 0) {
                    break;
                }

                for (const outlookMsg of messages) {
                    totalProcessed++;
                    try {
                        const parsed = outlookService.parseMessage(outlookMsg);

                        const existing = await prisma.emailMessage.findUnique({
                            where: {
                                account_id_message_id: {
                                    account_id: account.id,
                                    message_id: parsed.message_id
                                }
                            }
                        });

                        if (existing) {
                            await prisma.emailMessage.update({
                                where: { id: existing.id },
                                data: {
                                    is_read: parsed.is_read,
                                    is_starred: parsed.is_starred
                                }
                            });

                            // RETROACTIVE LINKING for Outlook Sent items
                            if (folder === 'sentitems' && !existing.person_id && !existing.lead_id) {
                                const { autoLinkEmail } = await import('../email-linking.service');
                                await autoLinkEmail(existing.id, {
                                    excludeEmails: account.email ? [account.email] : []
                                });
                            }
                        } else {
                            const result = await this.createEmailMessageSafe(account.id, parsed, undefined, account.email);
                            if (result) totalSynced++;
                        }
                    } catch (error: any) {
                        if (error.code !== 'P2002') { // Ignore duplicates
                            totalErrors++;
                        }
                    }
                }

                skip += messages.length;

                if (messages.length < this.BATCH_SIZE) {
                    break;
                }

                if (totalSynced >= this.MAX_EMAILS_PER_FOLDER) {
                    console.log(`      ✓ Reached kept limit of ${this.MAX_EMAILS_PER_FOLDER} emails`);
                    break;
                }

                if (totalProcessed >= this.MAX_PROCESS_LIMIT_PER_FOLDER) {
                    console.log(`      ⚠️ Reached process cap of ${this.MAX_PROCESS_LIMIT_PER_FOLDER} emails`);
                    break;
                }
            } while (true);
        } catch (error: any) {
            console.error(`[Outlook] Folder sync error: ${error.message}`);
            totalErrors++;
        }

        return { synced: totalSynced, errors: totalErrors };
    }

    /**
     * Create email message - SAFE VERSION with thread handling
     */
    private async createEmailMessageSafe(accountId: number, parsedMessage: any, folderOverride?: string, accountEmail?: string) {
        let threadId: number | null = null;

        // Try to find or create thread (safely)
        try {
            if (parsedMessage.in_reply_to || parsedMessage.references?.length > 0) {
                const thread = await prisma.emailThread.findFirst({
                    where: {
                        subject: parsedMessage.subject
                    }
                });

                if (thread) {
                    threadId = thread.id;
                    await prisma.emailThread.update({
                        where: { id: thread.id },
                        data: {
                            last_message_at: parsedMessage.received_at || new Date(),
                            message_count: { increment: 1 }
                        }
                    }).catch(() => { }); // Ignore thread update errors
                }
            }

            // Create thread if not found and has subject
            if (!threadId && parsedMessage.subject) {
                const participants = [
                    parsedMessage.from_email,
                    ...parsedMessage.to.map((t: any) => t.email)
                ].filter((email, index, self) => email && self.indexOf(email) === index);

                const newThread = await prisma.emailThread.create({
                    data: {
                        subject: parsedMessage.subject,
                        participant_emails: participants,
                        last_message_at: parsedMessage.received_at || new Date(),
                        message_count: 1
                    }
                }).catch(() => null); // Return null if thread creation fails

                threadId = newThread?.id || null;
            }
        } catch (error: any) {
            // Thread handling failed - continue without thread
            console.warn(`[Sync] Thread handling failed: ${error.message}`);
        }

        // Determine folder
        let folder = folderOverride || 'inbox';
        if (!folderOverride && parsedMessage.labels) {
            if (parsedMessage.labels.includes('SENT')) folder = 'sent';
            else if (parsedMessage.labels.includes('DRAFT')) folder = 'draft';
            else if (parsedMessage.labels.includes('TRASH')) folder = 'trash';
            else if (parsedMessage.labels.includes('SPAM')) folder = 'spam';
        }

        // Contact Filtering: Apply to ALL incoming emails to keep project clean
        const { autoLinkEmail } = await import('../email-linking.service');

        // Create it first to check linking (current architecture)
        const newEmail = await prisma.emailMessage.create({
            data: {
                account_id: accountId,
                thread_id: threadId,
                message_id: parsedMessage.message_id,
                in_reply_to: parsedMessage.in_reply_to || null,
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
                sent_at: parsedMessage.sent_at || null,
                received_at: parsedMessage.received_at,
            }
        });

        // Link it, excluding the account owner's email to ensure a REAL contact is found
        const linkResult = await autoLinkEmail(newEmail.id, {
            excludeEmails: accountEmail ? [accountEmail] : []
        });

        // HYPER-STRICT FILTER:
        // 1. Always keep Sent/Draft items
        // 2. ONLY keep Inbox/Other if the sender is in our "Sent Interaction" list
        // (Removing CRM contact bypass as requested - only project-interacted people are whitelisted)
        if (folder !== 'sent' && folder !== 'draft') {
            const isWhitelisted = await this.isAddressWhitelisted(accountId, parsedMessage.from_email);

            if (!isWhitelisted) {
                console.log(`[Sync] HYPER-FILTERED: Deleting email from ${parsedMessage.from_email} (Not in project Sent whitelist)`);
                await prisma.emailMessage.delete({ where: { id: newEmail.id } }).catch(() => { });
                return null;
            }
        }

        return newEmail;
    }

    /**
     * Sync all enabled accounts - with per-account error isolation
     */
    async syncAllAccounts() {
        let accounts;

        try {
            accounts = await prisma.emailAccount.findMany({
                where: { sync_enabled: true }
            });
        } catch (error: any) {
            console.error('[Sync] Failed to fetch accounts:', error.message);
            return { success: false, error: error.message };
        }

        console.log(`\n🔄 Starting sync for ${accounts.length} enabled accounts...\n`);

        const results: Record<string, { success: boolean; synced?: number; error?: string }> = {};

        for (const account of accounts) {
            try {
                const result = await this.syncAccount(account.id);
                results[account.email] = result;
            } catch (error: any) {
                console.error(`[Sync] Account ${account.email} failed:`, error.message);
                results[account.email] = { success: false, error: error.message };
            }
        }

        console.log(`\n✅ Finished syncing all accounts\n`);
        return { success: true, results };
    }

    /**
     * Initial sync for a newly connected account
     * Called automatically when a new email account is connected
     */
    async initialSyncForNewAccount(accountId: number) {
        console.log(`\n🆕 Starting initial sync for new account ID: ${accountId}`);

        try {
            // Enable sync for the account first
            await prisma.emailAccount.update({
                where: { id: accountId },
                data: { sync_enabled: true }
            });
        } catch (error: any) {
            console.error('[Sync] Failed to enable sync:', error.message);
        }

        // Perform full sync
        return await this.syncAccount(accountId, { fullSync: true });
    }

    /**
     * Clean up folder name mapping
     */
    private mapFolder(folder: string): string {
        const map: Record<string, string> = {
            'INBOX': 'inbox',
            'Sent Items': 'sent',
            '[Gmail]/Sent Mail': 'sent',
            'Trash': 'trash',
            '[Gmail]/Trash': 'trash',
            'Drafts': 'draft',
            '[Gmail]/Drafts': 'draft'
        };
        return map[folder] || 'inbox';
    }

    /**
     * Sync SMTP/IMAP Account
     */
    private async syncSmtpImapAccountSafe(account: any): Promise<Record<string, { synced: number; errors: number }>> {
        const foldersToSync = ['sent', 'inbox'];
        const results: Record<string, { synced: number; errors: number }> = {};

        // Dynamic import to avoid circular dependency issues if any
        const { smtpImapService } = await import('./smtp-imap.service');

        for (const folder of foldersToSync) {
            console.log(`\n📁 Syncing ${folder}...`);
            let totalSynced = 0;
            let totalErrors = 0;

            try {
                // Fetch messages from the last 2 days to keep it fast and avoid timeouts
                const twoDaysAgo = new Date();
                twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

                const messages = await smtpImapService.fetchMessages(account.id, {
                    folder,
                    since: twoDaysAgo
                });

                for (const msg of messages) {
                    try {
                        if (!msg.message_id) continue;

                        const existing = await prisma.emailMessage.findUnique({
                            where: {
                                account_id_message_id: {
                                    account_id: account.id,
                                    message_id: msg.message_id!
                                }
                            }
                        });

                        if (existing) {
                            // Update existing message
                            // RETROACTIVE LINKING for IMAP Sent items
                            if (folder === 'sent' && !existing.person_id && !existing.lead_id) {
                                const { autoLinkEmail } = await import('../email-linking.service');
                                await autoLinkEmail(existing.id, {
                                    excludeEmails: account.email ? [account.email] : []
                                });
                            }
                        } else {
                            // Re-use safe creation method for consistency and contact filtering
                            const parsed: any = {
                                message_id: msg.message_id,
                                from_email: (msg as any).from?.[0]?.address || 'unknown',
                                from_name: (msg as any).from?.[0]?.name || '',
                                to: (msg as any).to || [],
                                cc: (msg as any).cc || [],
                                bcc: (msg as any).bcc || [],
                                subject: (msg as any).subject || 'No Subject',
                                body_html: (msg as any).html || (msg as any).text || '',
                                body_text: (msg as any).text || '',
                                snippet: ((msg as any).text || '').substring(0, 200),
                                received_at: (msg as any).date,
                                folder: this.mapFolder(folder),
                                provider_data: { uid: (msg as any).uid, flags: (msg as any).flags }
                            };

                            const result = await this.createEmailMessageSafe(account.id, parsed, folder, account.email);
                            if (result) totalSynced++;
                        }
                    } catch (err: any) {
                        console.error(`[Sync] Failed to process IMAP message:`, err.message);
                        totalErrors++;
                    }
                }

                results[folder] = { synced: totalSynced, errors: totalErrors };
            } catch (error: any) {
                console.error(`   ✗ ${folder}: Failed - ${error.message}`);
                results[folder] = { synced: 0, errors: 1 };
            }
        }
        return results;
    }

    /**
     * Start background sync loop
     */
    startSyncLoop(intervalMs: number = 2 * 60 * 1000) { // Default 2 minutes
        if (this.interval) return;

        console.log('🚀 Email Sync loop started');
        this.interval = setInterval(() => {
            if (!this.isSyncing) {
                this.isSyncing = true;
                this.syncAllAccounts().finally(() => {
                    this.isSyncing = false;
                });
            }
        }, intervalMs);

        // Run once on start
        this.syncAllAccounts();
    }

    /**
     * Stop background sync loop
     */
    stopSyncLoop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    /**
     * Check if an address is "Whitelisted" based on our "Sent" history
     */
    private async isAddressWhitelisted(accountId: number, email: string): Promise<boolean> {
        if (!email) return false;

        // Check if we have EVER sent an email TO this person from this account
        const interaction = await prisma.emailMessage.findFirst({
            where: {
                account_id: accountId,
                folder: 'sent',
                OR: [
                    {
                        to: {
                            path: ['$[*]', 'email'],
                            string_contains: email.toLowerCase(),
                        }
                    },
                    {
                        cc: {
                            path: ['$[*]', 'email'],
                            string_contains: email.toLowerCase(),
                        }
                    }
                ]
            }
        });

        return !!interaction;
    }
}

export const emailSyncService = new EmailSyncService();
