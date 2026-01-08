import Queue from 'bull';

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
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

export const scheduleEmailSync = async (accountId: number) => {
    await emailSyncQueue.add('sync-account', { accountId });
};

export const scheduleRecurringSync = async () => {
    // Schedule a job that runs every 5 minutes to trigger sync for all accounts
    await emailSyncQueue.add('trigger-all-syncs', {}, {
        repeat: {
            cron: '*/5 * * * *' // Every 5 minutes
        }
    });
};
