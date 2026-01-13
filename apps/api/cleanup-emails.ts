import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanup() {
    console.log('🧹 Cleaning up unlinked emails...');

    // Delete emails that have no person_id AND no lead_id AND no deal_id
    const result = await prisma.emailMessage.deleteMany({
        where: {
            AND: [
                { person_id: null },
                { lead_id: null },
                { deal_id: null }
            ]
        }
    });

    console.log(`✅ Deleted ${result.count} unlinked emails.`);
    await prisma.$disconnect();
}

cleanup().catch(err => {
    console.error(err);
    process.exit(1);
});
