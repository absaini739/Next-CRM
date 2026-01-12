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

        // Sync each account
        for (const account of accounts) {
            await emailSyncService.syncAccount(account.id);
        }

        console.log(`✅ Sync completed for all accounts of user ${userId}`);
        return { success: true, userId, accountCount: accounts.length };
    } catch (error: any) {
        console.error(`❌ Sync failed for user ${userId}:`, error.message);
        throw error;
    }
});

// Periodic sync job - runs every 15 minutes
emailSyncQueue.process('periodic-sync', async (job) => {
    console.log('🔄 Running periodic sync for all users');

    try {
        // Get all enabled email accounts
        const accounts = await prisma.emailAccount.findMany({
            where: { sync_enabled: true },
            select: { id: true, email: true, user_id: true },
        });

        console.log(`Found ${accounts.length} accounts to sync`);

        // Sync each account
        let successCount = 0;
        let failCount = 0;

        for (const account of accounts) {
            try {
                await emailSyncService.syncAccount(account.id);
                successCount++;
            } catch (error: any) {
                console.error(`Failed to sync account ${account.email}:`, error.message);
                failCount++;
            }
        }

        console.log(`✅ Periodic sync completed: ${successCount} success, ${failCount} failed`);
        return { success: true, successCount, failCount, total: accounts.length };
    } catch (error: any) {
        console.error('❌ Periodic sync failed:', error.message);
        throw error;
    }
});

// Add periodic sync job (every 15 minutes)
export const startPeriodicSync = async () => {
    // Remove existing repeatable jobs first
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
                cron: '*/2 * * * *', // Every 2 minutes (faster sync)
            },
            jobId: 'periodic-sync-job',
        }
    );

    console.log('✅ Periodic email sync scheduled (every 15 minutes)');
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
