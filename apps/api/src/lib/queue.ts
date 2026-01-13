import { emailSyncQueue } from '../queues/email-sync.queue';

export { emailSyncQueue };

export const scheduleEmailSync = async (accountId: number) => {
    await emailSyncQueue.add('sync-account', { accountId });
};

export const scheduleRecurringSync = async () => {
    // Schedule a job that runs every 2 minutes to trigger sync for all accounts
    await emailSyncQueue.add('periodic-sync', {}, {
        repeat: {
            cron: '*/2 * * * *' // Every 2 minutes
        }
    });
};
