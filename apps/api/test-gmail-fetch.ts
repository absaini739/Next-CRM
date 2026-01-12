import { gmailService } from './src/services/email/gmail.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testGmailFetch() {
    try {
        // Get the Gmail account
        const account = await prisma.emailAccount.findFirst({
            where: { email: 'abhishek79saini@gmail.com' }
        });

        if (!account) {
            console.log('No Gmail account found');
            return;
        }

        console.log(`\n=== Testing Gmail API for ${account.email} ===\n`);

        // Test fetching INBOX messages
        console.log('Fetching INBOX messages...');
        const inboxResult = await gmailService.fetchMessages(account.id, {
            maxResults: 10,
            labelIds: ['INBOX']
        });
        console.log(`INBOX: Found ${inboxResult.messages.length} messages`);
        if (inboxResult.messages.length > 0) {
            console.log('First inbox message labels:', inboxResult.messages[0].labelIds);
        }

        // Test fetching SENT messages
        console.log('\nFetching SENT messages...');
        const sentResult = await gmailService.fetchMessages(account.id, {
            maxResults: 10,
            labelIds: ['SENT']
        });
        console.log(`SENT: Found ${sentResult.messages.length} messages`);
        if (sentResult.messages.length > 0) {
            console.log('First sent message labels:', sentResult.messages[0].labelIds);
        }

        // Test fetching ALL messages
        console.log('\nFetching ALL messages (no label filter)...');
        const allResult = await gmailService.fetchMessages(account.id, {
            maxResults: 10
        });
        console.log(`ALL: Found ${allResult.messages.length} messages`);
        if (allResult.messages.length > 0) {
            allResult.messages.forEach((msg, idx) => {
                const parsed = gmailService.parseMessage(msg);
                console.log(`  ${idx + 1}. ${parsed.subject} - Labels: ${JSON.stringify(msg.labelIds)}`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testGmailFetch();
