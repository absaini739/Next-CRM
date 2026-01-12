"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function debugGmailFetch() {
    try {
        const account = await prisma.emailAccount.findFirst({
            where: { email: 'abhishek79saini@gmail.com' }
        });
        if (!account) {
            console.log('No account found');
            process.exit(1);
        }
        const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
        oauth2Client.setCredentials({
            access_token: account.access_token,
            refresh_token: account.refresh_token
        });
        const gmail = googleapis_1.google.gmail({ version: 'v1', auth: oauth2Client });
        console.log('\n=== Testing Gmail API ===\n');
        // Test 1: Fetch with INBOX label
        console.log('Test 1: Fetching with labelIds: ["INBOX"]');
        const inbox = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 10,
            labelIds: ['INBOX']
        });
        console.log(`Result: ${inbox.data.messages?.length || 0} messages`);
        console.log('Messages:', inbox.data.messages?.slice(0, 3));
        // Test 2: Fetch with SENT label
        console.log('\nTest 2: Fetching with labelIds: ["SENT"]');
        const sent = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 10,
            labelIds: ['SENT']
        });
        console.log(`Result: ${sent.data.messages?.length || 0} messages`);
        // Test 3: Fetch without label filter
        console.log('\nTest 3: Fetching without label filter');
        const all = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 10
        });
        console.log(`Result: ${all.data.messages?.length || 0} messages`);
        // Test 4: Get labels
        console.log('\nTest 4: Getting all labels');
        const labels = await gmail.users.labels.list({ userId: 'me' });
        console.log('Available labels:', labels.data.labels?.map(l => l.name).join(', '));
    }
    catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
    finally {
        await prisma.$disconnect();
    }
}
debugGmailFetch();
