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

    // Create Default Lead Pipeline
    const defaultPipeline = await prisma.leadPipeline.create({
        data: {
            name: 'Default Pipeline',
            is_default: true,
        },
    });

    // Create Lead Stages
    const leadStages = [
        { name: 'New', pipeline_id: defaultPipeline.id },
        { name: 'Contacted', pipeline_id: defaultPipeline.id },
        { name: 'Qualified', pipeline_id: defaultPipeline.id },
        { name: 'Lost', pipeline_id: defaultPipeline.id },
        { name: 'Won', pipeline_id: defaultPipeline.id },
    ];

    for (const stage of leadStages) {
        await prisma.leadStage.create({ data: stage });
    }

    // Create Default Deal Pipeline
    const defaultDealPipeline = await prisma.dealPipeline.create({
        data: {
            name: 'Standard Pipeline',
            is_default: true,
        },
    });

    // Create Deal Stages
    const dealStages = [
        { name: 'Qualified', pipeline_id: defaultDealPipeline.id, probability: 20 },
        { name: 'Proposal', pipeline_id: defaultDealPipeline.id, probability: 40 },
        { name: 'Negotiation', pipeline_id: defaultDealPipeline.id, probability: 60 },
        { name: 'Closing', pipeline_id: defaultDealPipeline.id, probability: 80 },
        { name: 'Closed Won', pipeline_id: defaultDealPipeline.id, probability: 100 },
        { name: 'Closed Lost', pipeline_id: defaultDealPipeline.id, probability: 0 },
    ];

    for (const stage of dealStages) {
        await prisma.dealStage.create({ data: stage });
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
