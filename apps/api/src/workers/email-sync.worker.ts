import { emailSyncQueue } from '../lib/queue';
import { emailSyncService } from '../services/email/email-sync.service';
import { prisma } from '../lib/prisma';

export const initEmailSyncWorker = () => {
    console.log('Initializing Email Sync Worker...');

    emailSyncQueue.process('sync-account', async (job) => {
        const { accountId } = job.data;
        console.log(`Processing sync for account ${accountId}`);
        await emailSyncService.syncAccount(accountId);
    });

    emailSyncQueue.process('trigger-all-syncs', async (job) => {
        console.log('Triggering sync for all accounts');
        const accounts = await prisma.emailAccount.findMany({
            where: { sync_enabled: true },
            select: { id: true }
        });

        for (const account of accounts) {
            await emailSyncQueue.add('sync-account', { accountId: account.id });
        }
    });

    // Schedule the recurring job if not exists
    emailSyncQueue.getRepeatableJobs().then(jobs => {
        const exists = jobs.find(j => j.key.includes('trigger-all-syncs'));
        if (!exists) {
            emailSyncQueue.add('trigger-all-syncs', {}, {
                repeat: { cron: '*/5 * * * *' }
            });
            console.log('Scheduled returning sync job');
        }
    });
};
