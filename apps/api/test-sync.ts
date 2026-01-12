import { emailSyncService } from './src/services/email/email-sync.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSync() {
    try {
        const account = await prisma.emailAccount.findFirst({
            where: { email: 'abhishek79saini@gmail.com' }
        });

        if (!account) {
            console.log('No account found');
            return;
        }

        console.log(`Testing sync for account ID: ${account.id}\n`);
        await emailSyncService.syncAccount(account.id);
        console.log('\nSync test complete!');

    } catch (error: any) {
        console.error('Error:', error.message);
        console.error(error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testSync();
