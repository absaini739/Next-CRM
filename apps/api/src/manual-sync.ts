import { prisma } from './lib/prisma';
import { emailSyncService } from './services/email/email-sync.service';

async function manualSync() {
    try {
        console.log('Starting manual email sync...');

        // Get all email accounts
        const accounts = await prisma.emailAccount.findMany({
            where: { sync_enabled: true }
        });

        console.log(`Found ${accounts.length} accounts to sync`);

        for (const account of accounts) {
            console.log(`\nSyncing account: ${account.email} (ID: ${account.id})`);
            try {
                await emailSyncService.syncAccount(account.id);
                console.log(`✓ Successfully synced ${account.email}`);
            } catch (error: any) {
                console.error(`✗ Failed to sync ${account.email}:`, error.message);
            }
        }

        // Check results
        const emailCount = await prisma.emailMessage.groupBy({
            by: ['folder', 'account_id'],
            _count: { id: true }
        });

        console.log('\n=== Email Count by Folder ===');
        emailCount.forEach(row => {
            console.log(`Account ${row.account_id} - ${row.folder}: ${row._count.id} emails`);
        });

        console.log('\nSync completed!');
        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

manualSync();
