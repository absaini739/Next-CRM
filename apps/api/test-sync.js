"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const email_sync_service_1 = require("./src/services/email/email-sync.service");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
        await email_sync_service_1.emailSyncService.syncAccount(account.id);
        console.log('\nSync test complete!');
    }
    catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    }
    finally {
        await prisma.$disconnect();
    }
}
testSync();
