import Queue from 'bull';
import { emailSyncService } from '../services/email/email-sync.service';
import { prisma } from '../lib/prisma';

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
};

export const emailSyncQueue = new Queue('email-sync', {
    redis: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 200, // Keep last 200 failed jobs
    },
});

// Process sync jobs
emailSyncQueue.process('sync-account', async (job) => {
    const { accountId } = job.data;
    console.log(`🔄 Processing sync for account ${accountId}`);

    try {
        await emailSyncService.syncAccount(accountId);
        console.log(`✅ Sync completed for account ${accountId}`);
        return { success: true, accountId };
    } catch (error: any) {
        console.error(`❌ Sync failed for account ${accountId}:`, error.message);
        throw error; // Bull will retry
    }
});

// Process sync all accounts for a user
emailSyncQueue.process('sync-all-accounts', async (job) => {
    const { userId } = job.data;
    console.log(`🔄 Processing sync for all accounts of user ${userId}`);

    try {
        // Get all accounts for user
        const accounts = await prisma.emailAccount.findMany({
            where: { user_id: userId, sync_enabled: true },
        });

        console.log(`Found ${accounts.length} accounts to sync for user ${userId}`);

        // Sync each account by adding individual jobs to the queue
        for (const account of accounts) {
            await emailSyncQueue.add('sync-account', { accountId: account.id });
        }

        console.log(`✅ Sync jobs queued for all accounts of user ${userId}`);
        return { success: true, userId, accountCount: accounts.length };
    } catch (error: any) {
        console.error(`❌ Sync failed for user ${userId}:`, error.message);
        throw error;
    }
});

// Periodic sync job - triggers individual sync-account jobs for all enabled accounts
const processPeriodicSync = async (job: any) => {
    console.log('🔄 Running sync for all enabled accounts');

    try {
        const accounts = await prisma.emailAccount.findMany({
            where: { sync_enabled: true },
            select: { id: true, email: true },
        });

        console.log(`Found ${accounts.length} accounts to sync`);

        for (const account of accounts) {
            await emailSyncQueue.add('sync-account', { accountId: account.id });
        }

        console.log(`✅ Sync jobs queued for ${accounts.length} accounts`);
        return { success: true, count: accounts.length };
    } catch (error: any) {
        console.error('❌ Sync failed:', error.message);
        throw error;
    }
};

emailSyncQueue.process('periodic-sync', processPeriodicSync);

// Legacy handler for 'trigger-all-syncs' to prevent "Missing process handler" errors
emailSyncQueue.process('trigger-all-syncs', processPeriodicSync);

// Add periodic sync job (every 2 minutes)
export const startPeriodicSync = async () => {
    // Remove existing repeatable jobs first to avoid duplicates or old formats
    const repeatableJobs = await emailSyncQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
        await emailSyncQueue.removeRepeatableByKey(job.key);
    }

    // Add new periodic job
    await emailSyncQueue.add(
        'periodic-sync',
        {},
        {
            repeat: {
                cron: '*/2 * * * *', // Every 2 minutes
            },
            jobId: 'periodic-sync-job',
        }
    );

    console.log('✅ Periodic email sync scheduled (every 2 minutes)');
};

// Queue event listeners
emailSyncQueue.on('completed', (job, result) => {
    console.log(`✅ Job ${job.id} completed:`, result);
});

emailSyncQueue.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
});

emailSyncQueue.on('error', (error) => {
    console.error('❌ Queue error:', error);
});

export default emailSyncQueue;
