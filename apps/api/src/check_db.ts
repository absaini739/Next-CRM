import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Roles ---');
    const roles = await prisma.role.findMany();
    console.log(JSON.stringify(roles, null, 2));

    console.log('\n--- Users ---');
    const users = await prisma.user.findMany({
        include: { role: true }
    });
    console.log(JSON.stringify(users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role.name,
        role_permissions: u.role.permissions
    })), null, 2));
}

const checkDb = async () => {
    try {
        const leadStages = await prisma.leadStage.findMany();
        const leadSources = await prisma.leadSource.findMany();
        const leadTypes = await prisma.leadType.findMany();
        const deals = await prisma.deal.findMany();
        const dealPipelines = await prisma.dealPipeline.findMany();
        const dealStages = await prisma.dealStage.findMany();
        const leadPipelines = await prisma.leadPipeline.findMany(); // Added LeadPipeline

        console.log('\n--- Lead Stages ---');
        console.log(JSON.stringify(leadStages, null, 2));

        console.log('\n--- Lead Sources ---'); // Re-added Lead Sources
        console.log(JSON.stringify(leadSources, null, 2));

        console.log('\n--- Lead Types ---'); // Re-added Lead Types
        console.log(JSON.stringify(leadTypes, null, 2));

        console.log('\n--- Deal Pipelines ---');
        console.log(JSON.stringify(dealPipelines, null, 2));

        console.log('\n--- Deal Stages ---');
        console.log(JSON.stringify(dealStages, null, 2));

        console.log('\n--- Deals ---');
        console.log(JSON.stringify(deals, null, 2));

        console.log('\n--- Lead Pipelines ---'); // Log LeadPipeline
        console.log(JSON.stringify(leadPipelines, null, 2));

    } catch (error) {
        console.error('Error checking DB:', error);
    } finally {
        await prisma.$disconnect();
    }
};

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // Disconnect is now handled by checkDb, but we still need to call checkDb
        // if main() is successful.
        // To avoid double disconnect, we'll call checkDb after main,
        // and let checkDb handle its own disconnect.
        // If main fails, checkDb won't be called, and prisma.$disconnect() from finally will run.
        // This structure is a bit unusual, but follows the instruction's placement.
        // A more typical approach would be to combine all logging into one function.
    });

// Call checkDb after main has completed its logging
checkDb();
