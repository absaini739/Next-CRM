import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // Create Role
    const adminRole = await prisma.role.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Administrator',
            permission_type: 'all',
            permissions: { all: true },
        },
    });

    console.log('Created Role:', adminRole);

    // Create Admin User
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            name: 'Admin',
            email: 'admin@example.com',
            password: await bcrypt.hash('admin123', 10),
            role_id: adminRole.id,
            status: true,
        },
    });

    console.log('Created User:', adminUser);

    // Create Lead Sources
    const leadSources = [
        { name: 'Website' },
        { name: 'Referral' },
        { name: 'Cold Call' },
    ];

    for (const source of leadSources) {
        await prisma.leadSource.create({ data: source });
    }

    // Create Lead Types
    const leadTypes = [
        { name: 'New Business' },
        { name: 'Existing Customer' },
    ];

    for (const type of leadTypes) {
        await prisma.leadType.create({ data: type });
    }

    // Create Lead Stages
    // Note: Schema has LeadStage model, but also LeadPipelineStage via LeadPipeline.
    // We'll seed generic LeadStage for now as per schema if used, or PipelineStages.
    // The schema has `model LeadStage`.
    const leadStages = [
        { name: 'New' },
        { name: 'Contacted' },
        { name: 'Qualified' },
        { name: 'Lost' },
        { name: 'Won' },
    ];

    for (const stage of leadStages) {
        await prisma.leadStage.create({ data: stage });
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
